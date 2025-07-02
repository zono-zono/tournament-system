"use client";

import { useState, useEffect } from "react";
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

interface EditTournamentFormProps {
  tournamentId: string;
  initialTournament?: Tournament;
}

export default function EditTournamentForm({ tournamentId, initialTournament }: EditTournamentFormProps) {
  const router = useRouter();
  
  const [tournament, setTournament] = useState<Tournament | null>(initialTournament || null);
  const [isLoading, setIsLoading] = useState(!initialTournament);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: initialTournament?.name || "",
    description: initialTournament?.description || "",
    start_date: initialTournament?.start_date?.split('T')[0] || "",
    end_date: initialTournament?.end_date?.split('T')[0] || "",
    entry_start: initialTournament?.entry_start?.split('T')[0] || "",
    entry_end: initialTournament?.entry_end?.split('T')[0] || "",
    max_participants: initialTournament?.max_participants?.toString() || "",
    min_participants: initialTournament?.min_participants?.toString() || "2",
    entry_fee: initialTournament?.entry_fee?.toString() || "0",
    venue: initialTournament?.venue || "",
    status: initialTournament?.status || "draft" as const,
  });

  useEffect(() => {
    if (!initialTournament) {
      fetchTournament();
    }
  }, [tournamentId, initialTournament]);

  const fetchTournament = async () => {
    try {
      const supabase = createClient();
      const { data: tournament, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single();

      if (error) {
        setError("大会の読み込みに失敗しました");
        console.error("Error fetching tournament:", error);
        return;
      }

      if (!tournament) {
        setError("大会が見つかりません");
        return;
      }

      setTournament(tournament);
      
      // フォームデータを更新
      setFormData({
        name: tournament.name,
        description: tournament.description || "",
        start_date: tournament.start_date?.split('T')[0] || "",
        end_date: tournament.end_date?.split('T')[0] || "",
        entry_start: tournament.entry_start?.split('T')[0] || "",
        entry_end: tournament.entry_end?.split('T')[0] || "",
        max_participants: tournament.max_participants?.toString() || "",
        min_participants: tournament.min_participants?.toString() || "2",
        entry_fee: tournament.entry_fee?.toString() || "0",
        venue: tournament.venue || "",
        status: tournament.status,
      });
    } catch (err) {
      setError("大会の読み込み中にエラーが発生しました");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from("tournaments")
        .update({
          name: formData.name,
          description: formData.description || null,
          start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
          entry_start: formData.entry_start ? new Date(formData.entry_start).toISOString() : null,
          entry_end: formData.entry_end ? new Date(formData.entry_end).toISOString() : null,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
          min_participants: parseInt(formData.min_participants),
          entry_fee: parseInt(formData.entry_fee),
          venue: formData.venue || null,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tournamentId);

      if (error) {
        setError("大会の更新に失敗しました");
        console.error("Error updating tournament:", error);
        return;
      }

      // 成功時にダッシュボードにリダイレクト
      router.push(`/dashboard/tournaments/${tournamentId}`);
    } catch (err) {
      setError("更新中にエラーが発生しました");
      console.error("Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>読み込み中...</CardTitle>
            </CardHeader>
            <CardContent>
              <p>大会情報を読み込んでいます</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>エラー</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">{error}</p>
              <Button asChild>
                <Link href="/dashboard/tournaments">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  大会一覧に戻る
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href={`/dashboard/tournaments/${tournamentId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              大会詳細に戻る
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">大会編集</h1>
          <p className="text-muted-foreground">大会の詳細情報を編集できます</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>大会情報</CardTitle>
            <CardDescription>
              大会の基本情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">大会名 *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="大会名を入力"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="大会の説明を入力"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">開始日</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">終了日</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entry_start">エントリー開始日</Label>
                  <Input
                    id="entry_start"
                    type="date"
                    value={formData.entry_start}
                    onChange={(e) => setFormData(prev => ({ ...prev, entry_start: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entry_end">エントリー終了日</Label>
                  <Input
                    id="entry_end"
                    type="date"
                    value={formData.entry_end}
                    onChange={(e) => setFormData(prev => ({ ...prev, entry_end: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_participants">最小参加者数 *</Label>
                  <Input
                    id="min_participants"
                    type="number"
                    min="2"
                    value={formData.min_participants}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_participants: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_participants">最大参加者数</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="2"
                    value={formData.max_participants}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
                    placeholder="制限なし"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entry_fee">参加費 (円)</Label>
                  <Input
                    id="entry_fee"
                    type="number"
                    min="0"
                    value={formData.entry_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, entry_fee: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">会場</Label>
                <Input
                  id="venue"
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder="会場名・住所"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">ステータス</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      status: value as "draft" | "published" | "ongoing" | "completed" | "cancelled"
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">下書き</SelectItem>
                    <SelectItem value="published">公開</SelectItem>
                    <SelectItem value="ongoing">進行中</SelectItem>
                    <SelectItem value="completed">完了</SelectItem>
                    <SelectItem value="cancelled">中止</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "保存中..." : "変更を保存"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/dashboard/tournaments/${tournamentId}`)}
                  disabled={isSaving}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}