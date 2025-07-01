"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Edit, 
  Settings, 
  ArrowLeft,
  Play,
  Pause,
  Square,
  UserPlus
} from "lucide-react";
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
  created_at: string;
  updated_at: string;
  tournament_entries: TournamentEntry[];
};

type TournamentEntry = {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  user_profiles: {
    username: string;
    email: string;
  };
};

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
        .select(`
          *,
          tournament_entries(
            id,
            user_id,
            status,
            created_at,
            user_profiles(username, email)
          )
        `)
        .eq("id", tournamentId)
        .eq("created_by", user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("大会が見つかりません");

      setTournament(data);
    } catch (error) {
      console.error("Tournament fetch error:", error);
      setError(error instanceof Error ? error.message : "大会の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTournamentStatus = async (newStatus: Tournament["status"]) => {
    if (!tournament) return;

    try {
      setIsUpdating(true);
      const supabase = createClient();

      const { error } = await supabase
        .from("tournaments")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", tournament.id);

      if (error) throw error;

      setTournament(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error("Status update error:", error);
      setError(error instanceof Error ? error.message : "ステータスの更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: Tournament["status"]) => {
    switch (status) {
      case "draft": return "secondary";
      case "published": return "default";
      case "ongoing": return "destructive";
      case "completed": return "outline";
      case "cancelled": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusText = (status: Tournament["status"]) => {
    switch (status) {
      case "draft": return "下書き";
      case "published": return "公開中";
      case "ongoing": return "進行中";
      case "completed": return "完了";
      case "cancelled": return "中止";
      default: return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("ja-JP");
  };

  const getActionButtons = () => {
    if (!tournament) return null;

    const buttons = [];

    switch (tournament.status) {
      case "draft":
        buttons.push(
          <Button 
            key="publish" 
            onClick={() => updateTournamentStatus("published")}
            disabled={isUpdating}
          >
            <Play className="h-4 w-4 mr-2" />
            公開する
          </Button>
        );
        break;
      case "published":
        buttons.push(
          <Button 
            key="start" 
            onClick={() => updateTournamentStatus("ongoing")}
            disabled={isUpdating}
          >
            <Play className="h-4 w-4 mr-2" />
            開始する
          </Button>
        );
        buttons.push(
          <Button 
            key="cancel" 
            variant="outline"
            onClick={() => updateTournamentStatus("cancelled")}
            disabled={isUpdating}
          >
            <Square className="h-4 w-4 mr-2" />
            中止する
          </Button>
        );
        break;
      case "ongoing":
        buttons.push(
          <Button 
            key="complete" 
            onClick={() => updateTournamentStatus("completed")}
            disabled={isUpdating}
          >
            <Square className="h-4 w-4 mr-2" />
            完了する
          </Button>
        );
        break;
    }

    return buttons;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-muted rounded"></div>
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
            <h1 className="text-3xl font-bold tracking-tight">大会詳細</h1>
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

  const approvedEntries = tournament.tournament_entries.filter(entry => entry.status === "approved");
  const pendingEntries = tournament.tournament_entries.filter(entry => entry.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/tournaments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{tournament.name}</h1>
              <Badge variant={getStatusColor(tournament.status)}>
                {getStatusText(tournament.status)}
              </Badge>
            </div>
            {tournament.description && (
              <p className="text-muted-foreground mt-1">{tournament.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getActionButtons()}
          <Button asChild variant="outline">
            <Link href={`/dashboard/tournaments/${tournament.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">参加者数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              {tournament.max_participants 
                ? `/ ${tournament.max_participants}名`
                : "制限なし"
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">承認待ち</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEntries.length}</div>
            <p className="text-xs text-muted-foreground">エントリー申請</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">参加費</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tournament.entry_fee === 0 ? "無料" : `¥${tournament.entry_fee.toLocaleString()}`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">作成日</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatDate(tournament.created_at)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="participants">参加者</TabsTrigger>
          <TabsTrigger value="schedule">スケジュール</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>大会情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">大会名:</span>
                    <span>{tournament.name}</span>
                  </div>
                  {tournament.venue && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">会場:</span>
                      <span>{tournament.venue}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">参加者数:</span>
                    <span>
                      {tournament.min_participants}名以上
                      {tournament.max_participants && ` / ${tournament.max_participants}名以下`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">参加費:</span>
                    <span>
                      {tournament.entry_fee === 0 ? "無料" : `¥${tournament.entry_fee.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                {tournament.description && (
                  <div>
                    <p className="font-medium text-sm mb-2">説明</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {tournament.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>日程</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-sm">大会期間</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">エントリー期間</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(tournament.entry_start)} - {formatDate(tournament.entry_end)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">最終更新</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(tournament.updated_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="participants">
          <div className="space-y-6">
            {pendingEntries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>承認待ちの参加者 ({pendingEntries.length}名)</CardTitle>
                  <CardDescription>
                    エントリー申請を確認して承認または拒否してください
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{entry.user_profiles.username}</p>
                          <p className="text-sm text-muted-foreground">{entry.user_profiles.email}</p>
                          <p className="text-xs text-muted-foreground">
                            申請日: {formatDateTime(entry.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">承認</Button>
                          <Button size="sm" variant="outline">拒否</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>参加者一覧 ({approvedEntries.length}名)</CardTitle>
                <CardDescription>
                  承認済みの参加者一覧です
                </CardDescription>
              </CardHeader>
              <CardContent>
                {approvedEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">まだ参加者がいません</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvedEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{entry.user_profiles.username}</p>
                          <p className="text-sm text-muted-foreground">{entry.user_profiles.email}</p>
                          <p className="text-xs text-muted-foreground">
                            参加日: {formatDateTime(entry.created_at)}
                          </p>
                        </div>
                        <Badge variant="outline">参加中</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>スケジュール管理</CardTitle>
              <CardDescription>
                大会のスケジュールと試合組み合わせを管理します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">スケジュール機能</h3>
                <p className="text-muted-foreground mb-4">
                  試合組み合わせとスケジュール管理機能は今後実装予定です
                </p>
                <Button variant="outline" disabled>
                  組み合わせを作成
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>大会設定</CardTitle>
              <CardDescription>
                大会の詳細設定を変更できます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">大会を編集</p>
                  <p className="text-sm text-muted-foreground">
                    大会の基本情報を変更します
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/tournaments/${tournament.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    編集
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">大会設定</p>
                  <p className="text-sm text-muted-foreground">
                    詳細な設定を変更します
                  </p>
                </div>
                <Button variant="outline" disabled>
                  <Settings className="h-4 w-4 mr-2" />
                  設定
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}