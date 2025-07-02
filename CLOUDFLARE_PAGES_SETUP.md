# Cloudflare Pages 完全設定ガイド

## 🚨 重要: 404エラーを完全に解決するための設定

このガイドに従って設定することで、Next.js App Routerの動的ルーティングを含むすべてのページが正常に動作します。

## 1. Cloudflare Pages ダッシュボード設定

### ビルド設定（最重要）

Cloudflare Pages プロジェクトの **「設定」 > 「ビルド & デプロイ」** で以下のように設定：

```
フレームワーク: Next.js
ビルドコマンド: npm run build
出力ディレクトリ: .vercel/output
Node.js バージョン: 18
```

⚠️ **絶対に注意**: 出力ディレクトリは `.vercel/output` であり、`.vercel/output/static` ではありません。

### 理由
- `.vercel/output` には静的ファイル (`static/`) とサーバーレス関数 (`functions/`) の両方が含まれる
- `.vercel/output/static` だけを指定すると、動的ルーティングを処理するサーバーレス関数がデプロイされず404エラーになる

## 2. 環境変数設定

**「設定」 > 「環境変数」** で Production と Preview 両方に設定：

```
NEXT_PUBLIC_SUPABASE_URL=https://kldspkowaezkyiqwdsht.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZHNwa293YWV6a3lpcXdkc2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNzc1MTEsImV4cCI6MjA2Njg1MzUxMX0.VB4C2BeC8iIVNaEDhDNTYqL3At1MgEkTJGGOSDxZVE0
```

## 3. 設定変更後の確認手順

1. **設定保存**: Cloudflare Pages ダッシュボードで設定を保存
2. **再デプロイ**: 最新のコミットを再デプロイ
3. **ビルドログ確認**: デプロイメントログでエラーがないか確認
4. **動作確認**: 以下のページが正常に表示されることを確認
   - `/` (トップページ)
   - `/auth/login` (ログインページ)
   - `/auth/sign-up` (サインアップページ)
   - `/dashboard` (認証後のダッシュボード)

## 4. トラブルシューティング

### まだ404エラーが出る場合

1. **キャッシュクリア**: ブラウザのキャッシュをクリア
2. **DNS伝播待機**: 最大24時間待機
3. **設定再確認**: 出力ディレクトリが正確に `.vercel/output` になっているか確認

### ビルドエラーが出る場合

1. **Node.js バージョン**: 18に設定されているか確認
2. **環境変数**: 両方の変数が正しく設定されているか確認
3. **ビルドログ**: 詳細なエラーメッセージを確認

## 5. 成功の指標

以下がすべて動作すれば設定成功：

- ✅ トップページの表示
- ✅ 認証フロー（サインアップ/ログイン）
- ✅ 動的ルーティング (`/dashboard`, `/tournaments/[id]` など)
- ✅ API ルート (`/api/*`)
- ✅ Supabase連携機能

## 6. 参考情報

- [Cloudflare Pages Next.js ドキュメント](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
- [@cloudflare/next-on-pages ドキュメント](https://github.com/cloudflare/next-on-pages)

---

このガイドに従って設定することで、Next.js + Supabaseアプリケーションが Cloudflare Pages で完全に動作するようになります。