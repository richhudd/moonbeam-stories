-- V252.135 — persistent failed-password lockout for Fiction Studio X.
-- Server-side only: the app accesses this table with the Supabase secret/service key.
create table if not exists public.developer_fiction_x_login_attempts (
  user_id text primary key,
  failed_attempts integer not null default 0 check (failed_attempts >= 0 and failed_attempts <= 5),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.developer_fiction_x_login_attempts enable row level security;

-- No client policies are created intentionally. Fiction Studio X lockout state is
-- read/written only by the server-side service role / secret key.
create index if not exists developer_fiction_x_login_attempts_locked_until_idx
  on public.developer_fiction_x_login_attempts(locked_until)
  where locked_until is not null;
