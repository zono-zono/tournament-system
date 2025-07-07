'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
// import { SortableContext, arrayMove } from '@dnd-kit/sortable' // 未使用のためコメントアウト
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button' // 未使用のためコメントアウト
import { Clock, MapPin, Calendar } from 'lucide-react'
// import { DraggableMatch } from './draggable-match' // 未使用のためコメントアウト
import { DroppableTimeSlot } from './droppable-time-slot'
import { DroppableVenue } from './droppable-venue'
import { updateMatchSchedule } from '@/lib/actions/schedule'
import { toast } from 'sonner'

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

interface TimeSlot {
  id: string
  time: string
  matches: MatchData[]
}

interface Venue {
  id: string
  name: string
  matches: MatchData[]
}

interface TournamentScheduleBoardProps {
  matches: MatchData[]
  onMatchUpdate: (matchId: string, updates: Partial<MatchData>) => void
  isOrganizer: boolean
}

export function TournamentScheduleBoard({
  matches,
  onMatchUpdate,
  isOrganizer
}: TournamentScheduleBoardProps) {
  // const [activeId, setActiveId] = useState<string | null>(null) // 未使用のためコメントアウト
  const [unscheduledMatches, setUnscheduledMatches] = useState<MatchData[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  // 初期データの設定
  useEffect(() => {
    // 未スケジュールの試合を分離
    const unscheduled = matches.filter(match => 
      !match.scheduled_time || !match.venue
    )
    setUnscheduledMatches(unscheduled)

    // 時間スロットの初期化
    const initialTimeSlots: TimeSlot[] = []
    for (let hour = 9; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const slotMatches = matches.filter(match => 
          match.scheduled_time === time && 
          match.scheduled_date === selectedDate
        )
        initialTimeSlots.push({
          id: `time-${time}`,
          time,
          matches: slotMatches
        })
      }
    }
    setTimeSlots(initialTimeSlots)

    // 会場の初期化
    const venueNames = ['コート1', 'コート2', 'コート3', 'コート4']
    const initialVenues: Venue[] = venueNames.map(name => ({
      id: `venue-${name}`,
      name,
      matches: matches.filter(match => 
        match.venue === name && 
        match.scheduled_date === selectedDate
      )
    }))
    setVenues(initialVenues)
  }, [matches, selectedDate])

  const handleDragStart = (_event: DragStartEvent) => {
    // setActiveId(event.active.id as string) // activeIdが未使用のためコメントアウト
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    // setActiveId(null) // activeIdが未使用のためコメントアウト

    if (!over || !isOrganizer) return

    const activeMatch = matches.find(match => match.id === active.id)
    if (!activeMatch) return

    const overId = over.id as string
    let updates: Partial<MatchData> = {}

    // 時間スロットへのドロップ
    if (overId.startsWith('time-')) {
      const time = overId.replace('time-', '')
      updates = {
        scheduled_time: time,
        scheduled_date: selectedDate
      }
    }

    // 会場と時間の組み合わせへのドロップ
    if (overId.startsWith('venue-') && overId.includes('-time-')) {
      const parts = overId.split('-time-')
      const venue = parts[0].replace('venue-', '')
      const time = parts[1]
      updates = {
        venue: venue,
        scheduled_time: time,
        scheduled_date: selectedDate
      }
    }

    // 未スケジュールエリアへのドロップ
    if (overId === 'unscheduled') {
      updates = {
        scheduled_time: null,
        scheduled_date: null,
        venue: null
      }
    }

    // データベースを更新
    try {
      const result = await updateMatchSchedule(activeMatch.id, updates)
      if (result.success) {
        onMatchUpdate(activeMatch.id, updates)
        toast.success('スケジュールを更新しました')
      } else {
        toast.error(result.error || 'スケジュールの更新に失敗しました')
      }
    } catch (_error) {
      toast.error('スケジュールの更新に失敗しました')
    }
  }

  const handleDragOver = (_event: DragOverEvent) => {
    // 必要に応じてドラッグオーバー時の処理を追加
  }

  const getTotalScheduledMatches = () => {
    return matches.filter(match => 
      match.scheduled_time && 
      match.venue && 
      match.scheduled_date === selectedDate
    ).length
  }

  const getMatchesForTimeAndVenue = (time: string, venue: string) => {
    return matches.filter(match => 
      match.scheduled_time === time && 
      match.venue === venue && 
      match.scheduled_date === selectedDate
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">対戦スケジュール</h2>
          <Badge variant="outline">
            {getTotalScheduledMatches()}/{matches.length} 試合スケジュール済み
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 未スケジュール試合エリア */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                未スケジュール試合
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 min-h-[200px]">
                <DroppableTimeSlot
                  id="unscheduled"
                  matches={unscheduledMatches}
                  time=""
                  isUnscheduled={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* スケジュールグリッド */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  会場・時間割
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* ヘッダー行 */}
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      <div className="font-medium text-center p-2">時間</div>
                      {venues.map(venue => (
                        <div key={venue.id} className="font-medium text-center p-2">
                          {venue.name}
                        </div>
                      ))}
                    </div>

                    {/* 時間スロット */}
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {timeSlots.map(timeSlot => (
                        <div key={timeSlot.id} className="grid grid-cols-5 gap-2">
                          <div className="flex items-center justify-center p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium">{timeSlot.time}</span>
                          </div>
                          {venues.map(venue => (
                            <DroppableVenue
                              key={`${timeSlot.id}-${venue.id}`}
                              id={`${timeSlot.time}-${venue.name}`}
                              matches={getMatchesForTimeAndVenue(timeSlot.time, venue.name)}
                              venue={venue.name}
                              time={timeSlot.time}
                              isOrganizer={isOrganizer}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DndContext>

      {/* 操作ガイド */}
      {isOrganizer && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 space-y-2">
              <h3 className="font-medium">操作方法:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>左側の「未スケジュール試合」から試合をドラッグして、時間と会場のマス目にドロップしてください</li>
                <li>既にスケジュールされた試合も別の時間・会場に移動できます</li>
                <li>試合を「未スケジュール」エリアに戻すこともできます</li>
                <li>日付を変更して複数日程のスケジュールを管理できます</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}