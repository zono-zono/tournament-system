import { Database } from './database'

// Table types
export type User = Database['public']['Tables']['users']['Row']
export type Tournament = Database['public']['Tables']['tournaments']['Row']
export type TournamentEntry = Database['public']['Tables']['tournament_entries']['Row']
export type Competition = Database['public']['Tables']['competitions']['Row']
export type CompetitionEntry = Database['public']['Tables']['competition_entries']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type Board = Database['public']['Tables']['boards']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type AnnouncementNotification = Database['public']['Tables']['announcement_notifications']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type TournamentInsert = Database['public']['Tables']['tournaments']['Insert']
export type TournamentEntryInsert = Database['public']['Tables']['tournament_entries']['Insert']
export type CompetitionInsert = Database['public']['Tables']['competitions']['Insert']
export type CompetitionEntryInsert = Database['public']['Tables']['competition_entries']['Insert']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']
export type BoardInsert = Database['public']['Tables']['boards']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type AnnouncementNotificationInsert = Database['public']['Tables']['announcement_notifications']['Insert']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type TournamentUpdate = Database['public']['Tables']['tournaments']['Update']
export type TournamentEntryUpdate = Database['public']['Tables']['tournament_entries']['Update']
export type CompetitionUpdate = Database['public']['Tables']['competitions']['Update']
export type CompetitionEntryUpdate = Database['public']['Tables']['competition_entries']['Update']
export type MatchUpdate = Database['public']['Tables']['matches']['Update']
export type BoardUpdate = Database['public']['Tables']['boards']['Update']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']
export type AnnouncementNotificationUpdate = Database['public']['Tables']['announcement_notifications']['Update']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

// Extended types with relations
export type TournamentWithCreator = Tournament & {
  creator: User
  entries_count?: number
  competitions_count?: number
}

export type TournamentWithEntries = Tournament & {
  entries: (TournamentEntry & { user: User })[]
  creator: User
}

export type CompetitionWithDetails = Competition & {
  tournament: Tournament
  entries: (CompetitionEntry & { user: User })[]
  matches: Match[]
}

export type MatchWithPlayers = Match & {
  player1?: User
  player2?: User
  winner?: User
  competition: Competition
}

export type BoardWithContent = Board & {
  tournament: Tournament
}

// Enums
export type UserRole = 'admin' | 'participant'
export type SubscriptionStatus = 'free' | 'paid'
export type TournamentStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
export type EntryStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type CompetitionType = 'tournament' | 'league'
export type CompetitionFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'group_stage'
export type CompetitionStatus = 'draft' | 'active' | 'completed'
export type CompetitionEntryStatus = 'active' | 'eliminated' | 'completed'
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'walkover' | 'cancelled'
export type NotificationType = 'tournament_update' | 'match_scheduled' | 'result_announced' | 'announcement'
export type AnnouncementNotificationType = 'email' | 'line' | 'both'
export type AnnouncementTargetType = 'all_participants' | 'competition_participants'

// API Response types
export type ApiResponse<T> = {
  data: T
  success: true
} | {
  error: string
  success: false
}

// Form types
export type TournamentFormData = {
  name: string
  description?: string
  start_date?: string
  end_date?: string
  entry_start?: string
  entry_end?: string
  max_participants?: number
  min_participants?: number
  entry_fee?: number
  venue?: string
}

export type CompetitionFormData = {
  name: string
  type: CompetitionType
  format: CompetitionFormat
  max_participants?: number
  start_date?: string
  end_date?: string
}

export type BoardFormData = {
  name: string
  position_x?: number
  position_y?: number
  width?: number
  height?: number
  background_color?: string
  text_color?: string
  font_size?: number
  content?: Record<string, unknown>
  is_visible?: boolean
}

export type AnnouncementFormData = {
  title: string
  message: string
  notification_type: AnnouncementNotificationType
  target_type: AnnouncementTargetType
  competition_id?: string
}

// Dashboard stats
export type DashboardStats = {
  total_tournaments: number
  active_tournaments: number
  total_participants: number
  pending_entries: number
}

// Tournament analytics
export type TournamentAnalytics = {
  tournament_id: string
  total_entries: number
  approved_entries: number
  pending_entries: number
  rejected_entries: number
  competitions_count: number
  matches_completed: number
  matches_total: number
  completion_rate: number
}