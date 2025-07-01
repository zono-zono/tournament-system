"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Calendar, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

type Tournament = {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "published" | "ongoing" | "completed" | "cancelled";
  start_date: string | null;
  end_date: string | null;
  entry_start: string | null;
  entry_end: string | null;
  max_participants: number | null;
  min_participants: number;
  entry_fee: number;
  venue: string | null;
};

export default function EditTournamentPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    status: "draft" as Tournament["status"],
  });

  useEffect(() => {
    if (tournamentId) {
      fetchTournament();
    }
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("ログインが必要です");
      }

      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .eq("created_by", user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("大会が見つかりません");

      setTournament(data);
      
      // Convert dates to YYYY-MM-DD format for input fields
      const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split('T')[0];
      };

      setFormData({
        name: data.name,
        description: data.description || "",
        start_date: formatDateForInput(data.start_date),
        end_date: formatDateForInput(data.end_date),
        entry_start: formatDateForInput(data.entry_start),
        entry_end: formatDateForInput(data.entry_end),
        max_participants: data.max_participants?.toString() || "",
        min_participants: data.min_participants.toString(),
        entry_fee: data.entry_fee.toString(),
        venue: data.venue || "",
        status: data.status,
      });
    } catch (error) {
      console.error("Tournament fetch error:", error);
      setError(error instanceof Error ? error.message : "大会の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

    setIsSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      
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
        status: formData.status,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("tournaments")
        .update(tournamentData)
        .eq("id", tournament.id);

      if (error) throw error;

      router.push(`/dashboard/tournaments/${tournament.id}`);
    } catch (error) {
      console.error("Tournament update error:", error);
      setError(error instanceof Error ? error.message : "大会の更新に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/tournaments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">大会編集</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600">
                <p className="font-medium">エラーが発生しました</p>
                <p className="text-sm">{error || "大会が見つかりません"}</p>
              </div>
              <Button onClick={fetchTournament}>再試行</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/tournaments/${tournament.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">大会を編集</h1>
          <p className="text-muted-foreground">
            「{tournament.name}」の設定を変更できます
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

        {/* ステータス設定 */}
        <Card>
          <CardHeader>
            <CardTitle>ステータス設定</CardTitle>
            <CardDescription>
              大会の公開状態を設定してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="status">ステータス</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">下書き</SelectItem>
                  <SelectItem value="published">公開中</SelectItem>
                  <SelectItem value="ongoing">進行中</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="cancelled">中止</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {formData.status === "draft" && "下書き状態では参加者からは見えません"}
                {formData.status === "published" && "参加者がエントリーできる状態です"}
                {formData.status === "ongoing" && "大会が進行中の状態です"}
                {formData.status === "completed" && "大会が完了した状態です"}
                {formData.status === "cancelled" && "大会が中止された状態です"}
              </p>
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
            disabled={isSaving}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "保存中..." : "変更を保存"}
          </Button>
        </div>
      </form>
    </div>
  );
}