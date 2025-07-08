'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableMatch } from './draggable-match'
import { Plus } from 'lucide-react'

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

interface DroppableTimeSlotProps {
  id: string
  matches: MatchData[]
  time: string
  isUnscheduled?: boolean
}

export function DroppableTimeSlot({ 
  id, 
  matches, 
  isUnscheduled = false 
}: DroppableTimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id
  })

  const matchIds = matches.map(match => match.id)

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[60px] rounded-lg border-2 border-dashed transition-colors ${
        isOver
          ? 'border-blue-500 bg-blue-50'
          : isUnscheduled
          ? 'border-gray-300 bg-gray-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <SortableContext items={matchIds} strategy={verticalListSortingStrategy}>
        <div className="p-2 space-y-2">
          {matches.length > 0 ? (
            matches.map(match => (
              <DraggableMatch
                key={match.id}
                match={match}
                isOrganizer={true}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-12 text-gray-400">
              <Plus className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {isUnscheduled ? '未スケジュール' : 'ドロップしてください'}
              </span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}