-- ====================================================================
-- PLAY ARENA — COMPLETE SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Run this script in your Supabase Dashboard > SQL Editor.
-- ====================================================================

-- 1. Enable required extensions
create extension if not exists pgcrypto;

-- 2. User Profiles Table (Linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  gamer_tag text,
  role text not null default 'user' check (role in ('user', 'admin')),
  wins integer default null,
  xp integer default null,
  level integer default null,
  win_rate text default null,
  primary_game text default null,
  badge text default null,
  avatar_color text default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Website Reports & Problem Feedback Table
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  email text,
  category text not null default 'Website problem',
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);

-- 4. Newsletter Subscribers Table
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

-- 5. Tournament Registrations Table
create table if not exists public.tournament_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  tournament_id text not null,
  tournament_title text not null,
  team_name text not null,
  captain_discord text not null,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'rejected')),
  created_at timestamptz not null default now()
);

-- 6. Game Catalogue Table (Admin managed, public read)
create table if not exists public.games (
  id text primary key,
  title text not null,
  genre text not null,
  rating numeric(3,1) not null default 4.8,
  player_count text not null default 'Global',
  platforms text[] not null default '{"PC"}',
  description text not null,
  banner_gradient text not null default 'from-cyan-500/20 via-blue-950/40 to-slate-950',
  accent_color text not null default '#00F0FF',
  release_date text default 'Live',
  developer text default 'Play Arena Studios',
  storage text default 'Varies by device',
  trailer_title text,
  image_url text not null,
  official_source text,
  svg_artwork text not null default 'fps',
  official_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed existing 6 AAA featured games into public.games
insert into public.games (
  id, title, genre, rating, player_count, platforms, description,
  banner_gradient, accent_color, release_date, developer, storage,
  trailer_title, image_url, official_source, svg_artwork, official_url, is_active
)
values
  (
    'free-fire', 'Garena Free Fire', 'Battle Royale', 4.8, 'Global',
    array['Android','iOS','PC emulator'],
    'Fast-paced battle royale from Garena. Launch the official page to play on a supported device or install the official game.',
    'from-orange-500/20 via-red-950/40 to-slate-950', '#F97316', 'Live', 'Garena', 'Varies by device',
    'Free Fire Official', '/games/freefire.jpg', 'Garena Free Fire', 'battleroyale', 'https://ff.garena.com/', true
  ),
  (
    'bgmi', 'BATTLEGROUNDS MOBILE INDIA', 'Battle Royale', 4.8, 'India',
    array['Android','iOS'],
    'KRAFTON’s mobile battle royale. Open the official BGMI website for current download options and supported platforms.',
    'from-emerald-500/20 via-green-950/40 to-slate-950', '#22C55E', 'Live', 'KRAFTON', 'Varies by device',
    'BGMI Official', '/games/bgmi.jpg', 'BGMI official website', 'battleroyale', 'https://www.battlegroundsmobileindia.com/', true
  ),
  (
    'valorant', 'VALORANT', 'Tactical FPS', 4.9, 'Global',
    array['PC'],
    'Riot Games’ 5v5 tactical shooter. Open the official page to install the Riot client and launch the game on your PC.',
    'from-red-500/20 via-rose-950/40 to-slate-950', '#FF4655', 'Live', 'Riot Games', 'Varies by PC',
    'VALORANT Official', '/games/valorant.jpg', 'VALORANT official website', 'fps', 'https://playvalorant.com/', true
  ),
  (
    'counter-strike-2', 'COUNTER-STRIKE 2', 'Tactical FPS', 4.8, 'Global',
    array['PC'],
    'Valve’s competitive tactical shooter. Visit the official Steam store page to install or launch it through Steam.',
    'from-amber-500/20 via-orange-950/40 to-slate-950', '#F59E0B', 'Live', 'Valve', 'Varies by PC',
    'Counter-Strike 2 Official', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/capsule_616x353.jpg', 'Counter-Strike 2 on Steam', 'fps', 'https://store.steampowered.com/app/730/CounterStrike_2/', true
  ),
  (
    'apex-legends', 'APEX LEGENDS', 'Battle Royale', 4.7, 'Global',
    array['PC','PlayStation','Xbox','Nintendo Switch'],
    'Hero-based battle royale from Respawn. Open the official EA page for supported platforms and installation.',
    'from-orange-500/20 via-red-950/40 to-slate-950', '#F97316', 'Live', 'Respawn Entertainment', 'Varies by platform',
    'Apex Legends Official', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172470/capsule_616x353.jpg', 'Apex Legends official', 'battleroyale', 'https://www.ea.com/games/apex-legends', true
  ),
  (
    'pubg-battlegrounds', 'PUBG: BATTLEGROUNDS', 'Battle Royale', 4.7, 'Global',
    array['PC','PlayStation','Xbox'],
    'KRAFTON’s battle royale for PC and consoles. Open the official page for install and platform details.',
    'from-yellow-500/20 via-amber-950/40 to-slate-950', '#EAB308', 'Live', 'KRAFTON', 'Varies by platform',
    'PUBG Official', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/578080/capsule_616x353.jpg', 'PUBG on Steam', 'battleroyale', 'https://pubg.com/', true
  )
on conflict (id) do nothing;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & HELPER FUNCTIONS
-- ====================================================================

-- Helper: Check if current authenticated user has the 'admin' role
create or replace function public.is_playarena_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_playarena_admin() from public;
grant execute on function public.is_playarena_admin() to authenticated, anon;

-- Helper: Fetch public leaderboard players securely without exposing user emails
create or replace function public.get_leaderboard_players()
returns table (
  id uuid,
  gamer_tag text,
  role text,
  created_at timestamptz,
  wins integer,
  xp integer,
  level integer,
  win_rate text,
  primary_game text,
  badge text,
  avatar_color text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    p.id,
    coalesce(nullif(trim(p.gamer_tag), ''), 'Gamer #' || substring(p.id::text from 1 for 4)) as gamer_tag,
    p.role,
    p.created_at,
    p.wins,
    p.xp,
    p.level,
    p.win_rate,
    p.primary_game,
    p.badge,
    p.avatar_color
  from public.profiles p
  order by
    coalesce(p.wins, 0) desc,
    coalesce(p.xp, 0) desc,
    p.created_at asc;
end;
$$;

revoke all on function public.get_leaderboard_players() from public;
grant execute on function public.get_leaderboard_players() to anon, authenticated;

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.tournament_registrations enable row level security;
alter table public.games enable row level security;

-- PROFILES POLICIES
drop policy if exists "Users can read own profile or admin reads all" on public.profiles;
create policy "Users can read own profile or admin reads all"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_playarena_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid() and role = 'user');

drop policy if exists "Users can update own metadata and admin can update all" on public.profiles;
create policy "Users can update own metadata and admin can update all"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_playarena_admin())
  with check (
    -- Normal user cannot change their role to admin
    (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()))
    or public.is_playarena_admin()
  );

drop policy if exists "Admins can delete profiles" on public.profiles;
create policy "Admins can delete profiles"
  on public.profiles for delete
  to authenticated
  using (public.is_playarena_admin());

-- REPORTS POLICIES
drop policy if exists "Anyone can submit feedback report" on public.reports;
create policy "Anyone can submit feedback report"
  on public.reports for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "Admins can read all reports" on public.reports;
create policy "Admins can read all reports"
  on public.reports for select
  to authenticated
  using (public.is_playarena_admin() or user_id = auth.uid());

drop policy if exists "Admins can update reports" on public.reports;
create policy "Admins can update reports"
  on public.reports for update
  to authenticated
  using (public.is_playarena_admin())
  with check (public.is_playarena_admin());

drop policy if exists "Admins can delete reports" on public.reports;
create policy "Admins can delete reports"
  on public.reports for delete
  to authenticated
  using (public.is_playarena_admin());

-- NEWSLETTER POLICIES
drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can view newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins can view newsletter subscribers"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_playarena_admin());

drop policy if exists "Admins can delete newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins can delete newsletter subscribers"
  on public.newsletter_subscribers for delete
  to authenticated
  using (public.is_playarena_admin());

-- TOURNAMENT REGISTRATIONS POLICIES
drop policy if exists "Anyone can register for tournaments" on public.tournament_registrations;
create policy "Anyone can register for tournaments"
  on public.tournament_registrations for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "Users can view own registrations and admin views all" on public.tournament_registrations;
create policy "Users can view own registrations and admin views all"
  on public.tournament_registrations for select
  to authenticated
  using (user_id = auth.uid() or public.is_playarena_admin());

drop policy if exists "Admins can update tournament registrations" on public.tournament_registrations;
create policy "Admins can update tournament registrations"
  on public.tournament_registrations for update
  to authenticated
  using (public.is_playarena_admin())
  with check (public.is_playarena_admin());

drop policy if exists "Admins can delete tournament registrations" on public.tournament_registrations;
create policy "Admins can delete tournament registrations"
  on public.tournament_registrations for delete
  to authenticated
  using (public.is_playarena_admin());

-- GAMES POLICIES
drop policy if exists "Anyone can read active games" on public.games;
create policy "Anyone can read active games"
  on public.games for select
  to anon, authenticated
  using (is_active = true or public.is_playarena_admin());

drop policy if exists "Admins can insert games" on public.games;
create policy "Admins can insert games"
  on public.games for insert
  to authenticated
  with check (public.is_playarena_admin());

drop policy if exists "Admins can update games" on public.games;
create policy "Admins can update games"
  on public.games for update
  to authenticated
  using (public.is_playarena_admin())
  with check (public.is_playarena_admin());

drop policy if exists "Admins can delete games" on public.games;
create policy "Admins can delete games"
  on public.games for delete
  to authenticated
  using (public.is_playarena_admin());

-- ====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ====================================================================
create or replace function public.handle_new_playarena_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, gamer_tag, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'gamer_tag', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_playarena_user_created on auth.users;
create trigger on_playarena_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_playarena_user();

-- ====================================================================
-- PROMOTING YOUR ADMIN ACCOUNT:
-- Run this query after signing up with your real email address:
-- (This UPSERT creates the profile row if it doesn't exist yet, or elevates it if it does)
--
-- INSERT INTO public.profiles (id, email, gamer_tag, role)
-- SELECT id, email, coalesce(raw_user_meta_data->>'gamer_tag', split_part(email, '@', 1)), 'admin'
-- FROM auth.users
-- WHERE lower(email) = lower('your-real-email@example.com')
-- ON CONFLICT (id) DO UPDATE
-- SET role = 'admin', updated_at = now();
-- ====================================================================

