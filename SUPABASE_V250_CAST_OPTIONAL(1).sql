alter table public.cast_members
  add column if not exists gender text;

alter table public.cast_members
  drop constraint if exists cast_members_gender_check;

alter table public.cast_members
  add constraint cast_members_gender_check
  check (gender is null or gender in ('male','female'));
