alter table public.developer_fiction_series
  add column if not exists bible_reviewed_at timestamptz;

update public.developer_fiction_series
set bible_reviewed_at = coalesce(bible_reviewed_at, updated_at, created_at, now())
where series_bible is not null
  and series_bible <> '{}'::jsonb
  and bible_reviewed_at is null;

comment on column public.developer_fiction_series.bible_reviewed_at is
  'Timestamp of required human cast/book-title review for the current Fiction Studio Series Bible.';
