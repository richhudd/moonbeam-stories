-- Moonbeam Stories V170 — private cross-device child profile reference photos.
-- Run once in the Supabase SQL editor before deploying V170.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('child-profile-photos', 'child-profile-photos', false, 2097152, array['image/jpeg'])
on conflict (id) do update
set public = false,
    file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg'];

drop policy if exists "moonbeam child photos select own" on storage.objects;
drop policy if exists "moonbeam child photos insert own" on storage.objects;
drop policy if exists "moonbeam child photos update own" on storage.objects;
drop policy if exists "moonbeam child photos delete own" on storage.objects;

create policy "moonbeam child photos select own"
on storage.objects for select to authenticated
using (bucket_id = 'child-profile-photos' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "moonbeam child photos insert own"
on storage.objects for insert to authenticated
with check (bucket_id = 'child-profile-photos' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "moonbeam child photos update own"
on storage.objects for update to authenticated
using (bucket_id = 'child-profile-photos' and (storage.foldername(name))[1] = (select auth.uid()::text))
with check (bucket_id = 'child-profile-photos' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "moonbeam child photos delete own"
on storage.objects for delete to authenticated
using (bucket_id = 'child-profile-photos' and (storage.foldername(name))[1] = (select auth.uid()::text));
