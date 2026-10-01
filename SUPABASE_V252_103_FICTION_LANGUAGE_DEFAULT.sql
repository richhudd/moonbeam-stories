-- V252.103 — align Fiction Studio database fallback with the UI/server default.
-- This changes only the DEFAULT for future rows created without an explicit locale.
-- Existing series keep their stored language_locale unchanged.
alter table public.developer_fiction_series
  alter column language_locale set default 'en-GB';
