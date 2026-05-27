-- items テーブルに作者・著者カラムを追加する
-- （すでに items テーブルが存在する場合はこちらを実行）
alter table items add column if not exists author text;
