-- ====================================================================
-- PLAY ARENA: REAL LEADERBOARD & PLAYER PROFILES MIGRATION
-- Run this script in your Supabase Dashboard > SQL Editor.
--
-- PURPOSE:
-- 1. Adds optional player statistics columns (wins, xp, level, etc.) to public.profiles.
-- 2. Creates the secure public.get_leaderboard_players() function (SECURITY DEFINER)
--    so visitors can see real registered players and rankings on the leaderboard
--    WITHOUT exposing private emails or weakening table RLS policies.
-- ====================================================================

-- 1. Add optional statistics & timestamp columns to public.profiles (safe & non-destructive)
alter table public.profiles
  add column if not exists wins integer default null,
  add column if not exists xp integer default null,
  add column if not exists level integer default null,
  add column if not exists win_rate text default null,
  add column if not exists primary_game text default null,
  add column if not exists badge text default null,
  add column if not exists avatar_color text default null,
  add column if not exists updated_at timestamptz not null default now();

-- 2. Create the secure leaderboard function
-- Excludes private emails. Exposes only public competitive gamer info.
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

-- 3. Grant execute permissions to anon and authenticated roles
revoke all on function public.get_leaderboard_players() from public;
grant execute on function public.get_leaderboard_players() to anon, authenticated;

-- ====================================================================
-- QUICK TEST VERIFICATION:
-- Run this query after executing the migration above:
-- SELECT * FROM public.get_leaderboard_players();
-- ====================================================================
