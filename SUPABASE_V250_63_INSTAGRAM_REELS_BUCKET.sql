-- Moonbeam Stories V250.63
-- Dedicated private storage for rendered Instagram Reel MP4 files.
-- Safe to run more than once.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'instagram-reels',
  'instagram-reels',
  false,
  104857600,
  array['video/mp4']::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
