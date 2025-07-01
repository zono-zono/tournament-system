'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/types/database'

type Match = Database['public']['Tables']['matches']['Row']
type MatchInsert = Database['public']['Tables']['matches']['Insert']
type MatchUpdate = Database['public']['Tables']['matches']['Update']

export async function generateTournamentBracket(tournamentId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  // Check if user is the organizer
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('organizer_id, status')
    .eq('id', tournamentId)
    .single()

  if (!tournament || tournament.organizer_id !== user.id) {
    throw new Error('Only tournament organizers can generate brackets')
  }

  if (tournament.status !== 'draft') {
    throw new Error('Tournament bracket can only be generated for draft tournaments')
  }

  // Get participants
  const { data: participants } = await supabase
    .from('participants')
    .select('id, user_id, seed')
    .eq('tournament_id', tournamentId)
    .order('seed', { ascending: true, nullsLast: true })

  if (!participants || participants.length < 2) {
    throw new Error('At least 2 participants are required to generate a bracket')
  }

  // Clear existing matches
  await supabase
    .from('matches')
    .delete()
    .eq('tournament_id', tournamentId)

  // Generate single elimination bracket
  const matches = generateSingleEliminationMatches(participants, tournamentId)
  
  // Insert matches
  const { error } = await supabase
    .from('matches')
    .insert(matches)

  if (error) {
    throw new Error(`Failed to generate bracket: ${error.message}`)
  }

  // Update tournament status to ongoing
  await supabase
    .from('tournaments')
    .update({ status: 'ongoing' })
    .eq('id', tournamentId)

  revalidatePath(`/dashboard/tournaments/${tournamentId}`)
}

function generateSingleEliminationMatches(participants: any[], tournamentId: string): MatchInsert[] {
  const matches: MatchInsert[] = []
  const totalParticipants = participants.length
  
  // Calculate number of rounds needed
  const totalRounds = Math.ceil(Math.log2(totalParticipants))
  
  // Find the next power of 2 that's >= participants count
  const nextPowerOf2 = Math.pow(2, totalRounds)
  
  // Number of byes (empty slots in first round)
  const byes = nextPowerOf2 - totalParticipants
  
  // First round matches
  let currentMatches: MatchInsert[] = []
  let matchNumberInRound = 1
  
  // Create first round
  for (let i = 0; i < totalParticipants; i += 2) {
    const player1 = participants[i]
    const player2 = i + 1 < totalParticipants ? participants[i + 1] : null
    
    // If there's no player2, player1 gets a bye (automatically advances)
    if (!player2) {
      // Create a bye match (only player1, winner is automatically player1)
      const match: MatchInsert = {
        tournament_id: tournamentId,
        round_number: 1,
        match_number_in_round: matchNumberInRound,
        player1_id: player1.id,
        player2_id: null,
        winner_id: player1.id, // Automatic win due to bye
        status: 'completed',
        next_match_id: null // Will be filled later
      }
      currentMatches.push(match)
    } else {
      // Normal match
      const match: MatchInsert = {
        tournament_id: tournamentId,
        round_number: 1,
        match_number_in_round: matchNumberInRound,
        player1_id: player1.id,
        player2_id: player2.id,
        winner_id: null,
        status: 'scheduled',
        next_match_id: null // Will be filled later
      }
      currentMatches.push(match)
    }
    matchNumberInRound++
  }
  
  matches.push(...currentMatches)
  
  // Generate subsequent rounds
  for (let round = 2; round <= totalRounds; round++) {
    const nextRoundMatches: MatchInsert[] = []
    const matchesInRound = Math.ceil(currentMatches.length / 2)
    
    for (let i = 0; i < matchesInRound; i++) {
      const match: MatchInsert = {
        tournament_id: tournamentId,
        round_number: round,
        match_number_in_round: i + 1,
        player1_id: null, // Will be filled by winners of previous round
        player2_id: null, // Will be filled by winners of previous round
        winner_id: null,
        status: 'scheduled',
        next_match_id: null // Will be filled in next iteration (if not final)
      }
      nextRoundMatches.push(match)
    }
    
    // Link current round matches to next round
    for (let i = 0; i < currentMatches.length; i += 2) {
      const nextMatchIndex = Math.floor(i / 2)
      if (nextMatchIndex < nextRoundMatches.length) {
        currentMatches[i].next_match_id = `next_${round}_${nextMatchIndex + 1}` // Temporary ID
        if (i + 1 < currentMatches.length) {
          currentMatches[i + 1].next_match_id = `next_${round}_${nextMatchIndex + 1}` // Temporary ID
        }
      }
    }
    
    matches.push(...nextRoundMatches)
    currentMatches = nextRoundMatches
  }
  
  return matches
}

export async function updateMatchResult(matchId: string, winnerId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  // Get match details and verify permissions
  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      tournaments!matches_tournament_id_fkey(organizer_id)
    `)
    .eq('id', matchId)
    .single()

  if (!match || match.tournaments?.organizer_id !== user.id) {
    throw new Error('Only tournament organizers can update match results')
  }

  if (match.status === 'completed') {
    throw new Error('Match is already completed')
  }

  // Verify winner is one of the players
  if (match.player1_id !== winnerId && match.player2_id !== winnerId) {
    throw new Error('Winner must be one of the match participants')
  }

  // Update match result
  const { error } = await supabase
    .from('matches')
    .update({
      winner_id: winnerId,
      status: 'completed'
    })
    .eq('id', matchId)

  if (error) {
    throw new Error(`Failed to update match result: ${error.message}`)
  }

  // Advance winner to next round if applicable
  if (match.next_match_id) {
    await advanceWinnerToNextRound(match.tournament_id, matchId, winnerId)
  }

  revalidatePath(`/dashboard/tournaments/${match.tournament_id}`)
}

async function advanceWinnerToNextRound(tournamentId: string, currentMatchId: string, winnerId: string) {
  const supabase = await createClient()

  // Find the next match
  const { data: currentMatch } = await supabase
    .from('matches')
    .select('next_match_id, round_number, match_number_in_round')
    .eq('id', currentMatchId)
    .single()

  if (!currentMatch?.next_match_id) return

  // For now, we'll implement a simple logic to find the next match
  // In a real implementation, you'd have a more sophisticated system
  const { data: nextMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round_number', currentMatch.round_number + 1)
    .order('match_number_in_round')

  if (nextMatches && nextMatches.length > 0) {
    const nextMatchIndex = Math.floor((currentMatch.match_number_in_round - 1) / 2)
    const nextMatch = nextMatches[nextMatchIndex]

    if (nextMatch) {
      // Determine if winner goes to player1 or player2 slot
      const isPlayer1Slot = (currentMatch.match_number_in_round - 1) % 2 === 0

      await supabase
        .from('matches')
        .update({
          [isPlayer1Slot ? 'player1_id' : 'player2_id']: winnerId
        })
        .eq('id', nextMatch.id)
    }
  }
}

export async function getMatches(tournamentId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      player1:participants!matches_player1_id_fkey(
        id,
        user:users!participants_user_id_fkey(username)
      ),
      player2:participants!matches_player2_id_fkey(
        id,
        user:users!participants_user_id_fkey(username)
      ),
      winner:participants!matches_winner_id_fkey(
        id,
        user:users!participants_user_id_fkey(username)
      )
    `)
    .eq('tournament_id', tournamentId)
    .order('round_number')
    .order('match_number_in_round')

  if (error) {
    throw new Error(`Failed to fetch matches: ${error.message}`)
  }

  return data
}