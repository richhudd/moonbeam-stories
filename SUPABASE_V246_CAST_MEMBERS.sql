-- Moonbeam Stories V246 — unified Cast migration.
-- One source of truth for children, trusted adults and pets.
-- Safe to run more than once. Existing child profile UUIDs are preserved so saved stories
-- and reference-photo object paths continue to identify the same child.

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

-- Remove obsolete experimental constraints before normalising the table.
do $$ declare c record; begin
  for c in select conname from pg_constraint where conrelid='public.cast_members'::regclass and contype='c'
  loop execute format('alter table public.cast_members drop constraint %I',c.conname); end loop;
  for c in select a.attname from pg_attribute a where a.attrelid='public.cast_members'::regclass
    and a.attnum>0 and not a.attisdropped and a.attnotnull
    and a.attname not in ('id','parent_id','kind','name','created_at')
  loop execute format('alter table public.cast_members alter column %I drop not null',c.attname); end loop;
end $$;

-- Migrate every existing child into the same Cast table, preserving its UUID.
-- ON CONFLICT makes this idempotent without overwriting a Cast profile that has already been edited.
insert into public.cast_members (id,parent_id,kind,name,age,relationship,animal_type,created_at)
select id,parent_id,'child',name,age,null,null,created_at
from public.child_profiles
on conflict (id) do nothing;

update public.cast_members set kind=lower(trim(kind)) where kind is not null;
update public.cast_members set kind='adult' where kind in ('trusted adult','trusted_adult','supporting adult','supporting_adult');
update public.cast_members set kind='pet' where kind in ('animal','companion');

alter table public.cast_members alter column id set default gen_random_uuid();
alter table public.cast_members alter column created_at set default now();
alter table public.cast_members alter column parent_id set not null;
alter table public.cast_members alter column kind set not null;
alter table public.cast_members alter column name set not null;
alter table public.cast_members add constraint cast_members_kind_v246_check check (kind in ('child','adult','pet'));
alter table public.cast_members add constraint cast_members_child_age_v246_check check (kind <> 'child' or age between 3 and 12);

-- V246 deliberately leaves child_profiles and saved_stories relationships untouched.
-- The legacy child table remains as a dormant safety copy while Cast becomes the live profile source.

alter table public.cast_members enable row level security;
drop policy if exists "moonbeam cast select own" on public.cast_members;
drop policy if exists "moonbeam cast insert own" on public.cast_members;
drop policy if exists "moonbeam cast update own" on public.cast_members;
drop policy if exists "moonbeam cast delete own" on public.cast_members;
create policy "moonbeam cast select own" on public.cast_members for select to authenticated using (parent_id=(select auth.uid()));
create policy "moonbeam cast insert own" on public.cast_members for insert to authenticated with check (parent_id=(select auth.uid()));
create policy "moonbeam cast update own" on public.cast_members for update to authenticated using (parent_id=(select auth.uid())) with check (parent_id=(select auth.uid()));
create policy "moonbeam cast delete own" on public.cast_members for delete to authenticated using (parent_id=(select auth.uid()));
create index if not exists cast_members_parent_created_idx on public.cast_members(parent_id,created_at);
-- Table privileges are required in addition to RLS policies.
-- RLS remains the security boundary: authenticated users can only access rows whose parent_id is their own auth.uid().
grant select, insert, update, delete on table public.cast_members to authenticated;
grant select on table public.cast_members to service_role;
