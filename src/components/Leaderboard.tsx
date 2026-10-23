import React, { useState, useEffect, useMemo } from 'react';
import { Crown, Trophy, RefreshCw, AlertCircle, Sparkles, ChevronRight, UserPlus } from 'lucide-react';
import { PlayerRank } from '../types/gaming';
import { soundFx } from '../utils/soundEffects';
import { SectionHeader } from './SectionHeader';
import { fetchRealLeaderboardPlayers } from '../utils/leaderboard';

interface LeaderboardProps {
  onSelectPlayer: (player: PlayerRank) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onSelectPlayer }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'season' | 'weekly'>('global');
  const [players, setPlayers] = useState<PlayerRank[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [migrationNeeded, setMigrationNeeded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPlayers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchRealLeaderboardPlayers();
      setPlayers(result.players);
      setMigrationNeeded(result.migrationNeeded);
      setErrorMessage(result.error);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to connect to arena leaderboard.');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlayers();
  }, []);

  // Filter or prioritize players according to active division tab
  const displayPlayers = useMemo(() => {
    if (activeTab === 'global') {
      return players;
    }
    if (activeTab === 'season') {
      // Prioritize gladiators with recorded match statistics
      const withStats = players.filter((p) => p.hasStats);
      return withStats.length > 0 ? withStats : players;
    }
    // weekly
    return players;
  }, [players, activeTab]);

  const top1 = displayPlayers[0] as PlayerRank | undefined;
  const top2 = displayPlayers[1] as PlayerRank | undefined;
  const top3 = displayPlayers[2] as PlayerRank | undefined;

  return (
    <section id="leaderboard" className="relative py-28 bg-[#050711] border-t border-white/5 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Cyber UI */}
        <SectionHeader
          sectionNumber="06"
          tagline="HALL OF CHAMPIONS // RANKED LADDER"
          title="TOP PLAYERS"
          subtitle="Real competitive gladiators dominating the global matchmaking arena. Verified by Supabase."
          accentColor="#F59E0B"
          icon={<Crown className="w-6 h-6 text-amber-400 fill-current" />}
          rightElement={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  void loadPlayers();
                }}
                disabled={loading}
                title="Refresh Live Leaderboard Data"
                className="p-2 rounded-xl bg-[#090D1C] hover:bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-300 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>

              <div className="flex items-center gap-1.5 p-1.5 bg-[#090D1C] border border-white/10 rounded-xl">
                {(['global', 'season', 'weekly'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setActiveTab(tab);
                    }}
                    onMouseEnter={() => soundFx.playHover()}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-gaming transition-all ${
                      activeTab === tab
                        ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab === 'global' ? 'Global All-Time' : tab === 'season' ? 'Season 4 Pro' : 'Weekly Blitz'}
                  </button>
                ))}
              </div>
            </div>
          }
        />

        {/* Database Migration Advisory Banner */}
        {migrationNeeded && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-300 uppercase tracking-wide">
                  SUPABASE LEADERBOARD MIGRATION RECOMMENDED
                </span>
                <p className="text-amber-200/80 text-[11px] mt-0.5">
                  Run <code className="text-white bg-black/40 px-1 py-0.5 rounded">supabase/leaderboard_migration.sql</code> in your Supabase SQL Editor to grant public visitor access to player statistics and rankings.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadPlayers()}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-gaming text-xs font-bold shrink-0 transition-colors"
            >
              Check Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-gaming text-amber-300 tracking-widest uppercase">
              SYNCHRONIZING VERIFIED GLADIATOR TELEMETRY...
            </p>
          </div>
        )}

        {/* Empty / Zero-Users State */}
        {!loading && displayPlayers.length === 0 && (
          <div className="rounded-3xl bg-[#090D1C] border border-white/10 p-12 text-center max-w-xl mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="font-gaming font-black text-xl text-white uppercase tracking-wider">
              LADDER AWAITING GLADIATORS
            </h3>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              {errorMessage ||
                'No registered player accounts currently active on the competitive ladder. Create your account to seize the Rank #01 Sovereign crown!'}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  void loadPlayers();
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-gaming text-xs font-black uppercase tracking-wider hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* TOP 3 PODIUM - Dynamic Real Registered Users */}
        {!loading && displayPlayers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* #2 Silver Position */}
              {top2 ? (
                <div
                  onClick={() => {
                    soundFx.playClick();
                    onSelectPlayer(top2);
                  }}
                  onMouseEnter={() => soundFx.playHover()}
                  className="order-2 md:order-1 relative rounded-2xl bg-[#090D1C] border border-slate-400/40 hover:border-slate-300 transition-all duration-300 p-6 flex flex-col items-center text-center cursor-pointer group hover:scale-[1.02] shadow-[0_10px_30px_rgba(148,163,184,0.15)]"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-400/20 border border-slate-300 flex items-center justify-center font-gaming text-xl font-black text-slate-200 mb-4 shadow-[0_0_15px_rgba(148,163,184,0.3)]">
                    #02
                  </div>
                  <div className="text-xl font-bold font-gaming text-white group-hover:text-cyan-300 transition-colors">
                    {top2.handle}
                  </div>
                  <div className="text-xs font-mono text-slate-400">{top2.realName}</div>
                  <div className="mt-2 px-2.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">
                    {top2.badge}
                  </div>

                  <div className="w-full mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-xs font-tabular">
                    <div>
                      <span className="block text-slate-400 text-[10px]">LEVEL</span>
                      <span className="font-bold text-white">
                        {top2.level !== null && top2.level !== undefined ? `LVL ${top2.level}` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px]">WINS</span>
                      <span className="font-bold text-white">
                        {top2.wins !== null && top2.wins !== undefined ? top2.wins.toLocaleString() : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px]">XP</span>
                      <span className="font-bold text-cyan-300">{top2.xp || '—'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="order-2 md:order-1 relative rounded-2xl bg-[#090D1C]/60 border border-dashed border-slate-700/60 p-6 flex flex-col items-center justify-center text-center opacity-80 min-h-[260px]">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-gaming text-sm font-bold text-slate-500 mb-3">
                    #02
                  </div>
                  <div className="text-sm font-bold font-gaming text-slate-400 uppercase">
                    OPEN LADDER POSITION
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 mt-1 max-w-[200px]">
                    Register an account to claim the Rank #02 podium slot.
                  </p>
                </div>
              )}

              {/* #1 Sovereign Gold Champion */}
              {top1 && (
                <div
                  onClick={() => {
                    soundFx.playClick();
                    onSelectPlayer(top1);
                  }}
                  onMouseEnter={() => soundFx.playHover()}
                  className="order-1 md:order-2 relative rounded-2xl bg-[#0C1224] border border-amber-400 hover:border-amber-300 transition-all duration-300 p-8 flex flex-col items-center text-center cursor-pointer group hover:scale-[1.04] shadow-[0_15px_45px_rgba(245,158,11,0.25)] md:-translate-y-4"
                >
                  {/* Crown Ribbon */}
                  <div className="absolute -top-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-gaming text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    RANK #01 SOVEREIGN
                  </div>

                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center font-gaming text-2xl font-black text-amber-300 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                    #01
                  </div>

                  <div className="text-2xl font-black font-gaming text-white group-hover:text-amber-300 transition-colors">
                    {top1.handle}
                  </div>
                  <div className="text-xs font-mono text-amber-300/80">{top1.realName}</div>
                  <div className="mt-2 px-3 py-0.5 rounded bg-amber-500/20 text-xs font-mono font-bold text-amber-300 border border-amber-500/30">
                    {top1.badge}
                  </div>

                  <div className="w-full mt-6 pt-4 border-t border-amber-500/20 grid grid-cols-3 gap-2 text-xs font-tabular">
                    <div>
                      <span className="block text-slate-400 text-[10px]">LEVEL</span>
                      <span className="font-extrabold text-white text-sm">
                        {top1.level !== null && top1.level !== undefined ? `LVL ${top1.level}` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px]">WINS</span>
                      <span className="font-extrabold text-white text-sm">
                        {top1.wins !== null && top1.wins !== undefined ? top1.wins.toLocaleString() : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px]">XP</span>
                      <span className="font-extrabold text-amber-300 text-sm">{top1.xp || '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* #3 Bronze Position */}
              {top3 ? (
                <div
                  onClick={() => {
                    soundFx.playClick();
                    onSelectPlayer(top3);
                  }}
                  onMouseEnter={() => soundFx.playHover()}
                  className="order-3 relative rounded-2xl bg-[#090D1C] border border-amber-700/40 hover:border-amber-600 transition-all duration-300 p-6 flex flex-col items-center text-center cursor-pointer group hover:scale-[1.02] shadow-[0_10px_30px_rgba(217,119,6,0.15)]"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-700/20 border border-amber-600 flex items-center justify-center font-gaming text-xl font-black text-amber-500 mb-4 shadow-[0_0_15px_rgba(217,119,6,0.3)]">
                    #03
                  </div>
                  <div className="text-xl font-bold font-gaming text-white group-hover:text-cyan-300 transition-colors">
                    {top3.handle}
                  </div>
                  <div className="text-xs font-mono text-slate-400">{top3.realName}</div>
                  <div className="mt-2 px-2.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">
                    {top3.badge}
                  </div>

                  <div className="w-full mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-xs font-tabular">
                    <div>
                      <span className="block text-slate-400 text-[10px]">LEVEL</span>
                      <span className="font-bold text-white">
                        {top3.level !== null && top3.level !== undefined ? `LVL ${top3.level}` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px]">WINS</span>
                      <span className="font-bold text-white">
                        {top3.wins !== null && top3.wins !== undefined ? top3.wins.toLocaleString() : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px]">XP</span>
                      <span className="font-bold text-cyan-300">{top3.xp || '—'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="order-3 relative rounded-2xl bg-[#090D1C]/60 border border-dashed border-amber-900/60 p-6 flex flex-col items-center justify-center text-center opacity-80 min-h-[260px]">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-gaming text-sm font-bold text-slate-500 mb-3">
                    #03
                  </div>
                  <div className="text-sm font-bold font-gaming text-slate-400 uppercase">
                    OPEN LADDER POSITION
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 mt-1 max-w-[200px]">
                    Register an account to claim the Rank #03 podium slot.
                  </p>
                </div>
              )}
            </div>

            {/* Detailed Tabular Leaderboard */}
            <div className="rounded-2xl bg-[#080C1A] border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#050812] border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-6">Rank</th>
                      <th className="py-4 px-6">Player</th>
                      <th className="py-4 px-6">Specialty</th>
                      <th className="py-4 px-6">Level</th>
                      <th className="py-4 px-6">Wins</th>
                      <th className="py-4 px-6">Win Rate</th>
                      <th className="py-4 px-6 text-right">XP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {displayPlayers.map((player) => (
                      <tr
                        key={player.userId || player.handle}
                        onClick={() => {
                          soundFx.playClick();
                          onSelectPlayer(player);
                        }}
                        onMouseEnter={() => soundFx.playHover()}
                        className="hover:bg-cyan-500/5 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6 font-gaming font-black text-slate-200">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-black/40 border border-white/10 text-cyan-400 group-hover:border-cyan-400/60 font-tabular">
                            #{player.rank < 10 ? `0${player.rank}` : player.rank}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-slate-950 font-gaming shadow-sm shrink-0"
                              style={{ backgroundColor: player.avatarColor }}
                            >
                              {player.handle.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold font-gaming text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                                <span>{player.handle}</span>
                                {player.role === 'admin' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-purple-950 text-purple-300 border border-purple-500/40">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 font-mono">{player.realName}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-slate-300 text-xs font-mono">
                          {player.primaryGame || 'Play Arena'}
                        </td>

                        <td className="py-4 px-6 font-tabular font-bold text-slate-200">
                          {player.level !== null && player.level !== undefined ? `LVL ${player.level}` : '—'}
                        </td>

                        <td className="py-4 px-6 font-tabular font-bold text-white">
                          {player.wins !== null && player.wins !== undefined
                            ? player.wins.toLocaleString()
                            : '—'}
                        </td>

                        <td className="py-4 px-6 font-tabular text-emerald-400 font-bold">
                          {player.winRate || '—'}
                        </td>

                        <td className="py-4 px-6 text-right font-tabular font-black text-cyan-300">
                          {player.xp || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
