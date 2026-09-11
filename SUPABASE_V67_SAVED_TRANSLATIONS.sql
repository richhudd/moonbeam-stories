-- Moonbeam Stories V67: store one-off translations of saved stories.
-- Run this in Supabase SQL Editor before deploying V67.
alter table public.saved_stories
  add column if not exists translations jsonb not null default '{}'::jsonb;

comment on column public.saved_stories.translations is
  'Cached text-only translations keyed by Moonbeam locale. Illustrations remain those of the original saved story.';
