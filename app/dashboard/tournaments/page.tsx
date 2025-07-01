"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Trophy, Users, Calendar, Settings, Filter } from "lucide-react";
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
  tournament_entries: { count: number }[];
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
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
          tournament_entries!inner(count)
        `)
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTournaments(data || []);
    } catch (error) {
      console.error("Tournament fetch error:", error);
      setError(error instanceof Error ? error.message : "大会の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (tournament.description && tournament.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || tournament.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Tournament["status"]) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "published":
        return "default";
      case "ongoing":
        return "destructive";
      case "completed":
        return "outline";
      case "cancelled":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: Tournament["status"]) => {
    switch (status) {
      case "draft":
        return "下書き";
      case "published":
        return "公開中";
      case "ongoing":
        return "進行中";
      case "completed":
        return "完了";
      case "cancelled":
        return "中止";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  const stats = {
    total: tournaments.length,
    draft: tournaments.filter(t => t.status === "draft").length,
    published: tournaments.filter(t => t.status === "published").length,
    ongoing: tournaments.filter(t => t.status === "ongoing").length,
    completed: tournaments.filter(t => t.status === "completed").length,
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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">大会一覧</h1>
          <p className="text-muted-foreground">作成した大会を管理できます</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600">
                <p className="font-medium">エラーが発生しました</p>
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={fetchTournaments}>再試行</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">大会一覧</h1>
          <p className="text-muted-foreground">作成した大会を管理できます</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tournaments/new">
            <Plus className="mr-2 h-4 w-4" />
            新しい大会を作成
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総大会数</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">下書き</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">公開中</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">進行中</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ongoing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            フィルター・検索
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="大会名や説明で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="ステータスで絞り込み" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="draft">下書き</SelectItem>
                  <SelectItem value="published">公開中</SelectItem>
                  <SelectItem value="ongoing">進行中</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="cancelled">中止</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament List */}
      <Card>
        <CardHeader>
          <CardTitle>大会一覧</CardTitle>
          <CardDescription>
            {filteredTournaments.length > 0 
              ? `${filteredTournaments.length}件の大会が見つかりました`
              : "該当する大会がありません"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTournaments.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">大会がありません</h3>
              <p className="text-muted-foreground mb-4">
                {tournaments.length === 0 
                  ? "まだ大会を作成していません。最初の大会を作成してみましょう。"
                  : "検索条件に一致する大会がありません。フィルターを変更してください。"
                }
              </p>
              {tournaments.length === 0 && (
                <Button asChild>
                  <Link href="/dashboard/tournaments/new">
                    <Plus className="mr-2 h-4 w-4" />
                    新しい大会を作成
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTournaments.map((tournament) => (
                <div key={tournament.id} className="flex items-center justify-between p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium">{tournament.name}</h3>
                      <Badge variant={getStatusColor(tournament.status)}>
                        {getStatusText(tournament.status)}
                      </Badge>
                    </div>
                    {tournament.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tournament.description}
                      </p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        開催: {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        参加者: {tournament.tournament_entries[0]?.count || 0}名
                      </div>
                      {tournament.venue && (
                        <div>
                          会場: {tournament.venue}
                        </div>
                      )}
                      {tournament.entry_fee > 0 && (
                        <div>
                          参加費: ¥{tournament.entry_fee.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button asChild variant="outline">
                      <Link href={`/dashboard/tournaments/${tournament.id}`}>
                        詳細
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/dashboard/tournaments/${tournament.id}/edit`}>
                        編集
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}