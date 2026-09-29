alter table public.developer_fiction_series add column if not exists autopilot_state jsonb not null default '{}'::jsonb;
grant select, insert, update, delete on table public.developer_fiction_series to service_role;
