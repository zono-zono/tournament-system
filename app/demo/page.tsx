import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Trophy, Users, Calendar, Settings } from "lucide-react";

export default function DemoPage() {
  // デモ用のダミーデータ
  const profile = { 
    username: "テストユーザー", 
    role: "admin" as const,
    subscription_status: "free" as const
  };

  const tournaments = [
    {
      id: "1",
      name: "サンプル大会 2024",
      description: "これは大会管理システムのデモ用サンプル大会です",
      status: "published" as const,
      tournament_entries: [{ count: 8 }]
    },
    {
      id: "2", 
      name: "テストトーナメント",
      description: "進行中のテストトーナメントです",
      status: "ongoing" as const,
      tournament_entries: [{ count: 16 }]
    },
    {
      id: "3",
      name: "完了済み大会",
      description: "完了した大会の例です",
      status: "completed" as const,
      tournament_entries: [{ count: 12 }]
    }
  ];

  const stats = {
    total_tournaments: tournaments.length,
    active_tournaments: tournaments.filter(t => t.status === "published" || t.status === "ongoing").length,
    draft_tournaments: 1,
    completed_tournaments: tournaments.filter(t => t.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Header */}
      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">DEMO</Badge>
            <h1 className="text-lg font-semibold">大会管理システム - デモ画面</h1>
            <div className="ml-auto">
              <Button asChild variant="outline">
                <Link href="/">ホームに戻る</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r mt-16">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/demo" className="flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              <span className="font-semibold">大会管理システム</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {profile.username.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{profile.username}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {profile.role === "admin" ? "管理者" : "参加者"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    無料プラン
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-4">
            <ul className="space-y-2">
              <li>
                <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-accent text-accent-foreground">
                  <Trophy className="h-4 w-4" />
                  ダッシュボード
                </div>
              </li>
              <li>
                <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  大会管理
                </div>
              </li>
              <li>
                <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">
                  <Users className="h-4 w-4" />
                  参加者
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64 pt-16">
        <main className="py-6 px-6">
          <div className="flex-1 w-full flex flex-col gap-6">
            {/* Header */}
            <div className="w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
                  <p className="text-muted-foreground">
                    こんにちは、{profile.username}さん
                    <Badge variant="outline" className="ml-2">管理者</Badge>
                  </p>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新しい大会を作成
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">作成した大会</CardTitle>
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
                    <CardTitle>最近の大会</CardTitle>
                    <CardDescription>
                      あなたが作成した大会の一覧です
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    すべて見る
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tournaments.map((tournament) => (
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
                            {tournament.status === "published" && "公開中"}
                            {tournament.status === "ongoing" && "進行中"}
                            {tournament.status === "completed" && "完了"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            参加者: {tournament.tournament_entries[0].count}名
                          </span>
                        </div>
                      </div>
                      <Button variant="outline">
                        詳細
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}