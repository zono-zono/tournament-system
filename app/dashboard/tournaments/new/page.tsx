"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTournamentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    entry_start: "",
    entry_end: "",
    max_participants: "",
    min_participants: "2",
    entry_fee: "0",
    venue: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // 現在のユーザーを取得
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("ログインが必要です");
      }

      // フォームデータの検証
      if (!formData.name.trim()) {
        throw new Error("大会名は必須です");
      }

      // 日付の形式変換（YYYY-MM-DD -> ISO string）
      const formatDateTime = (dateStr: string, timeStr: string = "00:00") => {
        if (!dateStr) return null;
        return new Date(`${dateStr}T${timeStr}:00`).toISOString();
      };

      const tournamentData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        start_date: formatDateTime(formData.start_date),
        end_date: formatDateTime(formData.end_date),
        entry_start: formatDateTime(formData.entry_start),
        entry_end: formatDateTime(formData.entry_end),
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        min_participants: parseInt(formData.min_participants),
        entry_fee: parseFloat(formData.entry_fee),
        venue: formData.venue.trim() || null,
        status: "draft" as const,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from("tournaments")
        .insert(tournamentData)
        .select()
        .single();

      if (error) throw error;

      router.push(`/dashboard/tournaments/${data.id}`);
    } catch (error) {
      console.error("Tournament creation error:", error);
      setError(error instanceof Error ? error.message : "大会の作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="space-y-8">
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
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="例: 2024年春季トーナメント"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="大会の詳細説明を入力してください"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="venue">会場</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => handleInputChange("venue", e.target.value)}
                placeholder="例: 東京体育館"
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
              大会の開催期間とエントリー期間を設定してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">開始日</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange("start_date", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">終了日</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange("end_date", e.target.value)}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="entry_start">エントリー開始日</Label>
                <Input
                  id="entry_start"
                  type="date"
                  value={formData.entry_start}
                  onChange={(e) => handleInputChange("entry_start", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entry_end">エントリー終了日</Label>
                <Input
                  id="entry_end"
                  type="date"
                  value={formData.entry_end}
                  onChange={(e) => handleInputChange("entry_end", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 参加者設定 */}
        <Card>
          <CardHeader>
            <CardTitle>参加者設定</CardTitle>
            <CardDescription>
              参加者数の制限と参加費を設定してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min_participants">最小参加者数 *</Label>
                <Input
                  id="min_participants"
                  type="number"
                  min="2"
                  value={formData.min_participants}
                  onChange={(e) => handleInputChange("min_participants", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_participants">最大参加者数</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="2"
                  value={formData.max_participants}
                  onChange={(e) => handleInputChange("max_participants", e.target.value)}
                  placeholder="制限なしの場合は空欄"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entry_fee">参加費（円）</Label>
                <Input
                  id="entry_fee"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.entry_fee}
                  onChange={(e) => handleInputChange("entry_fee", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* エラー表示 */}
        {error && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* アクション */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "作成中..." : "大会を作成"}
          </Button>
        </div>
      </form>
    </div>
  );
}