-- V252.29 — developer-only Fiction Studio storage.
-- Deliberately NO authenticated-client policies are created. The browser cannot read or write
-- these rows through Supabase. Access is only through Moonbeam's server-side developer-gated API.
create table if not exists public.developer_fiction_series (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  pen_name text not null,
  series_name text not null,
  genre text not null,
  idea text not null default '',
  heat_level text not null default '',
  target_length integer not null default 80000 check (target_length between 30000 and 150000),
  series_bible jsonb not null default '{}'::jsonb,
  status text not null default 'development',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists developer_fiction_series_parent_updated_idx on public.developer_fiction_series(parent_id,updated_at desc);
alter table public.developer_fiction_series enable row level security;
revoke all on table public.developer_fiction_series from anon, authenticated;
