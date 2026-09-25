-- Moonbeam Stories V250.84
-- Durable callback state for the unattended Instagram Reel sandbox runner.

alter table public.instagram_auto_schedule
  add column if not exists run_token_hash text,
  add column if not exists run_sandbox_name text;

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
         run_token_hash = null,
         run_sandbox_name = null,
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
        timeout_milliseconds := 120000
      ) as request_id;
    $job$
  );
end;
$$;

revoke all on function public.ensure_instagram_auto_cron() from public, anon, authenticated;
grant execute on function public.ensure_instagram_auto_cron() to service_role;
