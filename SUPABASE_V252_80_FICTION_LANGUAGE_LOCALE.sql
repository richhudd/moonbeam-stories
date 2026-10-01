-- V252.80 — Fiction Studio per-series writing language/locale
-- Existing series retain legacy English (US) behaviour. New series explicitly save the chosen locale.
alter table public.developer_fiction_series
  add column if not exists language_locale text not null default 'en-US';

comment on column public.developer_fiction_series.language_locale is
  'Fiction Studio series writing language/locale. Controls generated fiction/editorial language; UI remains UK English.';
