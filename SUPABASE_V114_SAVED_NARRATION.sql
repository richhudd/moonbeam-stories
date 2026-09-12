-- V114: allow saved narration MP3 files in the existing private saved-story-art bucket.
-- Existing ownership/RLS policies from V68 continue to protect these files.
update storage.buckets
set allowed_mime_types = array['image/webp','image/jpeg','image/png','audio/mpeg']
where id = 'saved-story-art';
