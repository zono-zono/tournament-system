"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Plus, 
  Calendar, 
  Settings, 
  Users, 
  Trophy,
  Play,
  Eye,
  Edit,
  Search
} from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  status: string;
  start_date?: string;
  participants?: any[];
}

interface QuickActionsProps {
  tournaments: Tournament[];
  userRole: "admin" | "participant";
}

export function QuickActions({ tournaments, userRole }: QuickActionsProps) {
  // アクションが必要な大会を特定
  const draftTournaments = tournaments.filter(t => t.status === "draft");
  const upcomingTournaments = tournaments.filter(t => {
    const startDate = t.start_date ? new Date(t.start_date) : null;
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return startDate && startDate <= nextWeek && startDate >= now && t.status === "published";
  });
  const ongoingTournaments = tournaments.filter(t => t.status === "ongoing");

  if (userRole === "admin") {
    return (
      <div className="space-y-6">
        {/* 管理者用クイックアクション */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              クイックアクション
            </CardTitle>
            <CardDescription>
              よく使用する機能への素早いアクセス
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:gap-3 grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-auto p-2 md:p-4 flex-col gap-1 md:gap-2">
                <Link href="/dashboard/tournaments/new">
                  <Plus className="h-4 w-4 md:h-6 md:w-6" />
                  <span className="text-xs md:text-sm">新しい大会を作成</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-2 md:p-4 flex-col gap-1 md:gap-2">
                <Link href="/dashboard/tournaments">
                  <Trophy className="h-4 w-4 md:h-6 md:w-6" />
                  <span className="text-xs md:text-sm">大会一覧を表示</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-2 md:p-4 flex-col gap-1 md:gap-2">
                <Link href="/tournaments">
                  <Eye className="h-4 w-4 md:h-6 md:w-6" />
                  <span className="text-xs md:text-sm">公開ページを確認</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-2 md:p-4 flex-col gap-1 md:gap-2">
                <Link href="/dashboard">
                  <Users className="h-4 w-4 md:h-6 md:w-6" />
                  <span className="text-xs md:text-sm">参加者管理</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 要アクション項目 */}
        {(draftTournaments.length > 0 || upcomingTournaments.length > 0 || ongoingTournaments.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                要アクション項目
              </CardTitle>
              <CardDescription>
                対応が必要な大会があります
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 下書き大会 */}
              {draftTournaments.length > 0 && (
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        下書き大会の設定完了
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                          {draftTournaments.length}件
                        </Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        設定を完了して大会を公開しましょう
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/dashboard/tournaments?filter=draft">
                        確認する
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* 開催予定大会 */}
              {upcomingTournaments.length > 0 && (
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        今週開催予定の大会
                        <Badge variant="outline" className="text-blue-600 border-blue-300">
                          {upcomingTournaments.length}件
                        </Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        参加者への最終確認を行いましょう
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/dashboard/tournaments?filter=upcoming">
                        確認する
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* 進行中大会 */}
              {ongoingTournaments.length > 0 && (
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        進行中の大会
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          {ongoingTournaments.length}件
                        </Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        試合結果の入力・管理を行いましょう
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/dashboard/tournaments?filter=ongoing">
                        管理する
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // 参加者用クイックアクション
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            クイックアクション
          </CardTitle>
          <CardDescription>
            大会への参加とお気に入り機能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:gap-3 grid-cols-2 lg:grid-cols-3">
            <Button asChild className="h-auto p-2 md:p-4 flex-col gap-1 md:gap-2">
              <Link href="/tournaments">
                <Search className="h-4 w-4 md:h-6 md:w-6" />
                <span className="text-xs md:text-sm">大会を探す</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-2 md:p-4 flex-col gap-1 md:gap-2">
              <Link href="/dashboard/tournaments">
                <Users className="h-4 w-4 md:h-6 md:w-6" />
                <span className="text-xs md:text-sm">参加中の大会</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-2 md:p-4 flex-col gap-1 md:gap-2">
              <Link href="/tournaments?filter=upcoming">
                <Calendar className="h-4 w-4 md:h-6 md:w-6" />
                <span className="text-xs md:text-sm">開催予定を確認</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 参加者向け要アクション項目 */}
      {ongoingTournaments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              進行中の大会
            </CardTitle>
            <CardDescription>
              あなたが参加している進行中の大会があります
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ongoingTournaments.slice(0, 3).map((tournament) => (
                <div key={tournament.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{tournament.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      進行中の大会です
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/tournaments/${tournament.id}`}>
                      確認する
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}