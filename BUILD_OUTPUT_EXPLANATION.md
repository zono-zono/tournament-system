# Cloudflare Pages 出力ディレクトリの重要性

## 🔥 なぜ `.vercel/output` が絶対必要なのか

### ビルドプロセスの流れ

```
npm run pages:build
    ↓
@cloudflare/next-on-pages 実行
    ↓
内部で next build 実行 → .next/ 生成
    ↓
Next.js が .vercel/output/ 生成 (Build Output API準拠)
    ↓
@cloudflare/next-on-pages が変換
    ↓
Cloudflare Workers対応 _worker.js 生成
```

### 各ディレクトリの役割

| ディレクトリ | 内容 | 用途 |
|-------------|------|------|
| `.next/` | Next.jsネイティブ出力 | Node.jsサーバー用 |
| `.vercel/output/static/` | 静的ファイルのみ | CDN配信用 |
| **`.vercel/output/`** | **静的 + 動的の統合** | **Cloudflare Pages完全対応** |

### `.vercel/output/` の構造

```
.vercel/output/
├── static/              # 静的ファイル (CSS, JS, 画像)
├── functions/           # サーバーレス関数 (API, SSR)
├── config.json          # ルーティング設定
└── package.json         # 依存関係
```

## ⚠️ 間違った設定の影響

### 1. `.next` を指定した場合
```
結果: 404エラー
理由: Node.js専用形式でCloudflareが解釈不可
```

### 2. `.vercel/output/static` を指定した場合  
```
結果: 静的ページのみ表示、動的ルートが404
理由: サーバーレス関数が含まれない
```

### 3. **`.vercel/output` を指定した場合**
```
結果: ✅ 完全動作
理由: 静的 + 動的の両方を含む完全な出力
```

## 🎯 正しい Cloudflare Pages 設定

### ダッシュボード設定
```
フレームワーク: Next.js
ビルドコマンド: npm run pages:build  
出力ディレクトリ: .vercel/output     ← 重要！
Node.js バージョン: 18
```

### なぜ `/static` を付けてはいけないか

- **`.vercel/output`**: 静的ファイル + サーバーレス関数の完全セット
- **`.vercel/output/static`**: 静的ファイルのみ（動的機能なし）

動的ルーティング（`/dashboard`, `/tournaments/[id]`）やAPI ルート（`/api/*`）は
サーバーレス関数として `.vercel/output/functions/` に配置されます。

`/static` を指定すると、この重要な `functions/` ディレクトリが除外され、
すべての動的機能が404エラーになります。

## 🔧 `@cloudflare/next-on-pages` の処理

1. **`.vercel/output/` を読み込み**
2. **静的ファイルはそのまま配置**  
3. **サーバーレス関数を `_worker.js` に統合**
4. **ルーティング設定を `_routes.json` で最適化**

この処理により、Next.js App Router のすべての機能が
Cloudflare Workers 上で動作するようになります。

## ✅ 設定確認チェックリスト

- [ ] ビルドコマンド: `npm run pages:build`
- [ ] 出力ディレクトリ: `.vercel/output` (← `/static` なし)
- [ ] 環境変数: Production + Preview 両方に設定
- [ ] wrangler.toml: `nodejs_compat` フラグ有効

この設定で、Next.js + Supabase アプリケーションが
Cloudflare Pages 上で完全に動作します。