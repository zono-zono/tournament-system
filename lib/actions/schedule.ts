'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/lib/types/database'

type MatchUpdate = Database['public']['Tables']['matches']['Update']

export async function updateMatchSchedule(
  matchId: string,
  updates: {
    scheduled_time?: string | null
    scheduled_date?: string | null
    venue?: string | null
  }
) {
  if (process.env.NODE_ENV === 'development') {
    console.log('1. updateMatchSchedule called with:', { matchId, updates });
  }
  const supabase = await createClient()

  try {
    // 現在のユーザーを取得
    if (process.env.NODE_ENV === 'development') {
      console.log('2. Getting user...');
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User fetch error:', userError);
      throw new Error('認証されていません')
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('3. User found:', user.id);
    }

    // 試合の取得とトーナメント主催者の確認
    if (process.env.NODE_ENV === 'development') {
      console.log('4. Fetching match and tournament organizer...');
    }
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        tournaments!inner (
          organizer_id
        )
      `)
      .eq('id', matchId)
      .single()

    if (matchError) {
      console.error('Match fetch error:', matchError);
      throw new Error('試合が見つかりません')
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('5. Match data:', match);
    }

    // 主催者のみが編集可能
    if (match.tournaments.organizer_id !== user.id) {
      console.error('Authorization error: Organizer ID does not match User ID');
      throw new Error('この操作を実行する権限がありません')
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('6. Authorization successful.');
    }

    // 試合スケジュールの更新
    if (process.env.NODE_ENV === 'development') {
      console.log('7. Updating match schedule...');
    }
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        scheduled_time: updates.scheduled_time,
        scheduled_date: updates.scheduled_date,
        venue: updates.venue,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId)

    if (updateError) {
      console.error('DB update error:', updateError);
      throw new Error('スケジュールの更新に失敗しました')
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('8. Match schedule updated successfully.');
    }

    // キャッシュを更新
    revalidatePath('/tournaments/[id]', 'page')

    return { success: true }
  } catch (error) {
    console.error('スケジュール更新エラー:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'スケジュールの更新に失敗しました'
    }
  }
}

export async function getMatchesWithSchedule(tournamentId: string) {
  const supabase = await createClient()

  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:participants!matches_player1_id_fkey (
          id,
          users (
            id,
            username
          )
        ),
        player2:participants!matches_player2_id_fkey (
          id,
          users (
            id,
            username
          )
        ),
        winner:participants!matches_winner_id_fkey (
          id,
          users (
            id,
            username
          )
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('round_number', { ascending: true })
      .order('match_number_in_round', { ascending: true })

    if (error) {
      throw new Error('試合データの取得に失敗しました')
    }

    // データの整形
    const formattedMatches = matches.map(match => ({
      id: match.id,
      tournament_id: match.tournament_id,
      round_number: match.round_number,
      match_number_in_round: match.match_number_in_round,
      player1_id: match.player1_id,
      player2_id: match.player2_id,
      winner_id: match.winner_id,
      status: match.status,
      scheduled_time: match.scheduled_time,
      scheduled_date: match.scheduled_date,
      venue: match.venue,
      player1_name: match.player1?.users?.username || null,
      player2_name: match.player2?.users?.username || null,
      winner_name: match.winner?.users?.username || null,
      created_at: match.created_at,
      updated_at: match.updated_at
    }))

    return { success: true, matches: formattedMatches }
  } catch (error) {
    console.error('試合データ取得エラー:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '試合データの取得に失敗しました',
      matches: []
    }
  }
}

export async function checkScheduleConflicts(
  tournamentId: string,
  venue: string,
  scheduledTime: string,
  scheduledDate: string,
  excludeMatchId?: string
) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('matches')
      .select('id, round_number, match_number_in_round')
      .eq('tournament_id', tournamentId)
      .eq('venue', venue)
      .eq('scheduled_time', scheduledTime)
      .eq('scheduled_date', scheduledDate)

    if (excludeMatchId) {
      query = query.neq('id', excludeMatchId)
    }

    const { data: conflicts, error } = await query

    if (error) {
      throw new Error('スケジュール競合チェックに失敗しました')
    }

    return {
      success: true,
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts
    }
  } catch (error) {
    console.error('スケジュール競合チェックエラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'スケジュール競合チェックに失敗しました',
      hasConflicts: false,
      conflicts: []
    }
  }
}