alter table public.developer_fiction_books add column if not exists development_state jsonb not null default '{}'::jsonb;
alter table public.developer_fiction_books add column if not exists generation_state jsonb not null default '{}'::jsonb;
alter table public.developer_fiction_books add column if not exists usage jsonb not null default '{}'::jsonb;
alter table public.developer_fiction_books add column if not exists updated_at timestamptz not null default now();
grant select, insert, update, delete on table public.developer_fiction_books to service_role;
