-- Moonbeam Stories V50 — three free story credits per account.
-- Run this ONCE in Supabase > SQL Editor before deploying V50.

create table if not exists public.story_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 3 check (balance >= 0),
  lifetime_granted integer not null default 3 check (lifetime_granted >= 0),
  lifetime_spent integer not null default 0 check (lifetime_spent >= 0),
  updated_at timestamptz not null default now()
);

alter table public.story_credits enable row level security;

drop policy if exists "Users can read own story credits" on public.story_credits;
create policy "Users can read own story credits"
on public.story_credits for select
to authenticated
using (auth.uid() = user_id);

grant select on table public.story_credits to authenticated;
grant select, insert, update on table public.story_credits to service_role;

-- Give every future account 3 free stories automatically.
create or replace function public.give_new_user_story_credits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.story_credits (user_id, balance, lifetime_granted, lifetime_spent)
  values (new.id, 3, 3, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_story_credits on auth.users;
create trigger on_auth_user_created_story_credits
after insert on auth.users
for each row execute function public.give_new_user_story_credits();

-- Existing Moonbeam accounts also start with 3 credits for this test phase.
insert into public.story_credits (user_id, balance, lifetime_granted, lifetime_spent)
select id, 3, 3, 0 from auth.users
on conflict (user_id) do nothing;

-- Atomically reserve one credit BEFORE the paid OpenAI call.
-- Returns the new balance, or -1 when no credits remain.
create or replace function public.consume_story_credit(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  select balance into v_balance
  from public.story_credits
  where user_id = p_user_id
  for update;

  if v_balance is null then
    insert into public.story_credits (user_id, balance, lifetime_granted, lifetime_spent)
    values (p_user_id, 3, 3, 0)
    on conflict (user_id) do nothing;
    select balance into v_balance from public.story_credits where user_id = p_user_id for update;
  end if;

  if v_balance <= 0 then
    return -1;
  end if;

  update public.story_credits
  set balance = balance - 1,
      lifetime_spent = lifetime_spent + 1,
      updated_at = now()
  where user_id = p_user_id
  returning balance into v_balance;

  return v_balance;
end;
$$;

-- If story text generation fails, put the reserved credit back.
create or replace function public.refund_story_credit(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  update public.story_credits
  set balance = balance + 1,
      lifetime_spent = greatest(0, lifetime_spent - 1),
      updated_at = now()
  where user_id = p_user_id
  returning balance into v_balance;
  return coalesce(v_balance, 0);
end;
$$;

revoke all on function public.consume_story_credit(uuid) from public, anon, authenticated;
revoke all on function public.refund_story_credit(uuid) from public, anon, authenticated;
grant execute on function public.consume_story_credit(uuid) to service_role;
grant execute on function public.refund_story_credit(uuid) to service_role;

-- Each paid/free story credit creates one bounded generation run. This prevents
-- direct calls to the image/audio endpoints from creating an unlimited OpenAI bill.
create table if not exists public.story_generation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_slots_remaining integer not null default 9 check (image_slots_remaining >= 0),
  narration_slots_remaining integer not null default 6 check (narration_slots_remaining >= 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days')
);

alter table public.story_generation_runs enable row level security;
grant select, insert, update on table public.story_generation_runs to service_role;

create or replace function public.create_story_generation_run(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  insert into public.story_generation_runs(user_id)
  values (p_user_id)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.consume_generation_slot(p_user_id uuid, p_run_id uuid, p_kind text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_ok boolean := false;
begin
  if p_kind = 'image' then
    update public.story_generation_runs
    set image_slots_remaining = image_slots_remaining - 1
    where id = p_run_id and user_id = p_user_id and expires_at > now() and image_slots_remaining > 0
    returning true into v_ok;
  elsif p_kind = 'narration' then
    update public.story_generation_runs
    set narration_slots_remaining = narration_slots_remaining - 1
    where id = p_run_id and user_id = p_user_id and expires_at > now() and narration_slots_remaining > 0
    returning true into v_ok;
  end if;
  return coalesce(v_ok, false);
end;
$$;

create or replace function public.refund_generation_slot(p_user_id uuid, p_run_id uuid, p_kind text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind = 'image' then
    update public.story_generation_runs
    set image_slots_remaining = least(9, image_slots_remaining + 1)
    where id = p_run_id and user_id = p_user_id;
  elsif p_kind = 'narration' then
    update public.story_generation_runs
    set narration_slots_remaining = least(6, narration_slots_remaining + 1)
    where id = p_run_id and user_id = p_user_id;
  else
    return false;
  end if;
  return found;
end;
$$;

revoke all on function public.create_story_generation_run(uuid) from public, anon, authenticated;
revoke all on function public.consume_generation_slot(uuid,uuid,text) from public, anon, authenticated;
revoke all on function public.refund_generation_slot(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.create_story_generation_run(uuid) to service_role;
grant execute on function public.consume_generation_slot(uuid,uuid,text) to service_role;
grant execute on function public.refund_generation_slot(uuid,uuid,text) to service_role;

-- Keep the secure run id with cloud-saved books so reopening them does not
-- require minting another story credit just to use remaining generated assets.
alter table public.saved_stories
add column if not exists generation_run_id uuid null references public.story_generation_runs(id) on delete set null;
