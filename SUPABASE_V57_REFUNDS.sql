-- Moonbeam Stories V57: Stripe refund credit reversal
-- Includes the V56 refund-ledger migration; V56 was not deployed separately.

-- Moonbeam Stories V56 — Stripe refund reconciliation.
-- Run ONCE in Supabase > SQL Editor BEFORE deploying V56.
-- This does not reset balances, purchases, trial claims, or saved stories.

alter table public.story_credits
add column if not exists lifetime_refunded integer not null default 0 check (lifetime_refunded >= 0);

alter table public.story_credit_purchases
add column if not exists refunded_amount integer not null default 0 check (refunded_amount >= 0),
add column if not exists credits_revoked integer not null default 0 check (credits_revoked >= 0),
add column if not exists credits_removed integer not null default 0 check (credits_removed >= 0),
add column if not exists last_refund_event_id text,
add column if not exists refunded_at timestamptz;

create index if not exists story_credit_purchases_payment_intent_idx
on public.story_credit_purchases(stripe_payment_intent_id)
where stripe_payment_intent_id is not null;

-- Apply Stripe's cumulative refunded amount for a PaymentIntent.
-- Stripe's charge.refunded event reports amount_refunded cumulatively, so this
-- function is naturally idempotent even if Stripe retries or events arrive twice.
--
-- Partial refunds revoke credits proportionally using floor(). A full refund
-- always targets all credits in the pack. The visible balance never goes below 0.
-- If a customer has already spent some/all of the refunded credits, the ledger
-- records the intended revocation separately from the credits actually removed.
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
  v_target_credits integer;
  v_delta_target integer;
  v_balance integer;
  v_removed integer := 0;
  v_currency text := lower(coalesce(p_currency,''));
begin
  if p_payment_intent_id is null or length(trim(p_payment_intent_id)) < 8 then
    raise exception 'Invalid payment intent';
  end if;

  select * into v_purchase
  from public.story_credit_purchases
  where stripe_payment_intent_id = trim(p_payment_intent_id)
  for update;

  if not found then
    return jsonb_build_object('applied',false,'reason','purchase_not_found');
  end if;

  if v_currency <> lower(v_purchase.currency) then
    raise exception 'Refund currency did not match purchase currency';
  end if;

  if p_amount_refunded is null or p_amount_refunded < 0 or p_amount_refunded > v_purchase.amount_total then
    raise exception 'Invalid refunded amount';
  end if;

  if p_amount_refunded >= v_purchase.amount_total then
    v_target_credits := v_purchase.credits;
  else
    v_target_credits := floor((v_purchase.credits::numeric * p_amount_refunded::numeric) / v_purchase.amount_total::numeric)::integer;
  end if;

  -- Never move backwards if Stripe delivers an older cumulative event after a newer one.
  if p_amount_refunded < v_purchase.refunded_amount or v_target_credits < v_purchase.credits_revoked then
    select balance into v_balance from public.story_credits where user_id = v_purchase.user_id;
    return jsonb_build_object(
      'applied',false,
      'reason','stale_refund_event',
      'balance',coalesce(v_balance,0),
      'refunded_amount',v_purchase.refunded_amount,
      'credits_revoked',v_purchase.credits_revoked,
      'credits_removed',v_purchase.credits_removed
    );
  end if;

  v_delta_target := v_target_credits - v_purchase.credits_revoked;

  insert into public.story_credits(user_id,balance,lifetime_granted,lifetime_spent,lifetime_purchased,lifetime_refunded)
  values(v_purchase.user_id,0,0,0,0,0)
  on conflict(user_id) do nothing;

  if v_delta_target > 0 then
    select balance into v_balance
    from public.story_credits
    where user_id = v_purchase.user_id
    for update;

    v_removed := least(coalesce(v_balance,0), v_delta_target);

    update public.story_credits
    set balance = greatest(balance - v_removed, 0),
        lifetime_refunded = lifetime_refunded + v_delta_target,
        updated_at = now()
    where user_id = v_purchase.user_id
    returning balance into v_balance;
  else
    select balance into v_balance from public.story_credits where user_id = v_purchase.user_id;
  end if;

  update public.story_credit_purchases
  set refunded_amount = greatest(refunded_amount, p_amount_refunded),
      credits_revoked = greatest(credits_revoked, v_target_credits),
      credits_removed = credits_removed + v_removed,
      last_refund_event_id = coalesce(nullif(trim(coalesce(p_event_id,'')),''), last_refund_event_id),
      refunded_at = case when p_amount_refunded > 0 then now() else refunded_at end
  where id = v_purchase.id;

  return jsonb_build_object(
    'applied',true,
    'reason',case when p_amount_refunded >= v_purchase.amount_total then 'full_refund' else 'partial_refund' end,
    'balance',coalesce(v_balance,0),
    'refunded_amount',p_amount_refunded,
    'credits_targeted',v_target_credits,
    'credits_removed_now',v_removed,
    'credits_removed_total',v_purchase.credits_removed + v_removed,
    'credits_unrecoverable',greatest(v_target_credits - (v_purchase.credits_removed + v_removed),0)
  );
end;
$$;

revoke all on function public.apply_story_credit_refund(text,integer,text,text) from public, anon, authenticated;
grant execute on function public.apply_story_credit_refund(text,integer,text,text) to service_role;
