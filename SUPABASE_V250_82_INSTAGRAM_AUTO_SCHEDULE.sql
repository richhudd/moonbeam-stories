-- Moonbeam Stories V250.82
-- Persistent developer-only Instagram auto-post schedule + cloud wake-up.

create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.instagram_auto_schedule (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade unique,
  enabled boolean not null default false,
  frequency_days integer not null default 0 check (frequency_days between 0 and 30),
  timezone text not null default 'Europe/London',
  local_time time without time zone not null default '20:00',
  next_run_at timestamptz,
  locked_at timestamptz,
  last_run_at timestamptz,
  last_status text,
  last_message text,
  last_media_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.instagram_auto_schedule enable row level security;
revoke all on table public.instagram_auto_schedule from anon, authenticated;

create or replace function public.claim_due_instagram_auto_schedule()
returns table (
  id uuid,
  owner_id uuid,
  enabled boolean,
  frequency_days integer,
  timezone text,
  local_time time without time zone,
  next_run_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.instagram_auto_schedule s
     set locked_at = now(),
         last_status = 'running',
         last_message = 'Automatic Reel job started.',
         updated_at = now()
   where s.id = (
     select q.id
       from public.instagram_auto_schedule q
      where q.enabled = true
        and q.next_run_at is not null
        and q.next_run_at <= now()
        and (q.locked_at is null or q.locked_at < now() - interval '2 hours')
      order by q.next_run_at asc
      for update skip locked
      limit 1
   )
  returning s.id, s.owner_id, s.enabled, s.frequency_days, s.timezone, s.local_time, s.next_run_at;
end;
$$;

revoke all on function public.claim_due_instagram_auto_schedule() from public, anon, authenticated;
grant execute on function public.claim_due_instagram_auto_schedule() to service_role;

create or replace function public.finish_instagram_auto_schedule(
  p_id uuid,
  p_success boolean,
  p_message text default null,
  p_media_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.instagram_auto_schedule%rowtype;
  v_next timestamptz;
begin
  select * into v from public.instagram_auto_schedule where id = p_id for update;
  if not found then return; end if;

  if v.frequency_days = 0 then
    v_next := null;
  else
    v_next := ((v.next_run_at at time zone v.timezone) + make_interval(days => v.frequency_days)) at time zone v.timezone;
    while v_next <= now() loop
      v_next := ((v_next at time zone v.timezone) + make_interval(days => v.frequency_days)) at time zone v.timezone;
    end loop;
  end if;

  update public.instagram_auto_schedule
     set enabled = case when v.frequency_days = 0 then false else enabled end,
         next_run_at = v_next,
         locked_at = null,
         last_run_at = now(),
         last_status = case when p_success then 'posted' else 'failed' end,
         last_message = left(coalesce(p_message,''), 1000),
         last_media_id = nullif(left(coalesce(p_media_id,''), 200),''),
         updated_at = now()
   where id = p_id;
end;
$$;

revoke all on function public.finish_instagram_auto_schedule(uuid,boolean,text,text) from public, anon, authenticated;
grant execute on function public.finish_instagram_auto_schedule(uuid,boolean,text,text) to service_role;

create or replace function public.ensure_instagram_auto_cron()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform cron.schedule(
    'moonbeam-instagram-auto-minute',
    '* * * * *',
    $job$
      select net.http_get(
        url := 'https://www.moonbeamstories.co.uk/api/resend-inbound',
        params := jsonb_build_object('action','instagram-auto-cron'),
        headers := jsonb_build_object('User-Agent','Moonbeam-Supabase-Cron/1.0'),
        timeout_milliseconds := 600000
      ) as request_id;
    $job$
  );
end;
$$;

revoke all on function public.ensure_instagram_auto_cron() from public, anon, authenticated;
grant execute on function public.ensure_instagram_auto_cron() to service_role;
