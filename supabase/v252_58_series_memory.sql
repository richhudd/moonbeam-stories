-- V252.58: evolving non-formulaic series continuity intelligence
alter table public.developer_fiction_series
  add column if not exists series_memory jsonb not null default '{"version":1,"last_updated_book":0,"established_canon":[],"characters":[],"unresolved_threads":[],"planted_details":[],"world_changes":[],"open_questions":[],"future_possibilities":[],"book_voice_refs":[]}'::jsonb;
