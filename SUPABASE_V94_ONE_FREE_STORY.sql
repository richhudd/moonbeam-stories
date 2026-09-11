-- Moonbeam Stories V94 — reduce the introductory offer from 3 free stories to 1.
-- Run ONCE in Supabase > SQL Editor BEFORE deploying V94.
-- Existing users and existing balances are NOT reduced or reset.

create or replace function public.claim_intro_trial(p_user_id uuid, p_device_hash text, p_network_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_granted integer;
  v_network_claims integer;
begin
  select balance, lifetime_granted into v_balance, v_granted
  from public.story_credits where user_id = p_user_id for update;

  if v_balance is null then
    insert into public.story_credits(user_id,balance,lifetime_granted,lifetime_spent)
    values(p_user_id,0,0,0) on conflict(user_id) do nothing;
    select balance, lifetime_granted into v_balance, v_granted
    from public.story_credits where user_id = p_user_id for update;
  end if;

  -- Existing accounts that have ever received credits are left untouched.
  if coalesce(v_granted,0) > 0 then
    return jsonb_build_object('granted',false,'reason','already_granted','balance',v_balance);
  end if;

  if exists(select 1 from public.trial_claims where device_hash = p_device_hash) then
    return jsonb_build_object('granted',false,'reason','device_used','balance',v_balance);
  end if;

  if p_network_hash is not null and p_network_hash <> '' then
    perform pg_advisory_xact_lock(hashtext(p_network_hash));
    select count(*) into v_network_claims from public.trial_claims
    where network_hash = p_network_hash and claimed_at > now() - interval '30 days';
    if v_network_claims >= 1 then
      return jsonb_build_object('granted',false,'reason','network_limit','balance',v_balance);
    end if;
  end if;

  begin
    insert into public.trial_claims(user_id,device_hash,network_hash)
    values(p_user_id,p_device_hash,nullif(p_network_hash,''));
  exception when unique_violation then
    return jsonb_build_object('granted',false,'reason','device_used','balance',v_balance);
  end;

  update public.story_credits
  set balance = balance + 1,
      lifetime_granted = lifetime_granted + 1,
      updated_at = now()
  where user_id = p_user_id
  returning balance into v_balance;

  return jsonb_build_object('granted',true,'reason','intro_trial','balance',v_balance);
end;
$$;

revoke all on function public.claim_intro_trial(uuid,text,text) from public, anon, authenticated;
grant execute on function public.claim_intro_trial(uuid,text,text) to service_role;
