-- V252.51 Fiction Studio: repeatable revision passes and one-off editorial direction.
alter table public.developer_fiction_editorial_runs
  add column if not exists source_run_id uuid references public.developer_fiction_editorial_runs(id) on delete set null;

alter table public.developer_fiction_editorial_runs
  add column if not exists direction text not null default '';

create index if not exists developer_fiction_editorial_runs_source_run_idx
  on public.developer_fiction_editorial_runs(source_run_id);
