"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  Award,
  Target,
  Activity
} from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  status: string;
  created_at: string;
  start_date?: string;
  participants?: any[];
}

interface DashboardStatsProps {
  tournaments: Tournament[];
  userRole: "admin" | "participant";
}

export function DashboardStats({ tournaments, userRole }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const total = tournaments.length;
    const draft = tournaments.filter(t => t.status === "draft").length;
    const published = tournaments.filter(t => t.status === "published").length;
    const ongoing = tournaments.filter(t => t.status === "ongoing").length;
    const completed = tournaments.filter(t => t.status === "completed").length;
    const cancelled = tournaments.filter(t => t.status === "cancelled").length;
    
    // 今月作成された大会
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthCount = tournaments.filter(t => 
      new Date(t.created_at) >= thisMonth
    ).length;
    
    // 今週開催予定の大会
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingCount = tournaments.filter(t => 
      t.start_date && 
      new Date(t.start_date) <= nextWeek && 
      new Date(t.start_date) >= new Date() &&
      (t.status === "published" || t.status === "ongoing")
    ).length;
    
    // 参加者数の合計（管理者の場合）
    const totalParticipants = userRole === "admin" 
      ? tournaments.reduce((sum, t) => sum + (t.participants?.length || 0), 0)
      : 0;
    
    // 成功率（完了 / (完了 + キャンセル)）
    const successRate = (completed + cancelled) > 0 
      ? Math.round((completed / (completed + cancelled)) * 100) 
      : 0;
    
    return {
      total,
      draft,
      published,
      ongoing,
      completed,
      cancelled,
      thisMonthCount,
      upcomingCount,
      totalParticipants,
      successRate,
      activeCount: published + ongoing
    };
  }, [tournaments, userRole]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "text-yellow-600";
      case "published": return "text-blue-600";
      case "ongoing": return "text-green-600";
      case "completed": return "text-purple-600";
      case "cancelled": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* メイン統計 */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              {userRole === "admin" ? "作成した大会" : "参加中の大会"}
            </CardTitle>
            <Trophy className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-6">
            <div className="text-lg md:text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              今月 +{stats.thisMonthCount} 大会
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">進行中</CardTitle>
            <Activity className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-6">
            <div className="text-lg md:text-2xl font-bold text-green-600">{stats.activeCount}</div>
            <p className="text-xs text-muted-foreground">
              公開中 {stats.published} + 進行中 {stats.ongoing}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">今週開催</CardTitle>
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-6">
            <div className="text-lg md:text-2xl font-bold text-blue-600">{stats.upcomingCount}</div>
            <p className="text-xs text-muted-foreground">
              7日以内に開催予定
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              {userRole === "admin" ? "参加者数" : "完了率"}
            </CardTitle>
            {userRole === "admin" ? (
              <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            ) : (
              <Award className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent className="pb-3 md:pb-6">
            <div className="text-lg md:text-2xl font-bold text-purple-600">
              {userRole === "admin" ? stats.totalParticipants : `${stats.successRate}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {userRole === "admin" ? "総参加者数" : `完了 ${stats.completed} / ${stats.completed + stats.cancelled}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 詳細統計 */}
      <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Target className="h-4 w-4 md:h-5 md:w-5" />
              大会ステータス分布
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200 text-xs">
                    下書き
                  </Badge>
                  <span className="text-sm">{stats.draft}</span>
                </div>
                <div className="w-16 md:w-24">
                  <Progress 
                    value={stats.total > 0 ? (stats.draft / stats.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                    公開中
                  </Badge>
                  <span className="text-sm">{stats.published}</span>
                </div>
                <div className="w-16 md:w-24">
                  <Progress 
                    value={stats.total > 0 ? (stats.published / stats.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                    進行中
                  </Badge>
                  <span className="text-sm">{stats.ongoing}</span>
                </div>
                <div className="w-16 md:w-24">
                  <Progress 
                    value={stats.total > 0 ? (stats.ongoing / stats.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-purple-600 border-purple-200 text-xs">
                    完了
                  </Badge>
                  <span className="text-sm">{stats.completed}</span>
                </div>
                <div className="w-16 md:w-24">
                  <Progress 
                    value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
              活動サマリー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                  <span className="text-xs md:text-sm font-medium">今月の新規大会</span>
                </div>
                <span className="text-sm md:text-lg font-bold text-blue-600">{stats.thisMonthCount}</span>
              </div>
              
              <div className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                  <span className="text-xs md:text-sm font-medium">今週開催予定</span>
                </div>
                <span className="text-sm md:text-lg font-bold text-green-600">{stats.upcomingCount}</span>
              </div>
              
              {userRole === "admin" && (
                <div className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                    <span className="text-xs md:text-sm font-medium">総参加者数</span>
                  </div>
                  <span className="text-sm md:text-lg font-bold text-purple-600">{stats.totalParticipants}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-3 w-3 md:h-4 md:w-4 text-yellow-600" />
                  <span className="text-xs md:text-sm font-medium">成功率</span>
                </div>
                <span className="text-sm md:text-lg font-bold text-yellow-600">{stats.successRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}