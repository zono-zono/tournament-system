# なぜ `.vercel/output` を使用するのか？

## 🤔 疑問：Vercelを使っていないのになぜ"vercel"が含まれる？

これは非常に良い質問です。混乱しやすいポイントなので詳しく説明します。

## 📋 答え：Vercel Build Output API という業界標準

### 1. Vercel Build Output API とは

- **業界標準の仕様**: Next.jsアプリを「静的ファイル + サーバーレス関数」に変換する標準的な方法
- **プラットフォーム非依存**: Vercel以外のプラットフォームでも採用されている
- **互換性確保**: この形式を使うことで、複数のホスティングサービスで同じアプリが動作

### 2. Cloudflare Pages の採用理由

Cloudflare Pages が Vercel Build Output API を採用した理由：

```
✅ Next.js の完全サポート
✅ 静的サイト + サーバーレス関数の統合
✅ 業界標準への準拠
✅ 開発者の移行コスト削減
```

### 3. 実際の仕組み

```bash
npm run pages:build  # @cloudflare/next-on-pages を実行
↓
next build          # Next.js の標準ビルド
↓
変換処理             # Vercel Build Output API 形式に変換
↓
.vercel/output/     # 以下の構造で出力
├── static/         # 静的ファイル (HTML, CSS, JS, 画像など)
├── functions/      # サーバーレス関数 (動的ルート, API)
└── config.json     # 設定ファイル
```

### 4. 他のプラットフォームでの採用例

- **Netlify**: 同様の出力形式をサポート
- **Railway**: Build Output API 互換
- **Render**: 一部機能でサポート

## 🔧 技術的な詳細

### なぜ `.vercel/output/static` ではダメなのか？

```
❌ .vercel/output/static 
   └── 静的ファイルのみ → 動的ルートが404エラー

✅ .vercel/output
   ├── static/      → 静的ファイル
   └── functions/   → サーバーレス関数 (動的ルート対応)
```

### 実際のファイル構造例

```
.vercel/output/
├── static/
│   ├── _next/           # Next.js アセット
│   ├── index.html       # トップページ
│   └── auth/
│       ├── login.html   # 静的ログインページ
│       └── sign-up.html # 静的サインアップページ
├── functions/
│   ├── dashboard.func   # /dashboard の動的処理
│   ├── api/
│   │   └── auth.func    # /api/auth エンドポイント
│   └── tournaments/
│       └── [id].func    # /tournaments/[id] 動的ルート
└── config.json          # ルーティング設定
```

## 💡 まとめ

1. **"vercel" という名前だが、Vercelサービスは使用していない**
2. **Vercel Build Output API という業界標準を使用**
3. **Cloudflare Pages が この標準をサポートしている**
4. **結果として、Next.js の全機能が Cloudflare Pages で動作**

これにより、Next.js のアプリケーションが本来持つすべての機能（静的生成、サーバーサイドレンダリング、動的ルーティング、API ルート）が Cloudflare Pages でも完全に動作します。

## 🔗 参考資料

- [Vercel Build Output API 仕様](https://vercel.com/docs/build-output-api/v3)
- [Cloudflare Pages Next.js サポート](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
- [@cloudflare/next-on-pages ドキュメント](https://github.com/cloudflare/next-on-pages)