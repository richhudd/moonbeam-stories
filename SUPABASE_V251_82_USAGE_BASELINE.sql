-- V251.82: persistent developer-controlled analytics baseline. Run once in Supabase SQL Editor.
create table if not exists public.moonbeam_admin_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table public.moonbeam_admin_settings enable row level security;
revoke all on table public.moonbeam_admin_settings from anon, authenticated;
grant all on table public.moonbeam_admin_settings to service_role;
insert into public.moonbeam_admin_settings(key,value,updated_at)
values ('usage_baseline_utc','2026-09-26T13:38:25Z',now())
on conflict (key) do nothing;
