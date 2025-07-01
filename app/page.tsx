import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Trophy, Users, Calendar, Star } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"} className="flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              <span className="text-xl">大会管理システム</span>
            </Link>
            <nav className="flex gap-4 ml-8">
              <Link href="/tournaments" className="text-sm hover:text-primary transition-colors">
                大会一覧
              </Link>
              <Link href="/dashboard" className="text-sm hover:text-primary transition-colors">
                ダッシュボード
              </Link>
            </nav>
          </div>
          <AuthButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              効率的な大会運営を
              <br />
              <span className="text-primary">シンプルに</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              トーナメントやリーグ戦の作成から参加者管理、試合結果の記録まで、
              大会運営に必要な全ての機能を一つのプラットフォームで。
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/tournaments">大会を見る</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">ダッシュボード</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-5 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">主な機能</h2>
            <p className="text-lg text-muted-foreground">
              大会運営を効率化する豊富な機能をご用意しています
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Trophy className="h-8 w-8 text-primary mb-2" />
                <CardTitle>大会作成</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  トーナメントやリーグ戦など、様々な形式の大会を簡単に作成できます
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>参加者管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  エントリー受付から参加者の承認まで、スムーズな参加者管理
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle>スケジュール管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  試合日程の調整や会場管理、リアルタイムでの情報更新
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Star className="h-8 w-8 text-primary mb-2" />
                <CardTitle>通知機能</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  メールやLINEでの自動通知で、参加者への情報伝達を効率化
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">料金プラン</h2>
            <p className="text-lg text-muted-foreground">
              まずは無料で始めて、必要に応じてアップグレード
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">無料プラン</CardTitle>
                <CardDescription>
                  個人利用や小規模な大会に最適
                </CardDescription>
                <div className="text-3xl font-bold">¥0</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm space-y-2 text-left">
                  <li>✓ 1大会まで作成可能</li>
                  <li>✓ 基本的な大会管理機能</li>
                  <li>✓ 参加者管理</li>
                  <li>✓ 基本的な通知機能</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/auth/sign-up">無料で始める</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-2xl">有料プラン</CardTitle>
                <CardDescription>
                  本格的な大会運営に
                </CardDescription>
                <div className="text-3xl font-bold">¥980 <span className="text-sm font-normal">/月</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm space-y-2 text-left">
                  <li>✓ 無制限の大会作成</li>
                  <li>✓ 高度な大会管理機能</li>
                  <li>✓ 詳細な分析レポート</li>
                  <li>✓ 優先サポート</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/auth/sign-up">プランを選択</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
        <p>© 2024 大会管理システム. All rights reserved.</p>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}
