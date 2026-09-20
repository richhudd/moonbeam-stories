-- Moonbeam Stories V60 — per-purchase digital-supply consent at first paid story use.
-- Run ONCE in Supabase > SQL Editor BEFORE deploying V60.
-- Existing balances are preserved as legacy credit batches and are not forced through
-- a new consent flow retroactively. New trial and purchase credits are batch-tracked.

create table if not exists public.story_credit_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('legacy','trial','purchase')),
  purchase_id bigint unique references public.story_credit_purchases(id) on delete cascade,
  total_credits integer not null check (total_credits >= 0),
  remaining_credits integer not null check (remaining_credits >= 0),
  revoked_credits integer not null default 0 check (revoked_credits >= 0),
  consent_required boolean not null default false,
  consented_at timestamptz,
  consent_version text,
  consent_text text,
  created_at timestamptz not null default now()
);

create index if not exists story_credit_batches_user_order_idx
on public.story_credit_batches(user_id, created_at, id)
where remaining_credits > 0;

alter table public.story_credit_batches enable row level security;
grant select, insert, update on table public.story_credit_batches to service_role;

-- Preserve every existing user's current balance without reclassifying old credits.
insert into public.story_credit_batches(user_id, source, total_credits, remaining_credits, consent_required, created_at)
select sc.user_id, 'legacy', sc.balance, sc.balance, false, now()
from public.story_credits sc
where sc.balance > 0
  and not exists (
    select 1 from public.story_credit_batches b where b.user_id = sc.user_id
  );

-- Future introductory trials create a non-paid batch.
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
    insert into public.story_credits(user_id,balance,lifetime_granted,lifetime_spent,lifetime_purchased,lifetime_refunded)
    values(p_user_id,0,0,0,0,0) on conflict(user_id) do nothing;
    select balance, lifetime_granted into v_balance, v_granted
    from public.story_credits where user_id = p_user_id for update;
  end if;

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
  set balance = balance + 3,
      lifetime_granted = lifetime_granted + 3,
      updated_at = now()
  where user_id = p_user_id
  returning balance into v_balance;

  insert into public.story_credit_batches(user_id,source,total_credits,remaining_credits,consent_required)
  values(p_user_id,'trial',3,3,false);

  return jsonb_build_object('granted',true,'reason','intro_trial','balance',v_balance);
end;
$$;

revoke all on function public.claim_intro_trial(uuid,text,text) from public, anon, authenticated;
grant execute on function public.claim_intro_trial(uuid,text,text) to service_role;

-- Paid Stripe fulfilment now creates one consent-tracked batch per Checkout Session.
create or replace function public.fulfill_story_credit_purchase(
  p_user_id uuid,
  p_session_id text,
  p_payment_intent_id text,
  p_credits integer,
  p_amount_total integer,
  p_currency text,
  p_event_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase_id bigint;
  v_balance integer;
  v_currency text := lower(coalesce(p_currency,''));
begin
  if p_session_id is null or length(trim(p_session_id)) < 8 then
    raise exception 'Invalid checkout session';
  end if;
  if v_currency <> 'gbp' then raise exception 'Unexpected payment currency'; end if;
  if not ((p_credits=10 and p_amount_total=999) or (p_credits=25 and p_amount_total=1999) or (p_credits=50 and p_amount_total=3499)) then
    raise exception 'Unexpected credit pack or amount';
  end if;

  insert into public.story_credit_purchases(
    user_id,stripe_checkout_session_id,stripe_payment_intent_id,stripe_event_id,credits,amount_total,currency
  ) values (
    p_user_id,trim(p_session_id),nullif(trim(coalesce(p_payment_intent_id,'')),''),
    nullif(trim(coalesce(p_event_id,'')),''),p_credits,p_amount_total,v_currency
  )
  on conflict (stripe_checkout_session_id) do nothing
  returning id into v_purchase_id;

  if v_purchase_id is null then
    select balance into v_balance from public.story_credits where user_id=p_user_id;
    return jsonb_build_object('granted',false,'reason','already_fulfilled','balance',coalesce(v_balance,0));
  end if;

  insert into public.story_credits(user_id,balance,lifetime_granted,lifetime_spent,lifetime_purchased,lifetime_refunded)
  values(p_user_id,0,0,0,0,0) on conflict(user_id) do nothing;

  update public.story_credits
  set balance=balance+p_credits,
      lifetime_granted=lifetime_granted+p_credits,
      lifetime_purchased=lifetime_purchased+p_credits,
      updated_at=now()
  where user_id=p_user_id
  returning balance into v_balance;

  insert into public.story_credit_batches(
    user_id,source,purchase_id,total_credits,remaining_credits,consent_required
  ) values (
    p_user_id,'purchase',v_purchase_id,p_credits,p_credits,true
  );

  return jsonb_build_object('granted',true,'reason','purchase','balance',v_balance,'credits',p_credits,'purchase_id',v_purchase_id);
end;
$$;

revoke all on function public.fulfill_story_credit_purchase(uuid,text,text,integer,integer,text,text) from public, anon, authenticated;
grant execute on function public.fulfill_story_credit_purchase(uuid,text,text,integer,integer,text,text) to service_role;

-- Returns the next credit batch that will be used. Paid batches require consent once.
create or replace function public.get_story_credit_context(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_batch public.story_credit_batches%rowtype;
  v_balance integer;
begin
  select balance into v_balance from public.story_credits where user_id=p_user_id;
  v_balance := coalesce(v_balance,0);

  -- If there is any newly purchased pack that has not yet been acknowledged,
  -- surface it on the next Create Story action. This keeps the user experience
  -- predictable even when older/free credits are still sitting in the account.
  select * into v_batch
  from public.story_credit_batches
  where user_id=p_user_id
    and source='purchase'
    and remaining_credits>0
    and consent_required
    and consented_at is null
  order by created_at,id
  limit 1;

  if found then
    return jsonb_build_object(
      'has_credit',true,
      'balance',v_balance,
      'batch_id',v_batch.id,
      'source',v_batch.source,
      'consent_required',true,
      'consented_at',v_batch.consented_at,
      'purchase_id',v_batch.purchase_id,
      'remaining_in_batch',v_batch.remaining_credits
    );
  end if;

  select * into v_batch
  from public.story_credit_batches
  where user_id=p_user_id and remaining_credits>0
  order by created_at,id
  limit 1;

  -- Repair path for a pre-V60/mismatched balance without changing the visible balance.
  if not found and v_balance>0 then
    insert into public.story_credit_batches(user_id,source,total_credits,remaining_credits,consent_required)
    values(p_user_id,'legacy',v_balance,v_balance,false)
    returning * into v_batch;
  end if;

  if v_balance<=0 or v_batch.id is null then
    return jsonb_build_object('has_credit',false,'balance',v_balance,'consent_required',false);
  end if;

  return jsonb_build_object(
    'has_credit',true,
    'balance',v_balance,
    'batch_id',v_batch.id,
    'source',v_batch.source,
    'consent_required',false,
    'consented_at',v_batch.consented_at,
    'purchase_id',v_batch.purchase_id,
    'remaining_in_batch',v_batch.remaining_credits
  );
end;
$$;

revoke all on function public.get_story_credit_context(uuid) from public, anon, authenticated;
grant execute on function public.get_story_credit_context(uuid) to service_role;

create or replace function public.accept_story_credit_consent(
  p_user_id uuid,
  p_batch_id uuid,
  p_version text,
  p_text text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_batch public.story_credit_batches%rowtype;
  v_purchase public.story_credit_purchases%rowtype;
  v_new boolean := false;
begin
  select * into v_batch from public.story_credit_batches
  where id=p_batch_id and user_id=p_user_id for update;
  if not found then raise exception 'Credit batch not found'; end if;
  if v_batch.source <> 'purchase' or not v_batch.consent_required then
    return jsonb_build_object('accepted',true,'accepted_new',false,'batch_id',v_batch.id);
  end if;

  if v_batch.consented_at is null then
    update public.story_credit_batches
    set consented_at=now(), consent_version=left(coalesce(p_version,''),80), consent_text=left(coalesce(p_text,''),1000)
    where id=v_batch.id;
    v_new := true;
  end if;

  if v_batch.purchase_id is not null then
    select * into v_purchase from public.story_credit_purchases where id=v_batch.purchase_id;
  end if;

  return jsonb_build_object(
    'accepted',true,
    'accepted_new',v_new,
    'batch_id',v_batch.id,
    'purchase_id',v_batch.purchase_id,
    'credits',coalesce(v_purchase.credits,v_batch.total_credits),
    'checkout_session_id',v_purchase.stripe_checkout_session_id
  );
end;
$$;

revoke all on function public.accept_story_credit_consent(uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.accept_story_credit_consent(uuid,uuid,text,text) to service_role;

-- Reserve exactly one batch-tracked credit. A paid batch cannot be consumed before consent.
create or replace function public.reserve_story_credit_v60(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_batch public.story_credit_batches%rowtype;
begin
  select balance into v_balance from public.story_credits where user_id=p_user_id for update;
  if v_balance is null then
    insert into public.story_credits(user_id,balance,lifetime_granted,lifetime_spent,lifetime_purchased,lifetime_refunded)
    values(p_user_id,0,0,0,0,0) on conflict(user_id) do nothing;
    select balance into v_balance from public.story_credits where user_id=p_user_id for update;
  end if;
  if coalesce(v_balance,0)<=0 then
    return jsonb_build_object('ok',false,'code','NO_CREDITS','balance',0);
  end if;

  select * into v_batch from public.story_credit_batches
  where user_id=p_user_id and remaining_credits>0
  order by created_at,id
  limit 1 for update;

  if not found then
    insert into public.story_credit_batches(user_id,source,total_credits,remaining_credits,consent_required)
    values(p_user_id,'legacy',v_balance,v_balance,false)
    returning * into v_batch;
  end if;

  if v_batch.consent_required and v_batch.consented_at is null then
    return jsonb_build_object('ok',false,'code','CONSENT_REQUIRED','balance',v_balance,'batch_id',v_batch.id);
  end if;

  update public.story_credit_batches
  set remaining_credits=remaining_credits-1
  where id=v_batch.id;

  update public.story_credits
  set balance=balance-1,
      lifetime_spent=lifetime_spent+1,
      updated_at=now()
  where user_id=p_user_id
  returning balance into v_balance;

  return jsonb_build_object('ok',true,'balance',v_balance,'batch_id',v_batch.id,'source',v_batch.source);
end;
$$;

revoke all on function public.reserve_story_credit_v60(uuid) from public, anon, authenticated;
grant execute on function public.reserve_story_credit_v60(uuid) to service_role;

create or replace function public.refund_story_credit_v60(p_user_id uuid,p_batch_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_max integer;
begin
  select greatest(total_credits-revoked_credits,0) into v_max
  from public.story_credit_batches where id=p_batch_id and user_id=p_user_id for update;
  if v_max is null then return coalesce((select balance from public.story_credits where user_id=p_user_id),0); end if;

  update public.story_credit_batches
  set remaining_credits=remaining_credits+1
  where id=p_batch_id and user_id=p_user_id and remaining_credits<v_max;

  if found then
    update public.story_credits
    set balance=balance+1,
        lifetime_spent=greatest(0,lifetime_spent-1),
        updated_at=now()
    where user_id=p_user_id
    returning balance into v_balance;
  else
    select balance into v_balance from public.story_credits where user_id=p_user_id;
  end if;
  return coalesce(v_balance,0);
end;
$$;

revoke all on function public.refund_story_credit_v60(uuid,uuid) from public, anon, authenticated;
grant execute on function public.refund_story_credit_v60(uuid,uuid) to service_role;

-- V60 refund reconciliation removes credits from the exact purchased batch where possible.
create or replace function public.apply_story_credit_refund(
  p_payment_intent_id text,
  p_amount_refunded integer,
  p_currency text,
  p_event_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase public.story_credit_purchases%rowtype;
  v_batch public.story_credit_batches%rowtype;
  v_target_credits integer;
  v_delta_target integer;
  v_balance integer;
  v_removed integer := 0;
  v_to_remove integer := 0;
  v_take integer := 0;
  v_pool_batch public.story_credit_batches%rowtype;
  v_currency text := lower(coalesce(p_currency,''));
begin
  if p_payment_intent_id is null or length(trim(p_payment_intent_id))<8 then raise exception 'Invalid payment intent'; end if;
  select * into v_purchase from public.story_credit_purchases
  where stripe_payment_intent_id=trim(p_payment_intent_id) for update;
  if not found then return jsonb_build_object('applied',false,'reason','purchase_not_found'); end if;
  if v_currency<>lower(v_purchase.currency) then raise exception 'Refund currency did not match purchase currency'; end if;
  if p_amount_refunded is null or p_amount_refunded<0 or p_amount_refunded>v_purchase.amount_total then raise exception 'Invalid refunded amount'; end if;

  if p_amount_refunded>=v_purchase.amount_total then v_target_credits:=v_purchase.credits;
  else v_target_credits:=floor((v_purchase.credits::numeric*p_amount_refunded::numeric)/v_purchase.amount_total::numeric)::integer;
  end if;

  if p_amount_refunded<v_purchase.refunded_amount or v_target_credits<v_purchase.credits_revoked then
    select balance into v_balance from public.story_credits where user_id=v_purchase.user_id;
    return jsonb_build_object('applied',false,'reason','stale_refund_event','balance',coalesce(v_balance,0));
  end if;

  v_delta_target:=v_target_credits-v_purchase.credits_revoked;
  insert into public.story_credits(user_id,balance,lifetime_granted,lifetime_spent,lifetime_purchased,lifetime_refunded)
  values(v_purchase.user_id,0,0,0,0,0) on conflict(user_id) do nothing;

  if v_delta_target>0 then
    select * into v_batch from public.story_credit_batches where purchase_id=v_purchase.id for update;
    if found then
      v_removed:=least(v_batch.remaining_credits,v_delta_target);
      update public.story_credit_batches
      set remaining_credits=greatest(remaining_credits-v_removed,0),
          revoked_credits=least(total_credits,revoked_credits+v_delta_target)
      where id=v_batch.id;

      update public.story_credits
      set balance=greatest(balance-v_removed,0),
          lifetime_refunded=lifetime_refunded+v_delta_target,
          updated_at=now()
      where user_id=v_purchase.user_id
      returning balance into v_balance;
    else
      -- Pre-V60 purchase: retain the V57 pooled-balance fallback.
      select balance into v_balance from public.story_credits where user_id=v_purchase.user_id for update;
      v_removed:=least(coalesce(v_balance,0),v_delta_target);
      update public.story_credits
      set balance=greatest(balance-v_removed,0),
          lifetime_refunded=lifetime_refunded+v_delta_target,
          updated_at=now()
      where user_id=v_purchase.user_id
      returning balance into v_balance;

      -- Keep V60 batch totals aligned with the pooled balance for a pre-V60
      -- purchase refund. Prefer legacy credits, which represent pre-V60 balance.
      v_to_remove := v_removed;
      for v_pool_batch in
        select * from public.story_credit_batches
        where user_id=v_purchase.user_id and remaining_credits>0
        order by case when source='legacy' then 0 else 1 end, created_at, id
        for update
      loop
        exit when v_to_remove<=0;
        v_take := least(v_pool_batch.remaining_credits,v_to_remove);
        update public.story_credit_batches
        set remaining_credits=remaining_credits-v_take
        where id=v_pool_batch.id;
        v_to_remove := v_to_remove-v_take;
      end loop;
    end if;
  else
    select balance into v_balance from public.story_credits where user_id=v_purchase.user_id;
  end if;

  update public.story_credit_purchases
  set refunded_amount=greatest(refunded_amount,p_amount_refunded),
      credits_revoked=greatest(credits_revoked,v_target_credits),
      credits_removed=credits_removed+v_removed,
      last_refund_event_id=coalesce(nullif(trim(coalesce(p_event_id,'')),''),last_refund_event_id),
      refunded_at=case when p_amount_refunded>0 then now() else refunded_at end
  where id=v_purchase.id;

  return jsonb_build_object(
    'applied',true,
    'reason',case when p_amount_refunded>=v_purchase.amount_total then 'full_refund' else 'partial_refund' end,
    'balance',coalesce(v_balance,0),
    'refunded_amount',p_amount_refunded,
    'credits_targeted',v_target_credits,
    'credits_removed_now',v_removed,
    'credits_removed_total',v_purchase.credits_removed+v_removed,
    'credits_unrecoverable',greatest(v_target_credits-(v_purchase.credits_removed+v_removed),0)
  );
end;
$$;

revoke all on function public.apply_story_credit_refund(text,integer,text,text) from public, anon, authenticated;
grant execute on function public.apply_story_credit_refund(text,integer,text,text) to service_role;
