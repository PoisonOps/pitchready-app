-- PitchReady — Run this in your Supabase SQL editor
-- Dashboard → SQL Editor → New query → paste & run

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  weekly_target int not null default 5,
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Own profile" on public.profiles using (auth.uid() = id) with check (auth.uid() = id);

-- ─── TRAINING SESSIONS ───────────────────────────────────────────────────────
create table if not exists public.training_sessions (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  duration_min int not null,
  focus text[] not null default '{}',
  notes text,
  rating int check (rating between 0 and 5) default 0,
  created_at timestamptz default now()
);
alter table public.training_sessions enable row level security;
create policy "Own training" on public.training_sessions using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── MATCHES ─────────────────────────────────────────────────────────────────
create table if not exists public.matches (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  opponent text not null default 'Match',
  role text not null default 'Batsman',
  runs int default 0,
  balls int default 0,
  how_out text default 'Not out',
  overs float default 0,
  wickets int default 0,
  runs_conceded int default 0,
  catches int default 0,
  result text not null default 'Won',
  notes text,
  created_at timestamptz default now()
);
alter table public.matches enable row level security;
create policy "Own matches" on public.matches using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── FITNESS CHECKINS ────────────────────────────────────────────────────────
create table if not exists public.fitness_checkins (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  checked_items int[] not null default '{}',
  updated_at timestamptz default now(),
  unique(user_id, date)
);
alter table public.fitness_checkins enable row level security;
create policy "Own fitness" on public.fitness_checkins using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── WEIGHT LOGS ─────────────────────────────────────────────────────────────
create table if not exists public.weight_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  weight_kg float not null,
  created_at timestamptz default now()
);
alter table public.weight_logs enable row level security;
create policy "Own weight" on public.weight_logs using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── TECHNIQUE NOTES ─────────────────────────────────────────────────────────
create table if not exists public.technique_notes (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  area text not null,
  note text not null,
  video_url text,
  date date not null default current_date,
  created_at timestamptz default now()
);
alter table public.technique_notes enable row level security;
create policy "Own technique" on public.technique_notes using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── MENTAL CHECKINS ─────────────────────────────────────────────────────────
create table if not exists public.mental_checkins (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  confidence int check (confidence between 1 and 10) not null default 7,
  mood text,
  goal text,
  notes text,
  created_at timestamptz default now()
);
alter table public.mental_checkins enable row level security;
create policy "Own mental" on public.mental_checkins using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
