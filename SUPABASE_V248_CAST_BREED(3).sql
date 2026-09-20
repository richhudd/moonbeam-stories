-- Moonbeam Stories V248 — optional pet breed for illustration scale/continuity
-- Safe to run after V246 cast_members migration.
alter table public.cast_members add column if not exists breed text;
