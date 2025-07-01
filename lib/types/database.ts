export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          role: 'admin' | 'participant'
          subscription_status: 'free' | 'paid'
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          role?: 'admin' | 'participant'
          subscription_status?: 'free' | 'paid'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          role?: 'admin' | 'participant'
          subscription_status?: 'free' | 'paid'
          stripe_customer_id?: string | null
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
          end_date: string | null
          entry_start: string | null
          entry_end: string | null
          max_participants: number | null
          min_participants: number | null
          entry_fee: number | null
          venue: string | null
          status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          entry_start?: string | null
          entry_end?: string | null
          max_participants?: number | null
          min_participants?: number | null
          entry_fee?: number | null
          venue?: string | null
          status?: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          entry_start?: string | null
          entry_end?: string | null
          max_participants?: number | null
          min_participants?: number | null
          entry_fee?: number | null
          venue?: string | null
          status?: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      tournament_entries: {
        Row: {
          id: string
          tournament_id: string
          user_id: string
          participant_name: string
          contact_info: string | null
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          seed_number: number | null
          entry_date: string
          approved_date: string | null
        }
        Insert: {
          id?: string
          tournament_id: string
          user_id: string
          participant_name: string
          contact_info?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          seed_number?: number | null
          entry_date?: string
          approved_date?: string | null
        }
        Update: {
          id?: string
          tournament_id?: string
          user_id?: string
          participant_name?: string
          contact_info?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          seed_number?: number | null
          entry_date?: string
          approved_date?: string | null
        }
      }
      competitions: {
        Row: {
          id: string
          tournament_id: string
          name: string
          type: 'tournament' | 'league'
          format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'group_stage'
          max_participants: number | null
          status: 'draft' | 'active' | 'completed'
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          name: string
          type: 'tournament' | 'league'
          format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'group_stage'
          max_participants?: number | null
          status?: 'draft' | 'active' | 'completed'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          name?: string
          type?: 'tournament' | 'league'
          format?: 'single_elimination' | 'double_elimination' | 'round_robin' | 'group_stage'
          max_participants?: number | null
          status?: 'draft' | 'active' | 'completed'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      competition_entries: {
        Row: {
          id: string
          competition_id: string
          user_id: string
          seed_number: number | null
          group_name: string | null
          status: 'active' | 'eliminated' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          user_id: string
          seed_number?: number | null
          group_name?: string | null
          status?: 'active' | 'eliminated' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          competition_id?: string
          user_id?: string
          seed_number?: number | null
          group_name?: string | null
          status?: 'active' | 'eliminated' | 'completed'
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          competition_id: string
          round: number
          match_number: number
          player1_id: string | null
          player2_id: string | null
          winner_id: string | null
          score: Record<string, unknown> | null
          court_number: string | null
          scheduled_time: string | null
          actual_start_time: string | null
          actual_end_time: string | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'walkover' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          round: number
          match_number: number
          player1_id?: string | null
          player2_id?: string | null
          winner_id?: string | null
          score?: Record<string, unknown> | null
          court_number?: string | null
          scheduled_time?: string | null
          actual_start_time?: string | null
          actual_end_time?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'walkover' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          competition_id?: string
          round?: number
          match_number?: number
          player1_id?: string | null
          player2_id?: string | null
          winner_id?: string | null
          score?: Record<string, unknown> | null
          court_number?: string | null
          scheduled_time?: string | null
          actual_start_time?: string | null
          actual_end_time?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'walkover' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      boards: {
        Row: {
          id: string
          tournament_id: string
          name: string
          position_x: number
          position_y: number
          width: number
          height: number
          background_color: string
          text_color: string
          font_size: number
          content: Record<string, unknown> | null
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          name: string
          position_x?: number
          position_y?: number
          width?: number
          height?: number
          background_color?: string
          text_color?: string
          font_size?: number
          content?: Record<string, unknown> | null
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          name?: string
          position_x?: number
          position_y?: number
          width?: number
          height?: number
          background_color?: string
          text_color?: string
          font_size?: number
          content?: Record<string, unknown> | null
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          tournament_id: string
          type: 'tournament_update' | 'match_scheduled' | 'result_announced' | 'announcement'
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tournament_id: string
          type: 'tournament_update' | 'match_scheduled' | 'result_announced' | 'announcement'
          title: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tournament_id?: string
          type?: 'tournament_update' | 'match_scheduled' | 'result_announced' | 'announcement'
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      announcement_notifications: {
        Row: {
          id: string
          tournament_id: string
          competition_id: string | null
          title: string
          message: string
          notification_type: 'email' | 'line' | 'both'
          target_type: 'all_participants' | 'competition_participants'
          sent_at: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          competition_id?: string | null
          title: string
          message: string
          notification_type: 'email' | 'line' | 'both'
          target_type: 'all_participants' | 'competition_participants'
          sent_at?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          competition_id?: string | null
          title?: string
          message?: string
          notification_type?: 'email' | 'line' | 'both'
          target_type?: 'all_participants' | 'competition_participants'
          sent_at?: string | null
          created_by?: string
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          user_id: string
          line_user_id: string | null
          email_notifications: boolean
          line_notifications: boolean
          phone_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          line_user_id?: string | null
          email_notifications?: boolean
          line_notifications?: boolean
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          line_user_id?: string | null
          email_notifications?: boolean
          line_notifications?: boolean
          phone_number?: string | null
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