'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus } from 'lucide-react'
import { addParticipantByOrganizer } from '@/lib/actions/participants'
import { toast } from 'sonner'

interface AddParticipantFormProps {
  tournamentId: string
  onParticipantAdded: () => void
}

export function AddParticipantForm({ tournamentId, onParticipantAdded }: AddParticipantFormProps) {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      toast.error('ユーザー名を入力してください')
      return
    }

    setIsLoading(true)
    try {
      const result = await addParticipantByOrganizer(tournamentId, username.trim())
      if (result.success) {
        toast.success(result.message)
        setUsername('')
        onParticipantAdded()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '参加者の追加に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          参加者を追加
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">ユーザー名</Label>
            <Input
              id="username"
              type="text"
              placeholder="追加するユーザー名を入力"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              利用可能なユーザー: test, koki
            </p>
          </div>
          <Button type="submit" disabled={isLoading || !username.trim()}>
            {isLoading ? '追加中...' : '参加者を追加'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}