import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Trophy, Users, Calendar, Settings } from "lucide-react";

export const runtime = 'edge';

export default async function Dashboard() {
  let user = null;
  let profile = null;
  let tournaments = null;

  try {
    const supabase = await createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    user = authUser;

    if (!user) {
      return redirect("/auth/login");
    }

    // ユーザー情報を取得
    const { data: profileData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    profile = profileData;

    // 大会データを取得（管理者の場合は自分が作成した大会、参加者の場合は参加している大会）
    const { data: tournamentsData } = await supabase
      .from("tournaments")
      .select(`
        *,
        tournament_entries(count)
      `)
      .eq(profile?.role === "admin" ? "created_by" : "tournament_entries.user_id", user.id)
      .order("created_at", { ascending: false });

    tournaments = tournamentsData;
  } catch (error) {
    console.error("Database connection error:", error);
    // Supabase接続エラーの場合でもページを表示
  }

  const stats = {
    total_tournaments: tournaments?.length || 0,
    active_tournaments: tournaments?.filter(t => t.status === "published" || t.status === "ongoing").length || 0,
    draft_tournaments: tournaments?.filter(t => t.status === "draft").length || 0,
    completed_tournaments: tournaments?.filter(t => t.status === "completed").length || 0,
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      {/* Header */}
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
            <p className="text-muted-foreground">
              こんにちは、{profile?.username}さん
              {profile?.role === "admin" && (
                <Badge variant="outline" className="ml-2">管理者</Badge>
              )}
            </p>
          </div>
          {profile?.role === "admin" && (
            <Button asChild>
              <Link href="/dashboard/tournaments/new">
                <Plus className="mr-2 h-4 w-4" />
                新しい大会を作成
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {profile?.role === "admin" ? "作成した大会" : "参加中の大会"}
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_tournaments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">進行中</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_tournaments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">下書き</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft_tournaments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed_tournaments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tournaments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {profile?.role === "admin" ? "最近の大会" : "参加中の大会"}
              </CardTitle>
              <CardDescription>
                {profile?.role === "admin" 
                  ? "あなたが作成した大会の一覧です" 
                  : "あなたが参加している大会の一覧です"
                }
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/tournaments">
                すべて見る
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tournaments && tournaments.length > 0 ? (
            <div className="space-y-4">
              {tournaments.slice(0, 5).map((tournament) => (
                <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">{tournament.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tournament.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        tournament.status === "published" ? "default" :
                        tournament.status === "ongoing" ? "secondary" :
                        tournament.status === "completed" ? "outline" :
                        "secondary"
                      }>
                        {tournament.status === "draft" && "下書き"}
                        {tournament.status === "published" && "公開中"}
                        {tournament.status === "ongoing" && "進行中"}
                        {tournament.status === "completed" && "完了"}
                        {tournament.status === "cancelled" && "中止"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        参加者: {tournament.tournament_entries?.[0]?.count || 0}名
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/dashboard/tournaments/${tournament.id}`}>
                      詳細
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {profile?.role === "admin" ? "まだ大会がありません" : "参加中の大会がありません"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {profile?.role === "admin" 
                  ? "最初の大会を作成して始めましょう" 
                  : "興味のある大会を探して参加してみましょう"
                }
              </p>
              {profile?.role === "admin" ? (
                <Button asChild>
                  <Link href="/dashboard/tournaments/new">
                    <Plus className="mr-2 h-4 w-4" />
                    新しい大会を作成
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/tournaments">
                    大会を探す
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}