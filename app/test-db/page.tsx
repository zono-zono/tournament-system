"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestDbPage() {
  const [tournamentName, setTournamentName] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setStatus("データベース接続テスト中...");
    
    try {
      // 1. テーブル存在確認
      const { data: tables, error: tablesError } = await supabase
        .from("tournaments")
        .select("count")
        .limit(1);
      
      if (tablesError) {
        setStatus(`❌ テーブルエラー: ${tablesError.message}`);
        return;
      }
      
      setStatus("✅ データベース接続成功！テーブルが存在します");
      
    } catch (error) {
      setStatus(`❌ エラー: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testInsertData = async () => {
    if (!tournamentName.trim()) {
      setStatus("❌ 大会名を入力してください");
      return;
    }

    setIsLoading(true);
    setStatus("データ挿入テスト中...");
    
    try {
      // 認証なしでの挿入テスト（RLSを一時的に無視）
      const { data, error } = await supabase
        .from("tournaments")
        .insert({
          name: tournamentName,
          description: "テスト用大会",
          status: "draft",
          min_participants: 2,
          entry_fee: 0,
          created_by: "00000000-0000-0000-0000-000000000000", // ダミーUUID
        })
        .select()
        .single();

      if (error) {
        setStatus(`❌ 挿入エラー: ${error.message}\n詳細: ${JSON.stringify(error, null, 2)}`);
      } else {
        setStatus(`✅ データ挿入成功！\nID: ${data.id}\n名前: ${data.name}`);
      }
      
    } catch (error) {
      setStatus(`❌ エラー: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSelectData = async () => {
    setIsLoading(true);
    setStatus("データ取得テスト中...");
    
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("id, name, description, status, created_at")
        .limit(5);

      if (error) {
        setStatus(`❌ 取得エラー: ${error.message}`);
      } else {
        setStatus(`✅ データ取得成功！\n件数: ${data.length}\n\n${JSON.stringify(data, null, 2)}`);
      }
      
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
          <CardTitle>データベース直接テスト</CardTitle>
          <p className="text-sm text-muted-foreground">
            認証をスキップしてデータベース機能をテストします
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="テスト用大会名"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Button onClick={testDatabaseConnection} disabled={isLoading}>
              データベース接続テスト
            </Button>
            <Button onClick={testSelectData} disabled={isLoading}>
              データ取得テスト
            </Button>
            <Button onClick={testInsertData} disabled={isLoading} variant="outline">
              データ挿入テスト（要注意：RLS適用）
            </Button>
          </div>

          {status && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{status}</pre>
            </div>
          )}

          <div className="mt-6 text-sm text-muted-foreground">
            <p><strong>接続情報:</strong></p>
            <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "設定済み" : "未設定"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}