import { getTournament } from "@/lib/actions/tournaments";
import { joinTournament, leaveTournament } from "@/lib/actions/participants";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMatchesWithSchedule } from "@/lib/actions/schedule";
import { ParticipantScheduleView } from "@/components/participant-schedule-view";
import { 
  Trophy, 
  Users, 
  Calendar,
  UserPlus,
  UserMinus
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

type Props = {
  params: Promise<{ id: string }>;
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
  return new Date(dateString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function TournamentJoinButton({ tournament, isParticipating }: { 
  tournament: Tournament; 
  isParticipating: boolean;
}) {
  if (tournament.status !== "draft") {
    return null;
  }

  if (isParticipating) {
    return (
      <form action={leaveTournament.bind(null, tournament.id)}>
        <Button type="submit" variant="outline">
          <UserMinus className="h-4 w-4 mr-2" />
          参加をキャンセル
        </Button>
      </form>
    );
  }

  return (
    <form action={joinTournament.bind(null, tournament.id)}>
      <Button type="submit">
        <UserPlus className="h-4 w-4 mr-2" />
        参加する
      </Button>
    </form>
  );
}

export default async function PublicTournamentPage({ params }: Props) {
  const { id } = await params;
  let tournament: Tournament | null = null;
  let error: string | null = null;
  let currentUser: any = null;
  let isParticipating = false;
  let participantId: string | null = null;
  let matchesWithSchedule: any[] = [];

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;

    tournament = await getTournament(id) as Tournament;

    if (currentUser) {
      const participant = tournament.participants.find(p => p.user?.username === currentUser.email?.split('@')[0]);
      isParticipating = !!participant;
      participantId = participant?.id || null;
      
      // スケジュール情報付きの試合データを取得
      if (isParticipating) {
        const scheduleResult = await getMatchesWithSchedule(id);
        if (scheduleResult.success) {
          matchesWithSchedule = scheduleResult.matches;
        }
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "大会の取得に失敗しました";
  }

  if (error || !tournament) {
    return (
      <div className="container mx-auto py-12 px-4">
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
    <div className="container mx-auto py-12 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight">{tournament.name}</h1>
          <Badge variant={getStatusColor(tournament.status)} className="text-sm">
            {getStatusText(tournament.status)}
          </Badge>
        </div>
        {tournament.description && (
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {tournament.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
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
            <CardTitle className="text-sm font-medium">主催者</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{tournament.organizer?.username || "不明"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Join Button */}
      {currentUser && (
        <div className="text-center">
          <TournamentJoinButton tournament={tournament} isParticipating={isParticipating} />
        </div>
      )}

      {!currentUser && tournament.status === "draft" && (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">参加するにはログインが必要です</p>
          <Button asChild>
            <Link href="/auth/login">ログイン</Link>
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {isParticipating && participantId && matchesWithSchedule.length > 0 ? (
          <Tabs defaultValue="schedule" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schedule">マイスケジュール</TabsTrigger>
              <TabsTrigger value="participants">参加者一覧</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule">
              <ParticipantScheduleView 
                matches={matchesWithSchedule}
                participantId={participantId}
                participantName={currentUser?.email?.split('@')[0] || ''}
                tournamentName={tournament.name}
              />
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
                    <div className="grid gap-3 md:grid-cols-2">
                      {tournament.participants.map((participant, index) => (
                        <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{participant.user?.username || "不明"}</p>
                              {participant.seed && (
                                <p className="text-sm text-muted-foreground">シード: {participant.seed}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline">参加中</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
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
                <div className="grid gap-3 md:grid-cols-2">
                  {tournament.participants.map((participant, index) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{participant.user?.username || "不明"}</p>
                          {participant.seed && (
                            <p className="text-sm text-muted-foreground">シード: {participant.seed}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">参加中</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}