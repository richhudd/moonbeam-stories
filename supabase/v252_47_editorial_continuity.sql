-- V252.47 Fiction Studio: version-specific editorial continuity and resumable snapshots.
create table if not exists public.developer_fiction_editorial_continuity (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null,
  series_id uuid not null,
  book_id uuid not null,
  run_id uuid not null references public.developer_fiction_editorial_runs(id) on delete cascade,
  source_stage text not null,
  ledger jsonb not null default '{}'::jsonb,
  through_chapter integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(run_id)
);
create index if not exists developer_fiction_editorial_continuity_book_idx on public.developer_fiction_editorial_continuity(book_id, created_at);
alter table public.developer_fiction_editorial_continuity enable row level security;
revoke all on table public.developer_fiction_editorial_continuity from anon, authenticated;
grant select, insert, update, delete on table public.developer_fiction_editorial_continuity to service_role;

alter table public.developer_fiction_editorial_chapters
  add column if not exists continuity_snapshot jsonb not null default '{}'::jsonb;
