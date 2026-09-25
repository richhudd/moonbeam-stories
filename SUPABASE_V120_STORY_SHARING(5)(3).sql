-- Moonbeam Stories V120: private per-recipient story sharing.
create table if not exists public.story_shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  saved_story_id uuid not null references public.saved_stories(id) on delete cascade,
  token_hash text not null unique,
  sender_name text not null,
  recipient_name text not null,
  recipient_email text not null,
  created_at timestamptz not null default now(),
  opened_at timestamptz,
  cta_clicked_at timestamptz,
  converted_user_id uuid references auth.users(id) on delete set null,
  converted_at timestamptz,
  revoked_at timestamptz
);
create index if not exists story_shares_owner_story_idx on public.story_shares(owner_id,saved_story_id,created_at desc);
alter table public.story_shares enable row level security;
-- Browser clients do not access this table directly. V120 server endpoints use the service role
-- after authenticating the owner or validating the cryptographically random share token.
