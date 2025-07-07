'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableMatch } from './draggable-match'
import { Plus, Clock, MapPin } from 'lucide-react'

interface MatchData {
  id: string
  tournament_id: string
  round_number: number
  match_number_in_round: number
  player1_id: string | null
  player2_id: string | null
  winner_id: string | null
  status: 'scheduled' | 'in_progress' | 'completed'
  player1_name?: string
  player2_name?: string
  venue?: string
  scheduled_time?: string
  scheduled_date?: string
}

interface DroppableVenueProps {
  id: string
  matches: MatchData[]
  venue: string
  time: string
  isOrganizer?: boolean
}

export function DroppableVenue({ 
  matches, 
  venue, 
  time, 
  isOrganizer = false 
}: DroppableVenueProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `venue-${venue}-time-${time}`
  })

  const matchIds = matches.map(match => match.id)
  const hasConflict = matches.length > 1

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[80px] rounded-lg border-2 transition-colors ${
        isOver
          ? 'border-blue-500 bg-blue-50'
          : hasConflict
          ? 'border-red-300 bg-red-50'
          : matches.length > 0
          ? 'border-green-300 bg-green-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <SortableContext items={matchIds} strategy={verticalListSortingStrategy}>
        <div className="p-2 space-y-2">
          {matches.length > 0 ? (
            <>
              {matches.map(match => (
                <DraggableMatch
                  key={match.id}
                  match={match}
                  isOrganizer={isOrganizer}
                />
              ))}
              {hasConflict && (
                <div className="text-xs text-red-600 font-medium text-center">
                  ⚠️ 時間の重複があります
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-16 text-gray-400">
              <Plus className="w-4 h-4 mb-1" />
              <div className="text-xs text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" />
                  <span>{time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{venue}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}