-- V252.147 — canonical Asunder female profile records.
-- Developer-only/server-side Fiction Studio storage. No browser RLS policies are granted.
create table if not exists public.developer_fiction_asunder_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  series_id uuid not null references public.developer_fiction_series(id) on delete cascade,
  character_key text not null,
  full_name text not null,
  first_name text not null,
  template_id text not null default 'asunder_profile_page_v1',
  appearance_spec jsonb not null default '{}'::jsonb,
  profile_data jsonb not null default '{}'::jsonb,
  photo_prompt text not null default '',
  portrait_path text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(parent_id,series_id,character_key)
);
create index if not exists developer_fiction_asunder_profiles_series_idx
  on public.developer_fiction_asunder_profiles(parent_id,series_id,updated_at desc);
alter table public.developer_fiction_asunder_profiles enable row level security;
revoke all on table public.developer_fiction_asunder_profiles from anon, authenticated;

-- Dedicated private Fiction Studio artwork bucket; server-side API access only.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('fiction-studio-art','fiction-studio-art',false,10485760,array['image/webp','image/png','image/jpeg'])
on conflict (id) do update set public=false;
