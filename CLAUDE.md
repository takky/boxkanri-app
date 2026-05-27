# CLAUDE.md

## プロジェクト概要

**boxkanri-app** — レンタル倉庫に預けてある箱とその中身を管理するWebアプリ。

### 主な機能
- Supabase 認証（メール＋パスワード）
- 管理場所ごとの箱一覧（カード形式）
- 箱の登録・編集・削除（削除は物品0件のときのみ）
- 物品（本/雑誌/資料/CD/DVD）の登録・編集・削除
- 箱の登録日・更新日時の自動記録

## 技術スタック

| 用途 | 技術 |
|------|------|
| フロントエンド | React 18 + Vite 6 |
| ルーティング | React Router v6 |
| バックエンド / 認証 / DB | Supabase |
| スタイリング | バニラ CSS（`src/index.css`） |

## ディレクトリ構成

```
boxkanri-app/
├── index.html
├── vite.config.js
├── package.json
├── .env                        # Supabase キー（.gitignore 対象）
├── .gitignore
├── supabase/
│   └── schema.sql              # DB テーブル・RLS・トリガー定義
└── src/
    ├── main.jsx                # エントリーポイント
    ├── App.jsx                 # ルート定義
    ├── index.css               # グローバルスタイル
    ├── supabase.js             # Supabase クライアント
    ├── contexts/
    │   └── AuthContext.jsx     # 認証コンテキスト
    ├── components/
    │   └── ProtectedRoute.jsx  # 未ログイン時リダイレクト
    └── pages/
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── LocationsPage.jsx   # 管理場所一覧（トップ）
        ├── LocationDetailPage.jsx
        ├── NewBoxPage.jsx
        └── BoxDetailPage.jsx
```

## デプロイ情報

| 項目 | 内容 |
|------|------|
| 本番URL | https://boxkanri-app.vercel.app/ |
| ホスティング | Vercel |
| Supabaseプロジェクト名 | boxkanri-app |

環境変数（`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`）は Vercel ダッシュボードの **Settings → Environment Variables** で管理する。

## 開発コマンド

```bash
npm install        # 依存パッケージをインストール
npm run dev        # 開発サーバー起動（http://localhost:5173）
npm run build      # 本番ビルド
npm run preview    # ビルド結果をプレビュー
```

## Supabase セットアップ

初回のみ、Supabase ダッシュボード → **SQL Editor** で `supabase/schema.sql` を実行する。

- テーブル: `boxes`（箱）、`items`（物品）
- Row Level Security（RLS）: 自分のデータのみ操作可能
- トリガー: `boxes` の UPDATE 時に `updated_at` を自動更新

## Git 運用ルール

### ブランチ戦略

- `main` — 本番相当の安定ブランチ。直接コミット禁止。
- `feature/<topic>` — 機能追加・変更はここで作業し、PR 経由で `main` にマージ。

### コード変更のたびに GitHub へプッシュする

コードを少しでも変更したら、必ず以下の手順を実行すること。

```bash
git add <変更ファイル>
git commit -m "わかりやすいコミットメッセージ"
git push origin <現在のブランチ名>
```

> **Claude Code への指示**: コードを編集・作成・削除した場合は、変更後に自動で `git add → git commit → git push` を実行すること。ただし `main` への直接プッシュは行わず、作業ブランチにプッシュすること。

### コミットメッセージ規約

```
<種別>: <何をしたか（日本語）>

例:
feat: 箱登録フォームを追加
fix: アイテム検索で大文字小文字を区別しないよう修正
refactor: Box モデルのバリデーションを整理
docs: CLAUDE.md にディレクトリ構成を追記
```

| 種別 | 用途 |
|------|------|
| `feat` | 新機能追加 |
| `fix` | バグ修正 |
| `refactor` | 動作を変えないコード整理 |
| `docs` | ドキュメントのみの変更 |
| `chore` | ビルド・設定などの雑務 |

### PR ルール

- 1 PR = 1 つの目的に絞る
- PR 本文には「何を・なぜ変えたか」を日本語で記載する

## コーディング規約

- コメントは日本語で記載する（「なぜ」を一行で）
- 不要なエラーハンドリング・将来のための抽象化は入れない
- セキュリティ上の問題（SQLインジェクション・XSS等）は即座に修正する
