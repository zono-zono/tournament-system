export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string | null
          status: 'draft' | 'ongoing' | 'completed' | 'cancelled'
          organizer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date?: string | null
          status?: 'draft' | 'ongoing' | 'completed' | 'cancelled'
          organizer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          status?: 'draft' | 'ongoing' | 'completed' | 'cancelled'
          organizer_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          tournament_id: string
          user_id: string
          seed: number | null
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          user_id: string
          seed?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          user_id?: string
          seed?: number | null
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          round_number: number
          match_number_in_round: number
          player1_id: string | null
          player2_id: string | null
          winner_id: string | null
          status: 'scheduled' | 'in_progress' | 'completed'
          next_match_id: string | null
          scheduled_time: string | null
          scheduled_date: string | null
          venue: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          round_number: number
          match_number_in_round: number
          player1_id?: string | null
          player2_id?: string | null
          winner_id?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed'
          next_match_id?: string | null
          scheduled_time?: string | null
          scheduled_date?: string | null
          venue?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          round_number?: number
          match_number_in_round?: number
          player1_id?: string | null
          player2_id?: string | null
          winner_id?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed'
          next_match_id?: string | null
          scheduled_time?: string | null
          scheduled_date?: string | null
          venue?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}