create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  username text,
  created_at timestamptz not null default now()
);

alter table public.users add column if not exists username text;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  status text not null default 'inactive',
  reward_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  room_id text,
  score integer not null default 0,
  result text not null default 'unknown',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists game_sessions_user_id_idx on public.game_sessions(user_id);
create index if not exists game_sessions_game_id_idx on public.game_sessions(game_id);
create index if not exists game_sessions_created_at_idx on public.game_sessions(created_at desc);

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  score integer not null default 0,
  rank integer,
  season text not null default 'global',
  updated_at timestamptz not null default now(),
  unique (game_id, user_id, season)
);

create index if not exists leaderboard_game_season_score_idx on public.leaderboard(game_id, season, score desc);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  session_id uuid references public.game_sessions(id) on delete set null,
  amount numeric not null,
  token_symbol text not null default 'B21',
  status text not null default 'pending',
  tx_hash text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists rewards_user_id_idx on public.rewards(user_id);
create index if not exists rewards_status_idx on public.rewards(status);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  game_id uuid references public.games(id) on delete set null,
  type text not null, -- 'entry_fee', 'purchase', etc.
  amount numeric not null,
  currency text not null default 'B21',
  tx_hash text not null,
  status text not null default 'confirmed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_type_idx on public.transactions(type);
