import { createTournament } from "@/lib/actions/tournaments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const runtime = 'edge';

export default function NewTournamentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/tournaments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新しい大会を作成</h1>
          <p className="text-muted-foreground">
            大会の基本情報を入力してください
          </p>
        </div>
      </div>

      <form action={createTournament} className="space-y-8">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>
              大会の名前と説明を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">大会名 *</Label>
              <Input
                id="name"
                name="name"
                placeholder="例: 2024年春季トーナメント"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="大会の詳細説明を入力してください"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 日程設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              日程設定
            </CardTitle>
            <CardDescription>
              大会の開催日を設定してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="start_date">開催日</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
              />
            </div>
          </CardContent>
        </Card>

        {/* アクション */}
        <div className="flex justify-end gap-4">
          <Button asChild type="button" variant="outline">
            <Link href="/dashboard/tournaments">
              キャンセル
            </Link>
          </Button>
          <Button type="submit">
            大会を作成
          </Button>
        </div>
      </form>
    </div>
  );
}