import { getTournaments } from "@/lib/actions/tournaments"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar } from "lucide-react";
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
    case "draft": return "secondary";
    case "ongoing": return "destructive";
    case "completed": return "outline";
    case "cancelled": return "secondary";
    default: return "secondary";
  }
}

function getStatusText(status: Tournament["status"]) {
  switch (status) {
    case "draft": return "参加受付中";
    case "ongoing": return "進行中";
    case "completed": return "完了";
    case "cancelled": return "中止";
    default: return status;
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ja-JP");
}

export default async function PublicTournamentsPage() {
  let tournaments: Tournament[] = [];
  let error: string | null = null;

  try {
    const allTournaments = await getTournaments() as Tournament[];
    // Filter to show only ongoing and completed tournaments to the public
    tournaments = allTournaments.filter(t => t.status === 'ongoing' || t.status === 'completed' || t.status === 'draft');
  } catch (e) {
    error = e instanceof Error ? e.message : "大会の取得に失敗しました";
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">大会一覧</h1>
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
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">大会一覧</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          開催中・開催予定の大会に参加しよう
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総大会数</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tournaments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">参加受付中</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tournaments.filter(t => t.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">進行中</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tournaments.filter(t => t.status === 'ongoing').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tournament List */}
      <div className="max-w-4xl mx-auto">
        {tournaments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">大会がありません</h3>
                <p className="text-muted-foreground mb-4">
                  現在開催中または開催予定の大会はありません。
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">{tournament.name}</CardTitle>
                        <Badge variant={getStatusColor(tournament.status)}>
                          {getStatusText(tournament.status)}
                        </Badge>
                      </div>
                      {tournament.description && (
                        <CardDescription className="text-base">
                          {tournament.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>開催: {formatDate(tournament.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>参加者: {tournament.participants.length}名</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <span>主催: {tournament.organizer?.username || "不明"}</span>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/tournaments/${tournament.id}`}>
                        詳細を見る
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}