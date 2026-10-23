import { supabase, supabaseConfigured } from '../lib/supabase';
import { PlayerRank } from '../types/gaming';

const AVATAR_PALETTE = [
  '#00F0FF', // Cyan
  '#A855F7', // Purple
  '#F59E0B', // Amber
  '#22C55E', // Emerald
  '#EC4899', // Pink
  '#38BDF8', // Sky Blue
  '#F97316', // Orange
  '#EAB308', // Yellow
];

/**
 * Deterministically assigns a vibrant cyber avatar color based on user identifier.
 */
export const getPlayerAvatarColor = (identifier: string, dbColor?: string | null): string => {
  if (dbColor && /^#[0-9A-F]{6}$/i.test(dbColor)) {
    return dbColor;
  }
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
};

/**
 * Maps raw database profile or RPC records to the strongly-typed PlayerRank structure.
 * Sorts using documented ranking logic:
 * 1. Highest wins (descending)
 * 2. Highest XP (descending)
 * 3. Earliest join date (ascending - founding players first)
 */
export function mapDatabaseToPlayerRanks(records: any[]): PlayerRank[] {
  if (!records || records.length === 0) return [];

  const sorted = [...records].sort((a, b) => {
    // 1. Wins (primary)
    const winsA = typeof a.wins === 'number' && !isNaN(a.wins) ? a.wins : -1;
    const winsB = typeof b.wins === 'number' && !isNaN(b.wins) ? b.wins : -1;
    if (winsB !== winsA) return winsB - winsA;

    // 2. XP (secondary)
    const xpA =
      typeof a.xp === 'number'
        ? a.xp
        : parseInt(String(a.xp || '0').replace(/[^0-9]/g, ''), 10) || -1;
    const xpB =
      typeof b.xp === 'number'
        ? b.xp
        : parseInt(String(b.xp || '0').replace(/[^0-9]/g, ''), 10) || -1;
    if (xpB !== xpA) return xpB - xpA;

    // 3. Join date (tertiary - earliest registered first)
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateA - dateB;
  });

  return sorted.map((p, index) => {
    const rawGamerTag = (p.gamer_tag || '').trim();
    const handle = rawGamerTag || `Gamer #${String(p.id || '').slice(0, 4)}`;
    const avatarColor = p.avatar_color || getPlayerAvatarColor(p.id || handle);

    const hasStats = Boolean(
      (p.wins !== null && p.wins !== undefined && Number(p.wins) >= 0) ||
      (p.xp !== null && p.xp !== undefined && Number(p.xp) > 0) ||
      (p.level !== null && p.level !== undefined && Number(p.level) > 0)
    );

    const joinDate = p.created_at
      ? new Date(p.created_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null;

    let defaultBadge = 'Registered Gamer';
    if (p.role === 'admin') {
      defaultBadge = 'Arena Admin';
    } else if (hasStats && p.wins && p.wins > 100) {
      defaultBadge = 'Apex Gladiator';
    } else if (hasStats && p.wins && p.wins > 20) {
      defaultBadge = 'Gladiator';
    } else if (!hasStats) {
      defaultBadge = 'New Recruit';
    }

    return {
      rank: index + 1,
      handle,
      realName: joinDate ? `Member since ${joinDate}` : 'Registered Gamer',
      avatarColor,
      level: hasStats && p.level !== null && p.level !== undefined ? Number(p.level) : null,
      wins: hasStats && p.wins !== null && p.wins !== undefined ? Number(p.wins) : null,
      xp:
        hasStats && p.xp !== null && p.xp !== undefined
          ? typeof p.xp === 'number'
            ? p.xp.toLocaleString()
            : String(p.xp)
          : null,
      winRate: hasStats && p.win_rate ? String(p.win_rate) : null,
      primaryGame: p.primary_game || 'Play Arena',
      badge: p.badge || defaultBadge,
      userId: p.id,
      hasStats,
      createdAt: p.created_at,
      role: p.role || 'user',
    };
  });
}

/**
 * Result structure returned by fetchRealLeaderboardPlayers.
 */
export interface LeaderboardFetchResult {
  players: PlayerRank[];
  migrationNeeded: boolean;
  error: string | null;
}

/**
 * Fetches real registered users from Supabase.
 * Excludes private emails and never fabricates mock players.
 */
export async function fetchRealLeaderboardPlayers(): Promise<LeaderboardFetchResult> {
  if (!supabaseConfigured || !supabase) {
    return {
      players: [],
      migrationNeeded: false,
      error: 'Database connection is not configured in .env.local.',
    };
  }

  try {
    // 1. Primary path: Call secure RPC function get_leaderboard_players()
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_leaderboard_players');

    if (!rpcError && Array.isArray(rpcData)) {
      return {
        players: mapDatabaseToPlayerRanks(rpcData),
        migrationNeeded: false,
        error: null,
      };
    }

    // Check if the RPC does not exist in schema cache
    const isMissingRpc = Boolean(
      rpcError?.code === 'PGRST202' ||
      rpcError?.message?.includes('not found') ||
      rpcError?.message?.includes('schema cache')
    );

    // 2. Secondary path: Attempt fallback direct select on profiles
    // (This succeeds if the user is authenticated as admin or if select policies allow reading profiles)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, gamer_tag, role, created_at, wins, xp, level, win_rate, primary_game, badge, avatar_color')
      .order('created_at', { ascending: true });

    if (!profileError && Array.isArray(profileData) && profileData.length > 0) {
      return {
        players: mapDatabaseToPlayerRanks(profileData),
        migrationNeeded: isMissingRpc,
        error: null,
      };
    }

    // 3. If direct select failed because columns don't exist yet, try basic columns
    if (profileError && profileError.message?.includes('does not exist')) {
      const { data: basicProfiles, error: basicErr } = await supabase
        .from('profiles')
        .select('id, gamer_tag, role, created_at')
        .order('created_at', { ascending: true });

      if (!basicErr && Array.isArray(basicProfiles) && basicProfiles.length > 0) {
        return {
          players: mapDatabaseToPlayerRanks(basicProfiles),
          migrationNeeded: true,
          error: null,
        };
      }
    }

    if (isMissingRpc) {
      return {
        players: [],
        migrationNeeded: true,
        error: 'Leaderboard database function get_leaderboard_players() is not installed yet.',
      };
    }

    return {
      players: [],
      migrationNeeded: false,
      error: rpcError ? rpcError.message : 'No registered users found.',
    };
  } catch (err) {
    return {
      players: [],
      migrationNeeded: false,
      error: err instanceof Error ? err.message : 'Failed to fetch leaderboard data.',
    };
  }
}
