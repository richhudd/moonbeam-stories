-- V252.31 Fiction Studio Stage 2: separately persisted adult-fiction book plans.
create table if not exists public.developer_fiction_books (
  id uuid primary key default gen_random_uuid(), parent_id uuid not null references auth.users(id) on delete cascade,
  series_id uuid not null references public.developer_fiction_series(id) on delete cascade, position integer not null default 1,
  working_title text not null, premise text not null default '', book_plan jsonb not null default '{}'::jsonb,
  status text not null default 'planning', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(series_id, position)
);
create index if not exists developer_fiction_books_series_position_idx on public.developer_fiction_books(series_id,position);
alter table public.developer_fiction_books enable row level security;
revoke all on table public.developer_fiction_books from anon, authenticated;
grant select, insert, update, delete on table public.developer_fiction_books to service_role;
