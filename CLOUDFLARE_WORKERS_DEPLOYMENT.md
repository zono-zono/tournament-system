# Cloudflare Workers デプロイメント完全ガイド

## 🔥 重要な理解

**Cloudflare Pages = 自動的に Cloudflare Workers 上で実行**

- Cloudflare Pages を使用することで、自動的に Workers の力を活用
- 手動でワーカーズにデプロイする必要はなし
- `@cloudflare/next-on-pages` がすべてを処理

## 🎯 完全設定手順

### 1. Cloudflare Pages ダッシュボード設定

**「設定」 > 「ビルド & デプロイ」**

```
フレームワーク: Next.js
ビルドコマンド: npm run pages:build
出力ディレクトリ: .vercel/output
Node.js バージョン: 18
```

### 2. 環境変数設定 (最重要)

**「設定」 > 「環境変数」**

Production と Preview の両方に設定：

```bash
# Supabase 接続情報
NEXT_PUBLIC_SUPABASE_URL=https://kldspkowaezkyiqwdsht.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZHNwa293YWV6a3lpcXdkc2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNzc1MTEsImV4cCI6MjA2Njg1MzUxMX0.VB4C2BeC8iIVNaEDhDNTYqL3At1MgEkTJGGOSDxZVE0

# サーバーサイド用 (シークレットとして設定)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **重要**: サービスロールキーは「Add secret」で暗号化設定

### 3. プロジェクト設定ファイル

#### package.json
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "pages:build": "npx @cloudflare/next-on-pages",
    "preview": "npx wrangler pages dev .vercel/output",
    "deploy": "npm run pages:build && wrangler pages deploy .vercel/output"
  }
}
```

#### wrangler.toml
```toml
name = "tournament-system"
compatibility_date = "2024-07-02"
compatibility_flags = ["nodejs_compat"]
```

**重要**: `nodejs_compat` フラグでSupabase等のNode.js APIが動作

### 4. デプロイ手順

1. **キャッシュクリア + 再デプロイ**
   - Cloudflare Pages ダッシュボード
   - 「Deployments」→ 最新デプロイ
   - 「Re-deploy」→ **「Clear cache and re-deploy」**

2. **設定確認**
   - ビルドコマンド: `npm run pages:build`
   - 出力ディレクトリ: `.vercel/output`
   - 環境変数: 両方の環境に設定済み

3. **ビルドログ確認**
   - エラーがないか確認
   - `@cloudflare/next-on-pages` の正常実行を確認

## 🔧 トラブルシューティング

### よくある問題と解決

1. **再帰ビルドエラー**
   ```
   Error: vercel build must not recursively invoke itself
   ```
   **解決**: `package.json` で `build` と `pages:build` を分離

2. **環境変数未設定**
   ```
   TypeError: Cannot read properties of undefined
   ```
   **解決**: Cloudflare ダッシュボードで環境変数を設定

3. **Node.js 互換性エラー**
   ```
   ReferenceError: require is not defined
   ```
   **解決**: `wrangler.toml` に `nodejs_compat` フラグを追加

4. **404 エラー (動的ルート)**
   **解決**: 出力ディレクトリを `.vercel/output` に設定

## 🎯 成功の確認項目

デプロイ成功後、以下をテスト：

- ✅ `/` トップページ表示
- ✅ `/auth/login` ログインページ
- ✅ `/auth/sign-up` サインアップページ  
- ✅ `/dashboard` 認証後ダッシュボード
- ✅ `/tournaments/[id]` 動的ルート
- ✅ Supabase 認証フロー
- ✅ API ルート (`/api/*`)

## 📊 Cloudflare Workers 上での実行確認

Pages 経由でデプロイしたアプリは自動的に以下で動作：

- **静的ファイル**: Cloudflare CDN で配信
- **動的処理**: Cloudflare Workers で実行
- **エッジロケーション**: 世界中のエッジで高速実行
- **サーバーレス**: 自動スケーリング

## 🚀 パフォーマンス最適化

Workers 上での最適な動作のため：

1. **Edge Runtime の活用**
   - API ルートで `export const runtime = 'edge'` を指定
   - より高速な起動時間を実現

2. **キャッシュ戦略**
   - Cloudflare の自動キャッシュを活用
   - 静的ファイルは自動でエッジキャッシュ

3. **地理的分散**
   - ユーザーに最も近いエッジで実行
   - レイテンシの大幅削減

---

このガイドに従うことで、Next.js + Supabase アプリケーションが Cloudflare Workers (Pages経由) で完全に動作します。