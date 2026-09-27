-- Moonbeam Stories V251.93.1 — Series Library permissions hotfix.
-- Safe to run more than once. The browser remains blocked; only the trusted
-- server-side service role receives access to the developer-only Series tables.
grant select, insert, update, delete on table public.developer_story_series to service_role;
grant select, insert, update, delete on table public.developer_story_volumes to service_role;
grant select, insert, update, delete on table public.developer_story_volume_items to service_role;
