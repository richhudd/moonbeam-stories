-- Moonbeam Stories V124
-- Allow Moonbeam's trusted server-side service role to perform the private
-- story-sharing lookups introduced in V120/V123.
--
-- This does NOT grant access to anon or authenticated browser clients and it
-- does NOT disable/bypass the existing RLS policies for normal users.

grant select on table public.saved_stories to service_role;
grant select on table public.child_profiles to service_role;
grant select, insert, update, delete on table public.story_shares to service_role;
