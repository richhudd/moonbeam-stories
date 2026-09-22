-- Moonbeam Stories V250.88
-- Retire the unattended automatic Instagram Reel scheduler/cloud runner.
-- The existing schedule table is retained as inert historical data.

do $$
declare
  j record;
begin
  if to_regclass('cron.job') is not null then
    for j in select jobid from cron.job where jobname = 'moonbeam-instagram-auto-minute' loop
      perform cron.unschedule(j.jobid);
    end loop;
  end if;
end
$$;

do $$
begin
  if to_regclass('public.instagram_auto_schedule') is not null then
    update public.instagram_auto_schedule
       set enabled = false,
           next_run_at = null,
           locked_at = null,
           last_status = 'retired',
           last_message = 'Automatic Instagram posting retired in Moonbeam V250.88.',
           updated_at = now();
  end if;
end
$$;

drop function if exists public.ensure_instagram_auto_cron();
drop function if exists public.claim_due_instagram_auto_schedule();
drop function if exists public.finish_instagram_auto_schedule(uuid, boolean, text, text);
