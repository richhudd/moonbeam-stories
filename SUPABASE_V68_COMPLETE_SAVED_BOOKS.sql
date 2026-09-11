-- Moonbeam Stories V68 — complete cloud-saved books
-- Run this once in Supabase SQL Editor BEFORE deploying V68.

alter table public.saved_stories
  add column if not exists saved_assets jsonb not null default '{}'::jsonb;

comment on column public.saved_stories.saved_assets is
  'Private Supabase Storage paths for the exact finished cover and page illustrations of a saved book.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('saved-story-art', 'saved-story-art', false, 6291456, array['image/webp','image/jpeg','image/png'])
on conflict (id) do update set public = false;

-- Each object path begins with the authenticated parent UUID:
-- <parent_uuid>/<saved_story_uuid>/cover.webp and page-0.webp ... page-5.webp

drop policy if exists "Parents can read own saved story art" on storage.objects;
create policy "Parents can read own saved story art"
on storage.objects for select to authenticated
using (bucket_id = 'saved-story-art' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Parents can upload own saved story art" on storage.objects;
create policy "Parents can upload own saved story art"
on storage.objects for insert to authenticated
with check (bucket_id = 'saved-story-art' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Parents can update own saved story art" on storage.objects;
create policy "Parents can update own saved story art"
on storage.objects for update to authenticated
using (bucket_id = 'saved-story-art' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'saved-story-art' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Parents can delete own saved story art" on storage.objects;
create policy "Parents can delete own saved story art"
on storage.objects for delete to authenticated
using (bucket_id = 'saved-story-art' and (storage.foldername(name))[1] = auth.uid()::text);
