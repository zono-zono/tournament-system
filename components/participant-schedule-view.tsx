'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button' // 未使用のためコメントアウト
import { Calendar, Clock, MapPin, User, Trophy, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

interface ParticipantScheduleViewProps {
  matches: MatchData[]
  participantId: string
  participantName: string
  tournamentName: string
}

export function ParticipantScheduleView({
  matches,
  participantId,
  participantName,
  tournamentName
}: ParticipantScheduleViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // 参加者の試合を取得
  const participantMatches = matches.filter(match => 
    match.player1_id === participantId || match.player2_id === participantId
  )

  // フィルターされた試合を取得
  const filteredMatches = participantMatches.filter(match => {
    const dateMatch = !match.scheduled_date || match.scheduled_date === selectedDate
    const statusMatch = statusFilter === 'all' || match.status === statusFilter
    return dateMatch && statusMatch
  })

  // 日付別にグループ化
  const matchesByDate = filteredMatches.reduce((acc, match) => {
    const date = match.scheduled_date || '未定'
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(match)
    return acc
  }, {} as Record<string, MatchData[]>)

  // 時間順でソート
  const sortMatchesByTime = (matches: MatchData[]) => {
    return matches.sort((a, b) => {
      if (!a.scheduled_time && !b.scheduled_time) return 0
      if (!a.scheduled_time) return 1
      if (!b.scheduled_time) return -1
      return a.scheduled_time.localeCompare(b.scheduled_time)
    })
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

  const getOpponentName = (match: MatchData) => {
    if (match.player1_id === participantId) {
      return match.player2_name || 'TBD'
    } else {
      return match.player1_name || 'TBD'
    }
  }

  const isWinner = (match: MatchData) => {
    return match.winner_id === participantId
  }

  const getNextMatch = () => {
    return participantMatches.find(match => 
      match.status === 'scheduled' && 
      match.scheduled_date && 
      match.scheduled_time
    )
  }

  const nextMatch = getNextMatch()

  const formatTime = (time: string) => {
    return time.substring(0, 5) // HH:MM形式に変換
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{participantName}の試合スケジュール</h2>
          <p className="text-gray-600 mt-1">{tournamentName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {participantMatches.length}試合
          </Badge>
        </div>
      </div>

      {/* 次の試合のハイライト */}
      {nextMatch && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Clock className="w-5 h-5" />
              次の試合
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">
                    vs {getOpponentName(nextMatch)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    ラウンド {nextMatch.round_number} - 試合 {nextMatch.match_number_in_round}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {nextMatch.scheduled_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      {formatDate(nextMatch.scheduled_date)}
                    </span>
                  </div>
                )}
                {nextMatch.scheduled_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      {formatTime(nextMatch.scheduled_time)}
                    </span>
                  </div>
                )}
                {nextMatch.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      {nextMatch.venue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="scheduled">スケジュール済み</SelectItem>
                  <SelectItem value="in_progress">進行中</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 試合一覧 */}
      <div className="space-y-4">
        {Object.entries(matchesByDate).map(([date, matches]) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {date === '未定' ? '日程未定' : formatDate(date)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortMatchesByTime(matches).map(match => (
                  <div
                    key={match.id}
                    className={`p-4 rounded-lg border-2 ${
                      match.status === 'in_progress' 
                        ? 'border-yellow-200 bg-yellow-50' 
                        : match.status === 'completed' && isWinner(match)
                        ? 'border-green-200 bg-green-50'
                        : match.status === 'completed'
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">
                          R{match.round_number} - M{match.match_number_in_round}
                        </span>
                        <Badge className={getStatusColor(match.status)}>
                          {getStatusText(match.status)}
                        </Badge>
                        {match.status === 'completed' && isWinner(match) && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            勝利
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {match.scheduled_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(match.scheduled_time)}</span>
                          </div>
                        )}
                        {match.venue && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{match.venue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-4">
                        <span className={`font-medium ${
                          match.player1_id === participantId ? 'text-blue-600' : ''
                        }`}>
                          {match.player1_name || 'TBD'}
                        </span>
                        <span className="text-gray-500">vs</span>
                        <span className={`font-medium ${
                          match.player2_id === participantId ? 'text-blue-600' : ''
                        }`}>
                          {match.player2_name || 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">選択した条件に該当する試合がありません。</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}