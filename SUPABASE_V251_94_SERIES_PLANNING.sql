-- V251.94 — developer-only Astra series and volume planning state.
alter table public.developer_story_series
  add column if not exists lead_cast_id uuid references public.cast_members(id) on delete set null,
  add column if not exists series_plan jsonb not null default '{}'::jsonb;

alter table public.developer_story_volumes
  add column if not exists story_target integer,
  add column if not exists plan jsonb not null default '{}'::jsonb,
  add column if not exists status text not null default 'planning';

alter table public.developer_story_volumes drop constraint if exists developer_story_volumes_story_target_check;
alter table public.developer_story_volumes add constraint developer_story_volumes_story_target_check
  check (story_target is null or story_target between 8 and 16);

grant select, insert, update, delete on table public.developer_story_series to service_role;
grant select, insert, update, delete on table public.developer_story_volumes to service_role;
grant select, insert, update, delete on table public.developer_story_volume_items to service_role;
