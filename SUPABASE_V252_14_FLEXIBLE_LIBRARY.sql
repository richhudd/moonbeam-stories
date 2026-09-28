-- V252.14 — flexible developer publishing library.
-- Series are top-level optional containers. Volumes may be loose or belong to a Series.
-- Stories may be loose, belong to a Volume, or belong directly to a Series.

alter table public.developer_story_volumes
  alter column series_id drop not null;

alter table public.developer_story_volumes
  drop constraint if exists developer_story_volumes_series_id_fkey;
alter table public.developer_story_volumes
  add constraint developer_story_volumes_series_id_fkey
  foreign key (series_id) references public.developer_story_series(id) on delete set null;

create table if not exists public.developer_story_series_items (
  parent_id uuid not null references auth.users(id) on delete cascade,
  series_id uuid not null references public.developer_story_series(id) on delete cascade,
  story_id uuid not null references public.saved_stories(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (story_id),
  unique (series_id, position) deferrable initially deferred
);
create index if not exists developer_story_series_items_series_idx
  on public.developer_story_series_items(series_id, position);
alter table public.developer_story_series_items enable row level security;
revoke all on public.developer_story_series_items from anon, authenticated;
grant select, insert, update, delete on table public.developer_story_series_items to service_role;

grant select, insert, update, delete on table public.developer_story_series to service_role;
grant select, insert, update, delete on table public.developer_story_volumes to service_role;
grant select, insert, update, delete on table public.developer_story_volume_items to service_role;
