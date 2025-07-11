import { getTournament } from "@/lib/actions/tournaments";
import { generateTournamentBracket, getMatches } from "@/lib/actions/matches";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TournamentBracketManager } from "@/components/tournament-bracket-manager";
import { TournamentProgress } from "@/components/tournament-progress";
import { getMatchesWithSchedule } from "@/lib/actions/schedule";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Edit, 
  ArrowLeft,
  Play
} from "lucide-react";
import Link from "next/link";

import { TournamentScheduleBoard } from "@/components/tournament-schedule-board";
import { TournamentScheduleWrapper } from "@/components/tournament-schedule-wrapper";
import { AddParticipantForm } from "@/components/add-participant-form";

export const runtime = 'edge';

type Tournament = {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "ongoing" | "completed" | "cancelled";
  start_date: string | null;
  created_at: string;
  organizer_id: string;
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
  params: Promise<{ id: string }>;
};

export default async function TournamentDetailPage({ params }: Props) {
  const { id } = await params;
  let tournament: Tournament | null = null;
  let matches: any[] = [];
  let matchesWithSchedule: any[] = [];
  let error: string | null = null;
  let isOrganizer = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    tournament = await getTournament(id) as Tournament;
    
    console.log('Organizer check:', {
      user: user ? { id: user.id, email: user.email } : null,
      tournament_organizer: tournament.organizer,
      userEmailPrefix: user?.email?.split('@')[0],
      comparison: tournament.organizer?.username === user?.email?.split('@')[0]
    });
    
    // Check if user is organizer using both methods
    const isOrganizerByUsername = user && tournament.organizer?.username === user.email?.split('@')[0];
    const isOrganizerById = user && tournament.organizer_id === user.id;
    
    console.log('Organizer check methods:', {
      isOrganizerByUsername,
      isOrganizerById,
      tournament_organizer_id: tournament.organizer_id
    });
    
    if (isOrganizerByUsername || isOrganizerById) {
      isOrganizer = true;
    }

    try {
      matches = await getMatches(id);
      
      // スケジュール情報付きの試合データを取得
      const scheduleResult = await getMatchesWithSchedule(id);
      if (scheduleResult.success) {
        matchesWithSchedule = scheduleResult.matches;
      }
    } catch (matchError) {
      // Matches might not exist yet, that's okay
      matches = [];
      matchesWithSchedule = [];
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/tournaments">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <h1 className="text-lg md:text-3xl font-bold tracking-tight truncate">{tournament.name}</h1>
                <Badge variant={getStatusColor(tournament.status)}>
                  {getStatusText(tournament.status)}
                </Badge>
              </div>
              {tournament.description && (
                <p className="text-sm md:text-base text-muted-foreground mt-1 line-clamp-2">{tournament.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/tournaments/${tournament.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                編集
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">参加者数</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-6">
            <div className="text-lg md:text-2xl font-bold">{tournament.participants.length}</div>
            <p className="text-xs text-muted-foreground">登録済み</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">開催日</CardTitle>
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-6">
            <div className="text-base md:text-lg font-bold">{formatDate(tournament.start_date)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">作成日</CardTitle>
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-6">
            <div className="text-base md:text-lg font-bold">{formatDate(tournament.created_at)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 text-xs md:text-sm">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="participants">参加者</TabsTrigger>
          <TabsTrigger value="bracket">トーナメント表</TabsTrigger>
          {matches.length > 0 && <TabsTrigger value="schedule">スケジュール</TabsTrigger>}
          {matches.length > 0 && <TabsTrigger value="progress">進行状況</TabsTrigger>}
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
          <div className="grid gap-6 md:grid-cols-2">
            {/* 参加者追加フォーム */}
            {isOrganizer && tournament.status === 'draft' && (
              <AddParticipantForm 
                tournamentId={tournament.id}
                onParticipantAdded={() => {
                  // ページをリロードして最新の参加者を表示
                  window.location.reload()
                }}
              />
            )}
            
            {/* 参加者一覧 */}
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
                  <div className="space-y-2 md:space-y-3">
                    {tournament.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-2 md:p-3 border rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm md:text-base truncate">{participant.user?.username || "不明"}</p>
                          {participant.seed && (
                            <p className="text-xs md:text-sm text-muted-foreground">シード: {participant.seed}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">参加中</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
{(() => {
                  console.log('Tournament bracket button conditions:', {
                    isOrganizer,
                    matchesLength: matches.length,
                    participantsLength: tournament.participants.length,
                    tournamentStatus: tournament.status,
                    shouldShow: isOrganizer && matches.length === 0 && tournament.participants.length >= 2 && tournament.status === 'draft'
                  });
                  return null;
                })()}
                {isOrganizer && matches.length === 0 && tournament.participants.length >= 2 && tournament.status === 'draft' && (
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
                      : tournament.status !== 'draft'
                      ? "トーナメント表の生成は下書き状態の大会のみ可能です。大会編集でステータスを「下書き」に変更してください。"
                      : isOrganizer
                      ? "トーナメント表を生成してください"
                      : "主催者がトーナメント表を生成するまでお待ちください"
                    }
                  </p>
                </div>
              ) : (
                <TournamentBracketManager 
                  tournamentId={tournament.id}
                  initialMatches={matches} 
                  isOrganizer={isOrganizer} 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <TournamentScheduleWrapper 
            matches={matchesWithSchedule}
            isOrganizer={isOrganizer}
          />
        </TabsContent>

        <TabsContent value="progress">
          <TournamentProgress 
            matches={matches} 
            totalParticipants={tournament.participants.length}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}