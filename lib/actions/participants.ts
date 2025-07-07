'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/types/database'

type Participant = Database['public']['Tables']['participants']['Row']
type ParticipantInsert = Database['public']['Tables']['participants']['Insert']

export async function joinTournament(tournamentId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  // Check if user is already participating
  const { data: existingParticipant } = await supabase
    .from('participants')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('user_id', user.id)
    .single()

  if (existingParticipant) {
    throw new Error('You are already participating in this tournament')
  }

  // Check if tournament is accepting participants
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('status')
    .eq('id', tournamentId)
    .single()

  if (!tournament || tournament.status !== 'draft') {
    throw new Error('Tournament is not accepting participants')
  }

  const participantData: ParticipantInsert = {
    tournament_id: tournamentId,
    user_id: user.id,
  }

  const { error } = await supabase
    .from('participants')
    .insert(participantData)

  if (error) {
    throw new Error(`Failed to join tournament: ${error.message}`)
  }

  revalidatePath(`/dashboard/tournaments/${tournamentId}`)
}

export async function leaveTournament(tournamentId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('tournament_id', tournamentId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to leave tournament: ${error.message}`)
  }

  revalidatePath(`/dashboard/tournaments/${tournamentId}`)
}

export async function updateParticipantSeed(participantId: string, seed: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  // Check if user is the organizer of the tournament
  const { data: participant } = await supabase
    .from('participants')
    .select(`
      tournament_id,
      tournaments!participants_tournament_id_fkey(organizer_id)
    `)
    .eq('id', participantId)
    .single()

  if (!participant || participant.tournaments?.organizer_id !== user.id) {
    throw new Error('Only tournament organizers can update seeds')
  }

  const { error } = await supabase
    .from('participants')
    .update({ seed })
    .eq('id', participantId)

  if (error) {
    throw new Error(`Failed to update participant seed: ${error.message}`)
  }

  revalidatePath(`/dashboard/tournaments/${participant.tournament_id}`)
}

export async function addParticipantByOrganizer(tournamentId: string, username: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  // Check if current user is the organizer
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('organizer_id, status')
    .eq('id', tournamentId)
    .single()

  if (!tournament || tournament.organizer_id !== user.id) {
    throw new Error('Only tournament organizers can add participants')
  }

  if (tournament.status !== 'draft') {
    throw new Error('Can only add participants to draft tournaments')
  }

  // Find user by username
  const { data: targetUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (!targetUser) {
    throw new Error(`User with username "${username}" not found`)
  }

  // Check if user is already participating
  const { data: existingParticipant } = await supabase
    .from('participants')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('user_id', targetUser.id)
    .single()

  if (existingParticipant) {
    throw new Error(`User "${username}" is already participating in this tournament`)
  }

  const participantData: ParticipantInsert = {
    tournament_id: tournamentId,
    user_id: targetUser.id,
  }

  const { error } = await supabase
    .from('participants')
    .insert(participantData)

  if (error) {
    throw new Error(`Failed to add participant: ${error.message}`)
  }

  revalidatePath(`/dashboard/tournaments/${tournamentId}`)
  return { success: true, message: `Successfully added "${username}" to the tournament` }
}

export async function getParticipants(tournamentId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('participants')
    .select(`
      *,
      user:users!participants_user_id_fkey(username)
    `)
    .eq('tournament_id', tournamentId)
    .order('seed', { ascending: true, nullsLast: true })

  if (error) {
    throw new Error(`Failed to fetch participants: ${error.message}`)
  }

  return data
}