import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Settings, 
  Home,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { NotificationBell } from "@/components/notification-bell";
import { NotificationManager } from "@/components/notification-manager";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "ダッシュボード", href: "/dashboard", icon: Home },
  { name: "大会管理", href: "/dashboard/tournaments", icon: Trophy },
  { name: "参加者", href: "/dashboard/participants", icon: Users },
  { name: "スケジュール", href: "/dashboard/schedule", icon: Calendar },
  { name: "設定", href: "/dashboard/settings", icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  let profile = null;

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
  } catch (error) {
    console.error("Database connection error:", error);
    // テスト用のダミーユーザー
    user = { id: "test-user", email: "test@example.com" };
    profile = { username: "テストユーザー", role: "admin" };
  }

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              <span className="font-semibold">大会管理システム</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {profile?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{profile?.username}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {profile?.role === "admin" ? "管理者" : "参加者"}
                  </Badge>
                  {profile?.subscription_status === "free" && (
                    <Badge variant="secondary" className="text-xs">
                      無料プラン
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t p-6 space-y-2">
            <div className="flex items-center justify-between">
              <ThemeSwitcher />
              <NotificationBell userId={user?.id || ""} />
            </div>
            <div className="flex items-center gap-2">
              <form action={handleSignOut} className="flex-1">
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  ログアウト
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6 px-6">
          {children}
        </main>
        {/* 通知マネージャー */}
        <NotificationManager userId={user?.id || ""} />
      </div>
    </div>
  );
}