-- Moonbeam Stories V251.77 — resumable partial story generations
create table if not exists public.partial_story_generations (
  id uuid primary key,
  parent_id uuid not null references auth.users(id) on delete cascade,
  generation_run_id text,
  story_credit_batch_id text,
  child jsonb not null default '{}'::jsonb,
  plan jsonb not null default '{}'::jsonb,
  reference_paths jsonb not null default '[]'::jsonb,
  artwork_paths jsonb not null default '[]'::jsonb,
  stage text not null default 'illustrations',
  status text not null default 'active' check (status in ('active','saved_later')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.partial_story_generations enable row level security;
drop policy if exists "partial stories own rows" on public.partial_story_generations;
create policy "partial stories own rows" on public.partial_story_generations for all using (auth.uid() = parent_id) with check (auth.uid() = parent_id);
create index if not exists partial_story_generations_parent_updated on public.partial_story_generations(parent_id,updated_at desc);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('partial-story-art','partial-story-art',false,10485760,array['image/webp','image/jpeg','image/png'])
on conflict (id) do update set public=false;
drop policy if exists "partial story art own objects" on storage.objects;
create policy "partial story art own objects" on storage.objects for all
using (bucket_id='partial-story-art' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='partial-story-art' and (storage.foldername(name))[1]=auth.uid()::text);
