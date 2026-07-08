-- =====================================================================
-- Raccoonie OS — Supabase schema (chạy trong SQL Editor của Supabase)
-- MVP: bảng phẳng, khớp với data model trong app. RLS bật + policy
-- tạm thời cho phép đọc/ghi public (đủ cho prototype). Khi có auth thật,
-- siết lại policy theo user/role.
-- =====================================================================

create table if not exists users (
  id text primary key,
  name text, role text, department text, avatar text, email text, status text
);

create table if not exists objectives (
  id text primary key,
  title text, type text, owner_id text,
  target_value numeric, current_value numeric,
  start_date date, end_date date, status text
);

create table if not exists business_events (
  id text primary key,
  name text, month int, start_date date, end_date date,
  type text, status text, owner_id text,
  linked_mission_ids text[]
);

create table if not exists missions (
  id text primary key,
  title text, objective_id text, event_id text, owner_id text,
  target_gmv numeric, current_gmv numeric, budget numeric,
  start_date date, end_date date, status text
);

create table if not exists campaigns (
  id text primary key,
  title text, mission_id text, owner_id text, channel text,
  target_gmv numeric, current_gmv numeric, budget numeric, spend numeric,
  roas numeric, start_date date, end_date date, status text
);

create table if not exists projects (
  id text primary key,
  title text, campaign_id text, type text, owner_id text,
  progress int, status text
);

create table if not exists tasks (
  id text primary key,
  title text, project_id text, assignee_id text, role text,
  priority text, status text, due_date date, description text,
  campaign_id text, product_id text, creative_id text
);

create table if not exists products (
  id text primary key,
  name text, sku text, category text, campaign_ids text[],
  lifecycle text, cost numeric, price numeric, margin numeric,
  product_score int, is_personalized bool, is_hero_product bool,
  is_seasonal bool, target_customer text, gmv numeric, orders int, status text
);

create table if not exists creatives (
  id text primary key,
  title text, campaign_id text, product_id text, type text,
  creator_id text, editor_id text, reviewer_id text, status text,
  platform text, hook text, content_angle text, publish_date date,
  views bigint, orders int, gmv numeric, performance_score int
);

create table if not exists playbooks (
  id text primary key,
  title text, type text, description text, timeline text,
  checklist text[], kpi text[], task_templates text[], lessons text[], assets text[]
);

create table if not exists decisions (
  id text primary key,
  title text, type text, description text, recommendation text,
  related_objective_id text, related_campaign_id text,
  priority text, status text, created_at timestamptz default now()
);

create table if not exists sales_metrics (
  id text primary key,
  date date, channel text, campaign_id text,
  gmv numeric, orders int, aov numeric, conversion_rate numeric,
  roas numeric, traffic int
);

create table if not exists inventory_items (
  id text primary key,
  product_id text, stock int, safety_stock int,
  forecast_days_left int, status text
);

-- ------------------------------------------------------------------
-- RLS: bật cho tất cả bảng + policy public tạm thời cho MVP
-- (⚠️ prototype only — khi lên production hãy thay bằng policy theo auth)
-- ------------------------------------------------------------------
do $$
declare t text;
begin
  for t in select unnest(array[
    'users','objectives','business_events','missions','campaigns','projects',
    'tasks','products','creatives','playbooks','decisions','sales_metrics','inventory_items'
  ]) loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "public_all" on %I;', t);
    execute format('create policy "public_all" on %I for all using (true) with check (true);', t);
  end loop;
end $$;

-- ------------------------------------------------------------------
-- Seed ví dụ (thêm dần các dòng còn lại theo mock data trong app)
-- ------------------------------------------------------------------
insert into products (id,name,sku,category,lifecycle,cost,price,margin,product_score,is_personalized,is_hero_product,is_seasonal,target_customer,gmv,orders,status)
values
 ('pr1','Đèn ngủ cá nhân hóa','DN-001','Đèn ngủ','Scale',62000,199000,46,92,true,true,false,'Gen Z tặng quà',412000000,2070,'Live'),
 ('pr2','Đèn ngủ Galaxy','DN-002','Đèn ngủ','Live',78000,249000,44,88,false,true,true,'Gen Z trang trí phòng',318000000,1277,'Live')
on conflict (id) do nothing;
