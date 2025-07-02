import { getTournament } from "@/lib/actions/tournaments";
import { generateTournamentBracket, getMatches } from "@/lib/actions/matches";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TournamentBracket } from "@/components/tournament/tournament-bracket";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Edit, 
  Settings, 
  ArrowLeft,
  Play,
  Square
} from "lucide-react";
import Link from "next/link";

export const runtime = 'edge';

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
    case "draft": return "下書き";
    case "ongoing": return "進行中";
    case "completed": return "完了";
    case "cancelled": return "中止";
    default: return status;
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type Props = {
  params: { id: string };
};

export default async function TournamentDetailPage({ params }: Props) {
  let tournament: Tournament | null = null;
  let matches: any[] = [];
  let error: string | null = null;
  let isOrganizer = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    tournament = await getTournament(params.id) as Tournament;
    
    if (user && tournament.organizer?.username === user.email?.split('@')[0]) {
      isOrganizer = true;
    }

    try {
      matches = await getMatches(params.id);
    } catch (matchError) {
      // Matches might not exist yet, that's okay
      matches = [];
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "大会の取得に失敗しました";
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
          <Button asChild variant="outline">
            <Link href={`/dashboard/tournaments/${tournament.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">参加者数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tournament.participants.length}</div>
            <p className="text-xs text-muted-foreground">登録済み</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">開催日</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatDate(tournament.start_date)}</div>
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
          <TabsTrigger value="bracket">トーナメント表</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
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
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">主催者:</span>
                  <span>{tournament.organizer?.username || "不明"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">開催日:</span>
                  <span>{formatDate(tournament.start_date)}</span>
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
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>参加者一覧 ({tournament.participants.length}名)</CardTitle>
              <CardDescription>
                現在の参加者一覧です
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tournament.participants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">まだ参加者がいません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tournament.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{participant.user?.username || "不明"}</p>
                        {participant.seed && (
                          <p className="text-sm text-muted-foreground">シード: {participant.seed}</p>
                        )}
                      </div>
                      <Badge variant="outline">参加中</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bracket">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>トーナメント表</CardTitle>
                  <CardDescription>
                    大会の対戦表と試合結果
                  </CardDescription>
                </div>
                {isOrganizer && matches.length === 0 && tournament.participants.length >= 2 && (
                  <form action={generateTournamentBracket.bind(null, tournament.id)}>
                    <Button type="submit">
                      <Play className="h-4 w-4 mr-2" />
                      トーナメント表を生成
                    </Button>
                  </form>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">トーナメント表</h3>
                  <p className="text-muted-foreground mb-4">
                    {tournament.participants.length < 2
                      ? "参加者が2名以上必要です"
                      : isOrganizer
                      ? "トーナメント表を生成してください"
                      : "主催者がトーナメント表を生成するまでお待ちください"
                    }
                  </p>
                </div>
              ) : (
                <TournamentBracket matches={matches} isOrganizer={isOrganizer} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}