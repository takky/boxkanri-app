# ボックス管理システム

レンタル倉庫に預けてある箱とその中身を管理するWebアプリです。

## 機能

- メールアドレス＋パスワードによる会員登録・ログイン
- 管理場所ごとの箱一覧（カード形式）
- 箱の登録・編集・削除（削除は物品0件のときのみ）
- 物品（本／雑誌／資料／CD／DVD）の登録・編集・削除
- 物品に作者・著者を記録
- 箱の登録日・更新日時の自動記録および手動更新
- トップページにカテゴリ別の物品統計を表示

## 技術スタック

| 用途 | 技術 |
|------|------|
| フロントエンド | React 18 + Vite 6 |
| ルーティング | React Router v6 |
| バックエンド / 認証 / DB | Supabase |
| スタイリング | バニラ CSS |
| ホスティング | Vercel |

## 開発環境のセットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/takky/boxkanri-app.git
cd boxkanri-app
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. 環境変数を設定

`.env` ファイルをプロジェクトルートに作成し、Supabase の接続情報を記載します。

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase のデータベースをセットアップ

Supabase ダッシュボード → **SQL Editor** で `supabase/schema.sql` の内容を実行します。

### 5. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## ビルド・デプロイ

```bash
npm run build    # 本番ビルド
npm run preview  # ビルド結果をローカルで確認
```

本番環境は Vercel にホスティングされており、`main` ブランチへのプッシュで自動デプロイされます。  
Vercel の **Settings → Environment Variables** に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定してください。

## 本番URL

[https://boxkanri-app.vercel.app/](https://boxkanri-app.vercel.app/)
