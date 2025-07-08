'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/types/database'

type Tournament = Database['public']['Tables']['tournaments']['Row']
type TournamentInsert = Database['public']['Tables']['tournaments']['Insert']
type TournamentUpdate = Database['public']['Tables']['tournaments']['Update']

export async function createTournament(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const start_date = formData.get('start_date') as string

  if (!name) {
    throw new Error('Tournament name is required')
  }

  const tournamentData: TournamentInsert = {
    name,
    description: description || null,
    start_date: start_date || null,
    organizer_id: user.id,
    status: 'draft'
  }

  const { data, error } = await supabase
    .from('tournaments')
    .insert(tournamentData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create tournament: ${error.message}`)
  }

  revalidatePath('/dashboard/tournaments')
  redirect(`/dashboard/tournaments/${data.id}`)
}

export async function updateTournament(id: string, formData: FormData) {
  console.log('1. updateTournament called with id:', id);
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.error('User authentication error:', userError);
    throw new Error('Authentication required')
  }
  console.log('2. User authenticated:', user.id);

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const start_date = formData.get('start_date') as string
  const status = formData.get('status') as 'draft' | 'ongoing' | 'completed' | 'cancelled'

  console.log('3. Form data:', { name, description, start_date, status });

  const updateData: TournamentUpdate = {
    name: name || undefined,
    description: description || null,
    start_date: start_date || null,
    status: status || undefined
  }

  console.log('4. Update data:', updateData);

  // Check if user is the organizer
  const { data: tournament, error: fetchError } = await supabase
    .from('tournaments')
    .select('organizer_id')
    .eq('id', id)
    .single()

  if (fetchError) {
    console.error('Error fetching tournament:', fetchError);
    throw new Error(`Tournament not found: ${fetchError.message}`)
  }

  if (tournament.organizer_id !== user.id) {
    console.error('Authorization error: user is not organizer');
    throw new Error('Only the organizer can update this tournament')
  }

  console.log('5. Authorization successful');

  const { error } = await supabase
    .from('tournaments')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Update error:', error);
    throw new Error(`Failed to update tournament: ${error.message}`)
  }

  console.log('6. Tournament updated successfully');

  revalidatePath('/dashboard/tournaments')
  revalidatePath(`/dashboard/tournaments/${id}`)
}

export async function deleteTournament(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', id)
    .eq('organizer_id', user.id)

  if (error) {
    throw new Error(`Failed to delete tournament: ${error.message}`)
  }

  revalidatePath('/dashboard/tournaments')
  redirect('/dashboard/tournaments')
}

export async function getTournaments() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let query = supabase
    .from('tournaments')
    .select(`
      *,
      organizer:users!tournaments_organizer_id_fkey(username),
      participants(
        id,
        seed,
        user:users!participants_user_id_fkey(username)
      )
    `)
    .order('created_at', { ascending: false })

  if (user) {
    query = query.or(`status.in.(ongoing,completed),organizer_id.eq.${user.id}`)
  } else {
    query = query.in('status', ['ongoing', 'completed'])
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch tournaments: ${error.message}`)
  }

  return data
}

export async function getTournament(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      organizer:users!tournaments_organizer_id_fkey(username),
      participants(
        id,
        seed,
        user:users!participants_user_id_fkey(username)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch tournament: ${error.message}`)
  }

  return data
}