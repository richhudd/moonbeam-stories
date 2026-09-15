-- Moonbeam Stories V245 — supporting adults and pets in the Cast.
create table if not exists public.cast_members (
 id uuid primary key default gen_random_uuid(),
 parent_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('adult','pet')),
 name text not null check (char_length(name) between 1 and 60),
 detail text not null default '',
 created_at timestamptz not null default now()
);
alter table public.cast_members enable row level security;
create index if not exists cast_members_parent_idx on public.cast_members(parent_id,created_at);
drop policy if exists "cast members own rows" on public.cast_members;
create policy "cast members own rows" on public.cast_members for all to authenticated using (parent_id=auth.uid()) with check (parent_id=auth.uid());
-- Photos reuse the existing private child-profile-photos bucket under the signed-in user's folder.
