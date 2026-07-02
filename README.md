# iphone-app-research

App Store の有料アプリ市場を分析するリサーチツール。個人開発者向け。

## リポジトリの構成

このリポジトリはソースコード専用です。仕様書・設計ドキュメントは別のObsidianリポジトリで管理しています。

| 種類 | 場所 |
|---|---|
| ソースコード（このリポジトリ） | https://github.com/helloworlddddddd/iphone-app-research |
| 仕様書・設計ドキュメント | Obsidianリポジトリ（obsidianMemo）内 `ビジネス/16売れ筋App調査サービス/` |

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js + Tailwind CSS |
| データベース | Supabase (PostgreSQL) |
| ホスティング | Vercel |
| バッチ処理 | GitHub Actions（毎日JST10時） |
| 外部データ | Apple RSS Feeds / iTunes Search API |

## ローカル開発

```bash
npm install
cp .env.local.example .env.local  # キーを記入
npm run dev                        # http://localhost:3000
```

## バッチを手動で実行

```bash
npx tsx scripts/batch.ts
```

## 環境変数

`.env.local.example` を参照。Supabaseのプロジェクト設定から取得。

| 変数名 | 用途 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 読み取り用公開キー |
| `SUPABASE_SERVICE_ROLE_KEY` | バッチ書き込み用秘密キー |
