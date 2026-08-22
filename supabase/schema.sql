-- This app's own Supabase project (focus-workspace). Kept here for
-- reference/version control; the live schema was applied via migration.
create extension if not exists pgcrypto;

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('school','outside','college_prep')) default 'school',
  source text not null check (source in ('manual','schoology','calendar')) default 'manual',
  status text not null check (status in ('todo','in_progress','done')) default 'todo',
  due_at timestamptz,
  notes text,
  reviewable boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  type text not null check (type in ('work','review')) default 'work',
  is_weekend boolean not null default false,
  task_id uuid references tasks(id) on delete set null,
  confirmed_at timestamptz,
  extended_to_100 boolean not null default false,
  break_length_min int,
  crash_mode boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists review_blocks (
  id uuid primary key default gen_random_uuid(),
  block_date date not null,
  kind text not null check (kind in ('daily_short','weekend_big','pre_exam')),
  notes text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists sleep_log (
  id uuid primary key default gen_random_uuid(),
  log_date date not null unique,
  target_wake time,
  target_bedtime time,
  actual_sleep_at timestamptz,
  actual_wake_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id int primary key default 1,
  weekday_wake time not null default '06:30',
  weekend_wake time not null default '08:30',
  sat_exam_date date,
  college_deadlines jsonb not null default '[]',
  blocked_sites jsonb not null default '[]',
  quotes jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

create table if not exists messages_queue (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('gmail','slack')),
  external_id text,
  summary text not null,
  received_at timestamptz not null default now(),
  seen boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists messages_queue_source_external_id_idx on messages_queue(source, external_id);

alter table tasks enable row level security;
alter table sessions enable row level security;
alter table review_blocks enable row level security;
alter table sleep_log enable row level security;
alter table settings enable row level security;
alter table messages_queue enable row level security;
-- No anon policies: all access goes through Next.js API routes using the
-- service role key server-side (see lib/supabaseAdmin.js).
