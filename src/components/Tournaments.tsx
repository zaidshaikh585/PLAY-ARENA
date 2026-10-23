import React from 'react';
import { Trophy, Calendar, Users, Shield, ArrowUpRight, Flame } from 'lucide-react';
import { UPCOMING_TOURNAMENTS } from '../data/gamingData';
import { Tournament } from '../types/gaming';
import { soundFx } from '../utils/soundEffects';
import { SectionHeader } from './SectionHeader';

interface TournamentsProps {
  onJoinTournament: (tournament: Tournament) => void;
}

export const Tournaments: React.FC<TournamentsProps> = ({ onJoinTournament }) => {
  return (
    <section id="tournaments" className="relative py-28 bg-[#04060E] border-t border-white/5 overflow-hidden">
      {/* Visual neon atmospheric effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Cyber UI */}
        <SectionHeader
          sectionNumber="05"
          tagline="SANCTIONED ESPORTS CIRCUITS // PRO LEAGUES"
          title="RULE THE ARENA"
          subtitle="Climb the brackets, claim glory, and compete for verified cash prize pools against world-tier squads."
          accentColor="#F59E0B"
          icon={<Trophy className="w-6 h-6 text-amber-400" />}
          rightElement={
            <div className="text-left md:text-right p-3 rounded-xl bg-[#090E20] border border-amber-500/30">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">TOTAL COMBINED POOL</span>
              <span className="text-2xl sm:text-3xl font-black font-gaming text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 font-tabular drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                ₹5,000 INR
              </span>
            </div>
          }
        />

        {/* Competitive Tournament Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {UPCOMING_TOURNAMENTS.map((tourney) => (
            <div
              key={tourney.id}
              className="group relative rounded-2xl bg-[#080C1A] border border-white/10 hover:border-cyan-400/80 transition-all duration-300 p-7 flex flex-col justify-between overflow-hidden hover:shadow-[0_15px_40px_rgba(0,240,255,0.2)]"
            >
              {/* Corner Ambient Glow */}
              <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: tourney.accentColor }}
              />

              {/* Top Banner Row */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-gaming tracking-wide uppercase">
                    {tourney.game}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                      tourney.status === 'Registration Open'
                        ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                        : 'bg-orange-950/80 border border-orange-500/40 text-orange-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {tourney.status}
                  </span>
                </div>

                {/* Tournament Name */}
                <h3 className="text-2xl sm:text-3xl font-black font-gaming text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                  {tourney.title}
                </h3>

                {/* Prize Pool Display */}
                <div className="mt-4 p-4 rounded-xl bg-[#050814] border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase">PRIZE POOL</div>
                    <div className="text-3xl font-black font-gaming text-amber-400 font-tabular drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                      {tourney.prizePool}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">FORMAT</div>
                    <div className="text-xs font-bold text-slate-200 mt-1">{tourney.format}</div>
                  </div>
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-3 gap-3 my-6 pt-2 border-t border-white/5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate">{tourney.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="font-tabular font-medium text-slate-200">
                      {tourney.teams} / {tourney.maxTeams} Teams
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-pink-400 shrink-0" />
                    <span className="truncate">{tourney.entryFee}</span>
                  </div>
                </div>
              </div>

              {/* Registration Button */}
              <div className="pt-2">
                <button
                  type="button"
                  data-cursor="action"
                  onClick={() => {
                    soundFx.playClick();
                    onJoinTournament(tourney);
                  }}
                  onMouseEnter={() => soundFx.playHover()}
                  className="w-full py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 hover:from-cyan-300 hover:to-pink-500 transition-all duration-300 font-gaming shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(255,0,127,0.6)] flex items-center justify-center gap-2 group-hover:scale-[1.01]"
                >
                  <span>JOIN TOURNAMENT</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
