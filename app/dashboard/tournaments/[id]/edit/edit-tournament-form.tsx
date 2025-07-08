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
  status: "draft" | "ongoing" | "completed" | "cancelled";
  start_date: string | null;
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
      
      console.log("1. Attempting to update tournament:", {
        tournamentId,
        formData,
        updateData: {
          name: formData.name,
          description: formData.description || null,
          start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
          status: formData.status,
          updated_at: new Date().toISOString(),
        }
      });

      const { data, error } = await supabase
        .from("tournaments")
        .update({
          name: formData.name,
          description: formData.description || null,
          start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tournamentId)
        .select();

      console.log("2. Supabase update result:", { data, error });

      if (error) {
        setError("大会の更新に失敗しました");
        console.error("Error updating tournament:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        return;
      }

      console.log("3. Tournament updated successfully");
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
                <Label htmlFor="status">ステータス</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      status: value as "draft" | "ongoing" | "completed" | "cancelled"
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">下書き</SelectItem>
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