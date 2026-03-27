# Hatarakikata（働き方）

キャリアジャーニーの可視化と AI によるキャリアガイダンスを提供する Web アプリケーション。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript 5 |
| スタイリング | Tailwind CSS 4 |
| データベース | PostgreSQL (Supabase) |
| ORM | Drizzle ORM |
| 認証 | Supabase SSR |
| AI | OpenAI API (GPT, Embeddings) |
| 状態管理 | TanStack React Query |
| フォーム | React Hook Form + Zod |

## 主な機能

- **キャリアマップ作成** — 自分のキャリアジャーニーをタイムラインとして記録
- **キャリアイベント管理** — キャリアの転機やマイルストーンを登録・編集
- **AI キャリアガイド** — OpenAI を活用したキャリアアドバイスの生成
- **類似キャリア検索** — ベクトル埋め込みによる類似キャリアパスのマッチング
- **キャリア質問** — キャリアに関するアセスメント機能
- **クレジット・プラン管理** — サブスクリプションベースのアクセス制御

## プロジェクト構成

```
├── app/                    # Next.js App Router（ページ・API・Server Actions）
│   ├── (authorized)/       #   認証済みユーザー向けページ
│   ├── (guest)/            #   ゲスト向けページ（ログイン・サインアップ等）
│   ├── api/                #   API エンドポイント
│   └── actions/            #   Server Actions
├── core/                   # ドメイン層（DDD）
│   ├── domain/             #   エンティティ・値オブジェクト・ドメインサービス
│   ├── application/        #   ユースケース・アプリケーションサービス
│   ├── error/              #   カスタムエラー
│   └── util/               #   ユーティリティ
├── infrastructure/         # インフラ層（外部連携・データアクセス）
│   ├── server/drizzle/     #   DB スキーマ・クエリ・コマンド
│   ├── server/ai/          #   OpenAI 連携
│   ├── server/supabase/    #   Supabase 認証・ストレージ
│   └── browser/            #   ブラウザ側アダプタ
├── server/                 # サーバーサイドユーティリティ
├── ui/                     # フロントエンド（コンポーネント・フック・プロバイダ）
├── cli/                    # CLI コマンド（データ管理）
├── data/                   # シードデータ（サンプルプロフィール・ストーリー）
└── docs/                   # ドキュメント・分析レポート
```

## セットアップ

### 前提条件

- Node.js
- PostgreSQL（Supabase）
- OpenAI API キー

### 環境変数

`.env` ファイルに以下を設定:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
OPENAI_API_KEY=
```

### 開発サーバーの起動

```bash
npm install
npm run dev
```

http://localhost:3000 でアクセス。

## CLI コマンド

```bash
npm run seed                  # データベースにサンプルデータを投入
npm run import-users          # ユーザーデータのインポート
npm run import-users:all      # 全ユーザーデータのインポート
npm run delete-users          # 指定ユーザーの削除
npm run delete-users:all      # 全ユーザーの削除
npm run career-map:embed      # キャリアマップのベクトル埋め込み生成
npm run career-map:search     # 類似キャリアマップの検索
npm run career-map:compare    # キャリアマップの比較分析
npm run readjust-rows         # データベース行の調整
```
