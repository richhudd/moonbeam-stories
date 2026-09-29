-- V252.43 Fiction Studio: immutable stage model provenance, exact usage ledger, versioned editorial pipeline.
alter table public.developer_fiction_series add column if not exists development_model text;
alter table public.developer_fiction_books add column if not exists development_model text;
alter table public.developer_fiction_books add column if not exists manuscript_model text;
alter table public.developer_fiction_books add column if not exists editorial_state jsonb not null default '{}'::jsonb;

create table if not exists public.developer_fiction_usage_events (
  id uuid primary key default gen_random_uuid(), parent_id uuid not null, series_id uuid not null,
  book_id uuid null, stage text not null, substage text null, model text not null,
  response_id text null, attempt integer not null default 1, ok boolean not null default false,
  http_status integer null, started_at timestamptz not null, completed_at timestamptz not null,
  duration_ms bigint not null default 0, input_tokens bigint not null default 0,
  cached_input_tokens bigint not null default 0, cache_write_tokens bigint not null default 0,
  output_tokens bigint not null default 0, reasoning_tokens bigint not null default 0,
  cost_usd numeric(18,8) not null default 0, pricing_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists developer_fiction_usage_response_uidx on public.developer_fiction_usage_events(response_id) where response_id is not null;
create index if not exists developer_fiction_usage_series_idx on public.developer_fiction_usage_events(series_id, created_at);
create index if not exists developer_fiction_usage_book_idx on public.developer_fiction_usage_events(book_id, created_at);
alter table public.developer_fiction_usage_events enable row level security;
revoke all on table public.developer_fiction_usage_events from anon, authenticated;
grant select, insert, update, delete on table public.developer_fiction_usage_events to service_role;

create table if not exists public.developer_fiction_editorial_runs (
  id uuid primary key default gen_random_uuid(), parent_id uuid not null, series_id uuid not null, book_id uuid not null,
  stage text not null, model text not null, status text not null default 'running', source_stage text not null,
  editorial_plan jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), completed_at timestamptz null
);
create index if not exists developer_fiction_editorial_runs_book_idx on public.developer_fiction_editorial_runs(book_id, created_at);
alter table public.developer_fiction_editorial_runs enable row level security;
revoke all on table public.developer_fiction_editorial_runs from anon, authenticated;
grant select, insert, update, delete on table public.developer_fiction_editorial_runs to service_role;

create table if not exists public.developer_fiction_editorial_chapters (
  id uuid primary key default gen_random_uuid(), parent_id uuid not null, series_id uuid not null, book_id uuid not null,
  run_id uuid not null references public.developer_fiction_editorial_runs(id) on delete cascade,
  chapter_number integer not null, chapter_title text not null default '', manuscript text not null,
  created_at timestamptz not null default now(), unique(run_id, chapter_number)
);
create index if not exists developer_fiction_editorial_chapters_run_idx on public.developer_fiction_editorial_chapters(run_id, chapter_number);
alter table public.developer_fiction_editorial_chapters enable row level security;
revoke all on table public.developer_fiction_editorial_chapters from anon, authenticated;
grant select, insert, update, delete on table public.developer_fiction_editorial_chapters to service_role;
-- Provenance backfill for work that predates selectors. Fiction Studio used Astra exclusively before V252.43.
update public.developer_fiction_series set development_model='gpt-6-astra' where development_model is null and series_bible <> '{}'::jsonb;
update public.developer_fiction_books set development_model='gpt-6-astra' where development_model is null and book_plan <> '{}'::jsonb;
update public.developer_fiction_books b set manuscript_model='gpt-6-astra' where manuscript_model is null and exists (select 1 from public.developer_fiction_chapters c where c.book_id=b.id);
