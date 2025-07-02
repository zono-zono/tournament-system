# Cloudflare Pages ビルド構成 完全設定ガイド

## 🎯 必須設定項目

### 1. 基本ビルド設定

Cloudflare Pages ダッシュボード → プロジェクト → 「設定」→「ビルド & デプロイ」

```
フレームワークプリセット: Next.js
ビルドコマンド: npm run pages:build
出力ディレクトリ: .vercel/output
ルートディレクトリ: /
Node.js バージョン: 18
```

### 2. 環境変数設定

「設定」→「環境変数」

#### Production 環境
```bash
NEXT_PUBLIC_SUPABASE_URL=https://kldspkowaezkyiqwdsht.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZHNwa293YWV6a3lpcXdkc2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNzc1MTEsImV4cCI6MjA2Njg1MzUxMX0.VB4C2BeC8iIVNaEDhDNTYqL3At1MgEkTJGGOSDxZVE0
NODE_VERSION=18
```

#### Preview 環境（同じ値）
```bash
NEXT_PUBLIC_SUPABASE_URL=https://kldspkowaezkyiqwdsht.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZHNwa293YWV6a3lpcXdkc2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNzc1MTEsImV4cCI6MjA2Njg1MzUxMX0.VB4C2BeC8iIVNaEDhDNTYqL3At1MgEkTJGGOSDxZVE0
NODE_VERSION=18
```

### 3. 互換性設定

#### wrangler.toml (プロジェクト内)
```toml
name = "tournament-system"
compatibility_date = "2024-07-02"
compatibility_flags = ["nodejs_compat"]
```

## 📋 詳細設定説明

### ビルドコマンドの重要性

| コマンド | 動作 | 結果 |
|----------|------|------|
| `npm run build` | ❌ next build のみ実行 | Node.js形式、Cloudflareで動作不可 |
| `npm run pages:build` | ✅ @cloudflare/next-on-pages 実行 | Cloudflare対応形式に変換 |

### 出力ディレクトリの重要性

| 設定 | 内容 | 動的ルート | API ルート |
|------|------|------------|------------|
| `.next` | Node.js出力 | ❌ | ❌ |
| `.vercel/output/static` | 静的ファイルのみ | ❌ | ❌ |
| **`.vercel/output`** | **完全出力** | **✅** | **✅** |

### Node.js バージョン指定理由

- **v18**: @cloudflare/next-on-pages の推奨バージョン
- **v20**: サポート予定だが安定性でv18推奨
- **v16**: 古すぎて一部機能で問題発生の可能性

## 🔧 高度な設定オプション

### 1. ビルド時間最適化

環境変数に追加可能：
```bash
# ビルド時間短縮
NEXT_TELEMETRY_DISABLED=1
# キャッシュ最適化  
NPM_FLAGS="--prefer-offline --no-audit"
```

### 2. メモリ制限対応

大規模プロジェクトの場合：
```bash
NODE_OPTIONS="--max-old-space-size=4096"
```

### 3. TypeScript設定最適化

```bash
# 型チェックスキップでビルド高速化
NEXT_BUILD_SKIP_TYPE_CHECK=true
# ESLintスキップ
NEXT_BUILD_SKIP_LINT=true
```

## ⚙️ トラブルシューティング設定

### 1. ビルドタイムアウト対策

Cloudflareのデフォルトタイムアウト: 20分

長時間ビルド対策：
```bash
# 並列ビルド数制限
UV_THREADPOOL_SIZE=4
# npm install高速化
NPM_CONFIG_PREFER_OFFLINE=true
```

### 2. 依存関係の問題

```bash
# パッケージ解決強制
NPM_CONFIG_LEGACY_PEER_DEPS=true
# キャッシュクリア強制
NPM_CONFIG_CACHE=/tmp/.npm
```

## 🚀 デプロイ設定

### 1. プレビューデプロイ

```
プレビューデプロイ: 有効
ブランチプレビュー: main以外の全ブランチ
プレビュー環境変数: Preview環境の値を使用
```

### 2. プロダクションデプロイ

```
プロダクションブランチ: main
自動デプロイ: 有効
プロダクション環境変数: Production環境の値を使用
```

## 📊 パフォーマンス最適化設定

### 1. キャッシュ設定

Cloudflareが自動で最適化：
- 静的ファイル: 1年キャッシュ
- HTML: キャッシュなし（動的コンテンツ）
- API: キャッシュなし

### 2. 圧縮設定

自動で有効：
- Gzip圧縮
- Brotli圧縮  
- 画像最適化

## ✅ 設定完了チェックリスト

### 基本設定
- [ ] フレームワーク: Next.js
- [ ] ビルドコマンド: `npm run pages:build`
- [ ] 出力ディレクトリ: `.vercel/output`
- [ ] Node.js バージョン: 18

### 環境変数
- [ ] NEXT_PUBLIC_SUPABASE_URL (Production)
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY (Production)
- [ ] NEXT_PUBLIC_SUPABASE_URL (Preview)
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY (Preview)
- [ ] NODE_VERSION=18 (両環境)

### プロジェクト設定
- [ ] wrangler.toml に nodejs_compat フラグ
- [ ] package.json に pages:build スクリプト
- [ ] @cloudflare/next-on-pages インストール済み

### デプロイ確認
- [ ] キャッシュクリア実行
- [ ] ビルドログでエラーなし
- [ ] 全ページ動作確認

この設定で Next.js + Supabase アプリケーションが
Cloudflare Pages で完全に動作します。