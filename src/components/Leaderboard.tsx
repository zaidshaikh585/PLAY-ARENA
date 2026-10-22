import React, { useState } from 'react';
import { Crown, Trophy, Flame, ChevronRight, Award, Shield } from 'lucide-react';
import { LEADERBOARD_PLAYERS } from '../data/gamingData';
import { PlayerRank } from '../types/gaming';
import { soundFx } from '../utils/soundEffects';
import { SectionHeader } from './SectionHeader';

interface LeaderboardProps {
  onSelectPlayer: (player: PlayerRank) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onSelectPlayer }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'season' | 'weekly'>('global');

  const top3 = LEADERBOARD_PLAYERS.slice(0, 3);
  const remainingPlayers = LEADERBOARD_PLAYERS.slice(3);

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
          subtitle="The fiercest gladiators dominating the global matchmaking ladders."
          accentColor="#F59E0B"
          icon={<Crown className="w-6 h-6 text-amber-400 fill-current" />}
          rightElement={
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
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-gaming transition-all ${
                    activeTab === tab
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab === 'global' ? 'Global All-Time' : tab === 'season' ? 'Season 4 Pro' : 'Weekly Blitz'}
                </button>
              ))}
            </div>
          }
        />

        {/* TOP 3 PODIUM - Premium Visual Treatment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* #2 Viper - Silver */}
          <div
            onClick={() => {
              soundFx.playClick();
              onSelectPlayer(top3[1]);
            }}
            onMouseEnter={() => soundFx.playHover()}
            className="order-2 md:order-1 relative rounded-2xl bg-[#090D1C] border border-slate-400/40 hover:border-slate-300 transition-all duration-300 p-6 flex flex-col items-center text-center cursor-pointer group hover:scale-[1.02] shadow-[0_10px_30px_rgba(148,163,184,0.15)]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-400/20 border border-slate-300 flex items-center justify-center font-gaming text-xl font-black text-slate-200 mb-4 shadow-[0_0_15px_rgba(148,163,184,0.3)]">
              #02
            </div>
            <div className="text-xl font-bold font-gaming text-white group-hover:text-cyan-300 transition-colors">
              {top3[1].handle}
            </div>
            <div className="text-xs font-mono text-slate-400">{top3[1].realName}</div>
            <div className="mt-2 px-2.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">
              {top3[1].badge}
            </div>

            <div className="w-full mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-xs font-tabular">
              <div>
                <span className="block text-slate-400 text-[10px]">LEVEL</span>
                <span className="font-bold text-white">{top3[1].level}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">WINS</span>
                <span className="font-bold text-white">{top3[1].wins}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">XP</span>
                <span className="font-bold text-cyan-300">{top3[1].xp}</span>
              </div>
            </div>
          </div>

          {/* #1 ShadowX - Gold Champion */}
          <div
            onClick={() => {
              soundFx.playClick();
              onSelectPlayer(top3[0]);
            }}
            onMouseEnter={() => soundFx.playHover()}
            className="order-1 md:order-2 relative rounded-2xl bg-[#0C1224] border border-amber-400 hover:border-amber-300 transition-all duration-300 p-8 flex flex-col items-center text-center cursor-pointer group hover:scale-[1.04] shadow-[0_15px_45px_rgba(245,158,11,0.25)] md:-translate-y-4"
          >
            {/* Crown Ribbon */}
            <div className="absolute -top-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-gaming text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.6)]">
              <Crown className="w-3.5 h-3.5 fill-current" />
              RANK #1 SOVEREIGN
            </div>

            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center font-gaming text-2xl font-black text-amber-300 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              #01
            </div>

            <div className="text-2xl font-black font-gaming text-white group-hover:text-amber-300 transition-colors">
              {top3[0].handle}
            </div>
            <div className="text-xs font-mono text-amber-300/80">{top3[0].realName}</div>
            <div className="mt-2 px-3 py-0.5 rounded bg-amber-500/20 text-xs font-mono font-bold text-amber-300 border border-amber-500/30">
              {top3[0].badge}
            </div>

            <div className="w-full mt-6 pt-4 border-t border-amber-500/20 grid grid-cols-3 gap-2 text-xs font-tabular">
              <div>
                <span className="block text-slate-400 text-[10px]">LEVEL</span>
                <span className="font-extrabold text-white text-sm">{top3[0].level}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">WINS</span>
                <span className="font-extrabold text-white text-sm">{top3[0].wins}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">XP</span>
                <span className="font-extrabold text-amber-300 text-sm">{top3[0].xp}</span>
              </div>
            </div>
          </div>

          {/* #3 Nova - Bronze */}
          <div
            onClick={() => {
              soundFx.playClick();
              onSelectPlayer(top3[2]);
            }}
            onMouseEnter={() => soundFx.playHover()}
            className="order-3 relative rounded-2xl bg-[#090D1C] border border-amber-700/40 hover:border-amber-600 transition-all duration-300 p-6 flex flex-col items-center text-center cursor-pointer group hover:scale-[1.02] shadow-[0_10px_30px_rgba(217,119,6,0.15)]"
          >
            <div className="w-12 h-12 rounded-full bg-amber-700/20 border border-amber-600 flex items-center justify-center font-gaming text-xl font-black text-amber-500 mb-4 shadow-[0_0_15px_rgba(217,119,6,0.3)]">
              #03
            </div>
            <div className="text-xl font-bold font-gaming text-white group-hover:text-cyan-300 transition-colors">
              {top3[2].handle}
            </div>
            <div className="text-xs font-mono text-slate-400">{top3[2].realName}</div>
            <div className="mt-2 px-2.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">
              {top3[2].badge}
            </div>

            <div className="w-full mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-xs font-tabular">
              <div>
                <span className="block text-slate-400 text-[10px]">LEVEL</span>
                <span className="font-bold text-white">{top3[2].level}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">WINS</span>
                <span className="font-bold text-white">{top3[2].wins}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">XP</span>
                <span className="font-bold text-cyan-300">{top3[2].xp}</span>
              </div>
            </div>
          </div>
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
                {LEADERBOARD_PLAYERS.map((player) => (
                  <tr
                    key={player.handle}
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
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-slate-950 font-gaming"
                          style={{ backgroundColor: player.avatarColor }}
                        >
                          {player.handle.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold font-gaming text-white group-hover:text-cyan-300 transition-colors">
                            {player.handle}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">{player.realName}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-300 text-xs font-mono">
                      {player.primaryGame}
                    </td>

                    <td className="py-4 px-6 font-tabular font-bold text-slate-200">
                      LVL {player.level}
                    </td>

                    <td className="py-4 px-6 font-tabular font-bold text-white">
                      {player.wins.toLocaleString()}
                    </td>

                    <td className="py-4 px-6 font-tabular text-emerald-400 font-bold">
                      {player.winRate}
                    </td>

                    <td className="py-4 px-6 text-right font-tabular font-black text-cyan-300">
                      {player.xp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
