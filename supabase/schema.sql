-- ============================================================
-- boxkanri-app データベーススキーマ
-- Supabase ダッシュボード → SQL Editor で実行してください
-- ============================================================

-- boxes テーブル（箱）
create table if not exists boxes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  location   text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- items テーブル（物品）
create table if not exists items (
  id         uuid primary key default gen_random_uuid(),
  box_id     uuid references boxes(id) on delete cascade not null,
  name       text not null,
  category   text not null check (category in ('本', '雑誌', '資料', 'CD', 'DVD')),
  author     text,
  created_at timestamptz default now() not null
);

-- Row Level Security を有効化
alter table boxes enable row level security;
alter table items enable row level security;

-- boxes のポリシー（自分の箱のみ操作可能）
create policy "自分の箱を閲覧できる" on boxes
  for select using (auth.uid() = user_id);

create policy "自分の箱を作成できる" on boxes
  for insert with check (auth.uid() = user_id);

create policy "自分の箱を更新できる" on boxes
  for update using (auth.uid() = user_id);

create policy "自分の箱を削除できる" on boxes
  for delete using (auth.uid() = user_id);

-- items のポリシー（自分の箱に属する物品のみ操作可能）
create policy "自分の箱の物品を閲覧できる" on items
  for select using (
    exists (
      select 1 from boxes
      where boxes.id = items.box_id
        and boxes.user_id = auth.uid()
    )
  );

create policy "自分の箱に物品を追加できる" on items
  for insert with check (
    exists (
      select 1 from boxes
      where boxes.id = items.box_id
        and boxes.user_id = auth.uid()
    )
  );

create policy "自分の箱の物品を更新できる" on items
  for update using (
    exists (
      select 1 from boxes
      where boxes.id = items.box_id
        and boxes.user_id = auth.uid()
    )
  );

create policy "自分の箱の物品を削除できる" on items
  for delete using (
    exists (
      select 1 from boxes
      where boxes.id = items.box_id
        and boxes.user_id = auth.uid()
    )
  );

-- boxes.updated_at を UPDATE 時に自動更新するトリガー
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger boxes_updated_at
  before update on boxes
  for each row
  execute function update_updated_at_column();
