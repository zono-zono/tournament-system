'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Clock, MapPin, GripVertical } from 'lucide-react'

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

interface DraggableMatchProps {
  match: MatchData
  isDragging?: boolean
  isOrganizer?: boolean
  isCompact?: boolean
}

export function DraggableMatch({ match, isDragging, isOrganizer, isCompact = false }: DraggableMatchProps) {
  try {
    console.log('DraggableMatch レンダリング開始:', { 
      matchId: match?.id, 
      player1_name: match?.player1_name,
      player2_name: match?.player2_name,
      isCompact,
      isOrganizer,
      matchKeys: match ? Object.keys(match) : 'match is null'
    });
  } catch (error) {
    console.error('DraggableMatch ログエラー:', error);
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggableActive
  } = useDraggable({
    id: match.id,
    disabled: !isOrganizer,
    data: {
      type: 'match',
      match
    }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging || isDraggableActive ? 0.5 : 1,
    zIndex: isDraggableActive ? 1000 : 'auto'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'スケジュール済み'
      case 'in_progress':
        return '進行中'
      case 'completed':
        return '完了'
      default:
        return '未定'
    }
  }

  try {
    if (isCompact) {
      return (
        <Card
          ref={setNodeRef}
          style={style}
          className={`cursor-grab active:cursor-grabbing transition-all duration-200 border-l-4 border-l-primary/50 ${
            isDragging || isDraggableActive ? 'shadow-lg ring-2 ring-primary/20' : 'hover:shadow-md'
          } ${!isOrganizer ? 'cursor-default' : ''}`}
        >
          <CardContent className="p-2 flex items-center gap-2" {...attributes} {...listeners}>
            <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">
                R{match.round_number}-{match.match_number_in_round}
              </div>
              <div className="text-sm font-medium truncate">
                {match.player1_name || 'TBD'} vs {match.player2_name || 'TBD'}
              </div>
            </div>
            <Badge className={getStatusColor(match.status)} variant="secondary">
              {getStatusText(match.status)}
            </Badge>
          </CardContent>
        </Card>
      );
    }
  } catch (error) {
    console.error('DraggableMatch コンパクト表示エラー:', error);
    return (
      <div className="p-2 border border-red-300 bg-red-50 text-red-700 text-sm">
        エラー: 試合表示に失敗しました (ID: {match?.id})
      </div>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragging || isDraggableActive ? 'shadow-lg scale-105' : 'hover:shadow-md'
      } ${!isOrganizer ? 'cursor-default' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* ドラッグハンドルとラウンド情報 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOrganizer && (
                <GripVertical className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-600">
                R{match.round_number} - M{match.match_number_in_round}
              </span>
            </div>
            <Badge className={getStatusColor(match.status)}>
              {getStatusText(match.status)}
            </Badge>
          </div>

          {/* 対戦者情報 */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-gray-400" />
              <span className="text-sm">
                {match.player1_name || 'TBD'}
              </span>
            </div>
            <div className="text-xs text-gray-500 ml-5">vs</div>
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-gray-400" />
              <span className="text-sm">
                {match.player2_name || 'TBD'}
              </span>
            </div>
          </div>

          {/* スケジュール情報 */}
          {(match.scheduled_time || match.venue) && (
            <div className="pt-2 border-t space-y-1">
              {match.scheduled_time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {match.scheduled_time}
                  </span>
                </div>
              )}
              {match.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {match.venue}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}