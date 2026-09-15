-- Moonbeam Stories V246 — trusted adults and pets in Your Cast.
-- Safe to run if an earlier experimental cast_members table already exists.
create table if not exists public.cast_members (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  name text not null,
  age integer,
  relationship text,
  animal_type text,
  created_at timestamptz not null default now()
);
alter table public.cast_members add column if not exists parent_id uuid references auth.users(id) on delete cascade;
alter table public.cast_members add column if not exists kind text;
alter table public.cast_members add column if not exists name text;
alter table public.cast_members add column if not exists age integer;
alter table public.cast_members add column if not exists relationship text;
alter table public.cast_members add column if not exists animal_type text;
alter table public.cast_members add column if not exists created_at timestamptz default now();
alter table public.cast_members enable row level security;
drop policy if exists "moonbeam cast select own" on public.cast_members;
drop policy if exists "moonbeam cast insert own" on public.cast_members;
drop policy if exists "moonbeam cast update own" on public.cast_members;
drop policy if exists "moonbeam cast delete own" on public.cast_members;
create policy "moonbeam cast select own" on public.cast_members for select to authenticated using (parent_id = (select auth.uid()));
create policy "moonbeam cast insert own" on public.cast_members for insert to authenticated with check (parent_id = (select auth.uid()));
create policy "moonbeam cast update own" on public.cast_members for update to authenticated using (parent_id = (select auth.uid())) with check (parent_id = (select auth.uid()));
create policy "moonbeam cast delete own" on public.cast_members for delete to authenticated using (parent_id = (select auth.uid()));
create index if not exists cast_members_parent_created_idx on public.cast_members(parent_id, created_at);
