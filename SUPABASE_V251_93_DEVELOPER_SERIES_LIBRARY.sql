-- V251.93 developer-only series library.
-- Access is intentionally via the existing server-side developer gate and service role,
-- not directly from authenticated client accounts.
create table if not exists public.developer_story_series (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  instructions text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.developer_story_volumes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  series_id uuid not null references public.developer_story_series(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.developer_story_volume_items (
  parent_id uuid not null references auth.users(id) on delete cascade,
  volume_id uuid not null references public.developer_story_volumes(id) on delete cascade,
  story_id uuid not null references public.saved_stories(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (story_id),
  unique (volume_id, position) deferrable initially deferred
);
create index if not exists developer_story_series_parent_idx on public.developer_story_series(parent_id, created_at);
create index if not exists developer_story_volumes_series_idx on public.developer_story_volumes(series_id, position);
create index if not exists developer_story_volume_items_volume_idx on public.developer_story_volume_items(volume_id, position);
alter table public.developer_story_series enable row level security;
alter table public.developer_story_volumes enable row level security;
alter table public.developer_story_volume_items enable row level security;
revoke all on public.developer_story_series from anon, authenticated;
revoke all on public.developer_story_volumes from anon, authenticated;
revoke all on public.developer_story_volume_items from anon, authenticated;
