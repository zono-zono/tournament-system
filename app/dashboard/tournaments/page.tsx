import { getTournaments } from "@/lib/actions/tournaments"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trophy, Users, Calendar, Settings } from "lucide-react";
import Link from "next/link";

type Tournament = {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "ongoing" | "completed" | "cancelled";
  start_date: string | null;
  created_at: string;
  organizer: { username: string | null } | null;
  participants: Array<{
    id: string;
    seed: number | null;
    user: { username: string | null } | null;
  }>;
};

function getStatusColor(status: Tournament["status"]) {
  switch (status) {
    case "draft":
      return "secondary";
    case "ongoing":
      return "destructive";
    case "completed":
      return "outline";
    case "cancelled":
      return "secondary";
    default:
      return "secondary";
  }
}

function getStatusText(status: Tournament["status"]) {
  switch (status) {
    case "draft":
      return "下書き";
    case "ongoing":
      return "進行中";
    case "completed":
      return "完了";
    case "cancelled":
      return "中止";
    default:
      return status;
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ja-JP");
}

export default async function TournamentsPage() {
  let tournaments: Tournament[] = [];
  let error: string | null = null;

  try {
    tournaments = await getTournaments() as Tournament[];
  } catch (e) {
    error = e instanceof Error ? e.message : "大会の取得に失敗しました";
  }

  const stats = {
    total: tournaments.length,
    draft: tournaments.filter(t => t.status === "draft").length,
    ongoing: tournaments.filter(t => t.status === "ongoing").length,
    completed: tournaments.filter(t => t.status === "completed").length,
  };

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Tournament List */}
      <Card>
        <CardHeader>
          <CardTitle>大会一覧</CardTitle>
          <CardDescription>
            {tournaments.length > 0 
              ? `${tournaments.length}件の大会が見つかりました`
              : "該当する大会がありません"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tournaments.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">大会がありません</h3>
              <p className="text-muted-foreground mb-4">
                まだ大会を作成していません。最初の大会を作成してみましょう。
              </p>
              <Button asChild>
                <Link href="/dashboard/tournaments/new">
                  <Plus className="mr-2 h-4 w-4" />
                  新しい大会を作成
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tournaments.map((tournament) => (
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
                        開催: {formatDate(tournament.start_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        参加者: {tournament.participants.length}名
                      </div>
                      <div className="flex items-center gap-1">
                        主催者: {tournament.organizer?.username || "不明"}
                      </div>
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