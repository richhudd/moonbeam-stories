-- V252.134 — namespaced storage for password-gated Fiction Studio X.
-- Existing series remain in the ordinary Fiction Studio.
alter table public.developer_fiction_series
  add column if not exists studio_section text not null default 'fiction';

update public.developer_fiction_series
set studio_section='fiction'
where studio_section is null or studio_section not in ('fiction','fiction_x');

alter table public.developer_fiction_series
  drop constraint if exists developer_fiction_series_studio_section_check;
alter table public.developer_fiction_series
  add constraint developer_fiction_series_studio_section_check
  check (studio_section in ('fiction','fiction_x'));

create index if not exists developer_fiction_series_parent_section_updated_idx
  on public.developer_fiction_series(parent_id,studio_section,updated_at desc);
