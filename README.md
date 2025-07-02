# Tournament System

<p align="center">
  <strong>シンプルで効率的なトーナメント管理システム</strong>
</p>

<p align="center">
  Next.js と Supabase で構築された現代的なトーナメント運営プラットフォーム
</p>

<br/>

## 主な機能

- **大会作成・管理**: 直感的なインターフェースで大会の作成・管理
- **参加者登録**: ユーザーが簡単に大会に参加登録
- **トーナメント表生成**: シングルエリミネーション形式の自動対戦表生成
- **試合結果管理**: リアルタイムでの試合結果入力・管理
- **認証システム**: Supabase認証による安全なユーザー管理
- **レスポンシブデザイン**: モバイル・デスクトップ対応

## 技術スタック

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Cloudflare Pages

## データベース設計

### 主要テーブル
- `tournaments`: 大会情報（名前、説明、開催日、ステータス等）
- `participants`: 参加者情報（大会への参加登録）
- `matches`: 試合情報（対戦相手、結果、ラウンド等）
- `users`: ユーザー情報（Supabase認証と連携）

## 開発環境のセットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/zono-zono/tournament-system.git
cd tournament-system
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.example .env.local
# .env.localでSupabaseの設定を更新
```

4. 開発サーバーを起動
```bash
npm run dev
```

5. ブラウザで http://localhost:3000 にアクセス

## Supabaseの設定

1. [Supabase Dashboard](https://database.new) でプロジェクトを作成
2. プロジェクトのAPI設定から以下を取得：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `supabase/migrations/001_initial_schema.sql` のマイグレーションを実行

## Cloudflare Pages デプロイ

### 環境変数の設定
Cloudflare Pages ダッシュボードで以下の環境変数を設定してください：

```
NEXT_PUBLIC_SUPABASE_URL=https://kldspkowaezkyiqwdsht.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZHNwa293YWV6a3lpcXdkc2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNzc1MTEsImV4cCI6MjA2Njg1MzUxMX0.VB4C2BeC8iIVNaEDhDNTYqL3At1MgEkTJGGOSDxZVE0
```

### ビルド設定
Cloudflare Pages ダッシュボードで以下のように設定してください：

- **フレームワーク**: Next.js
- **ビルドコマンド**: `npm run pages:build`
- **出力ディレクトリ**: `.vercel/output` ⚠️ 重要: `/static` は付けない
- **Node.js バージョン**: 18

⚠️ **最重要**: 出力ディレクトリは必ず `.vercel/output` を指定してください。`.vercel/output/static` ではありません。これにより静的ファイルとサーバーレス関数の両方が正しくデプロイされます。

## 今後の機能拡張予定

- [ ] ダブルエリミネーション形式のサポート
- [ ] 総当たり戦（ラウンドロビン）のサポート  
- [ ] チーム戦機能
- [ ] 通知機能（メール・LINE）
- [ ] 詳細な統計・レポート機能
- [ ] 大会のライブ配信連携
- [ ] モバイルアプリ対応

## 貢献

プルリクエストやイシューの報告を歓迎します。

## ライセンス

MIT License
