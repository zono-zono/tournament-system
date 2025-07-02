"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 環境変数チェック
  const hasSupabaseConfig = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = hasSupabaseConfig ? createClient() : null;

  const testConnection = async () => {
    if (!supabase) {
      setStatus("❌ Supabase設定が不完全です");
      return;
    }

    setIsLoading(true);
    setStatus("接続テスト中...");
    
    try {
      // 1. 基本的な接続テスト
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      let message = `✅ 接続成功 - ユーザー: ${user ? user.email : "未ログイン"}`;
      
      // 2. 認証設定の確認
      try {
        const { data: settings, error: settingsError } = await supabase.auth.getSession();
        message += `\n📊 セッション状態: ${settings.session ? "あり" : "なし"}`;
      } catch (e) {
        message += `\n⚠️ セッション確認エラー: ${e instanceof Error ? e.message : String(e)}`;
      }
      
      // 3. テーブル確認
      const { data, error } = await supabase
        .from("tournaments")
        .select("count")
        .limit(1);
      
      if (error) {
        message += `\n❌ データベースエラー: ${error.message}`;
      } else {
        message += `\n✅ データベース正常`;
      }
      
      // 4. 設定情報の表示
      message += `\n\n🔧 設定情報:`;
      message += `\nURL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`;
      message += `\nKey: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "設定済み" : "未設定"}`;
      
      setStatus(message);
    } catch (error) {
      setStatus(`❌ エラー: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSignUp = async () => {
    if (!supabase) {
      setStatus("❌ Supabase設定が不完全です");
      return;
    }

    if (!email || !password) {
      setStatus("❌ メールアドレスとパスワードを入力してください");
      return;
    }

    setIsLoading(true);
    setStatus("サインアップ中...");

    try {
      console.log("サインアップ試行:", { email, password: "****" });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: email.split('@')[0]
          }
        }
      });

      console.log("サインアップレスポンス:", { data, error });

      if (error) {
        setStatus(`❌ サインアップエラー: ${error.message}\n詳細: ${JSON.stringify(error, null, 2)}`);
      } else if (data.user) {
        let message = `✅ サインアップ成功!\nユーザーID: ${data.user.id}\nメール: ${data.user.email}`;
        
        if (data.user.email_confirmed_at) {
          message += "\n✅ メール確認済み";
        } else {
          message += "\n⏳ メール確認待ち";
        }
        
        if (data.session) {
          message += "\n✅ セッション作成済み";
        } else {
          message += "\n⏳ セッション未作成（メール確認が必要な可能性）";
        }
        
        setStatus(message);
      } else {
        setStatus(`⚠️ 不明な状態: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error("サインアップエラー:", error);
      setStatus(`❌ エラー: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSignIn = async () => {
    if (!supabase) {
      setStatus("❌ Supabase設定が不完全です");
      return;
    }

    if (!email || !password) {
      setStatus("❌ メールアドレスとパスワードを入力してください");
      return;
    }

    setIsLoading(true);
    setStatus("サインイン中...");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatus(`❌ サインインエラー: ${error.message}`);
      } else {
        setStatus(`✅ サインイン成功! ユーザー: ${data.user.email}`);
      }
    } catch (error) {
      setStatus(`❌ エラー: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (!supabase) {
      setStatus("❌ Supabase設定が不完全です");
      return;
    }

    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setStatus("✅ サインアウトしました");
    } catch (error) {
      setStatus(`❌ エラー: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Supabase認証テスト</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={testConnection} 
              disabled={isLoading || !hasSupabaseConfig}
            >
              接続テスト
            </Button>
            <Button 
              onClick={testSignUp} 
              disabled={isLoading || !hasSupabaseConfig}
            >
              サインアップ
            </Button>
            <Button 
              onClick={testSignIn} 
              disabled={isLoading || !hasSupabaseConfig}
            >
              サインイン
            </Button>
            <Button 
              onClick={signOut} 
              disabled={isLoading || !hasSupabaseConfig} 
              variant="outline"
            >
              サインアウト
            </Button>
          </div>

          {!hasSupabaseConfig && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Supabase環境変数が設定されていません。デプロイ環境では正常に動作しません。
              </p>
            </div>
          )}

          {status && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{status}</pre>
            </div>
          )}

          <div className="mt-6 text-sm text-muted-foreground">
            <p><strong>設定確認:</strong></p>
            <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "設定済み" : "未設定"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}