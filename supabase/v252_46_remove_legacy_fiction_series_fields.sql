-- V252.46 — remove retired Fiction Studio Series Creation fields.
-- Genre/subgenre, heat level and target length are no longer Series Creation inputs.
-- Book Development remains free to choose book-level scope/length and relationship/intimacy progression.

alter table public.developer_fiction_series
  drop column if exists genre,
  drop column if exists heat_level,
  drop column if exists target_length;
