import React from 'react';
import { MessageSquare, Users, Shield, UserPlus, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { COMMUNITY_CARDS } from '../data/gamingData';
import { soundFx } from '../utils/soundEffects';
import { SectionHeader } from './SectionHeader';

interface CommunityProps {
  onJoinCommunity: () => void;
  onOpenCard: (cardTitle: string) => void;
}

export const Community: React.FC<CommunityProps> = ({
  onJoinCommunity,
  onOpenCard,
}) => {
  const getCardIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'UserPlus':
        return <UserPlus className="w-5 h-5" />;
      case 'Calendar':
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  return (
    <section id="community" className="relative py-28 bg-[#04060E] border-t border-white/5 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Cyber UI */}
        <SectionHeader
          align="center"
          sectionNumber="07"
          tagline="GLOBAL SQUAD NETWORK // CO-OP HUBS"
          title="FIND YOUR SQUAD"
          subtitle="Gaming is better together. Form clans, compete in scrims, and link with cross-platform comrades."
          accentColor="#9D00FF"
          icon={<Users className="w-6 h-6 text-purple-400" />}
        />

        {/* 5 Community Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {COMMUNITY_CARDS.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                soundFx.playClick();
                onOpenCard(item.title);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className={`group relative rounded-2xl bg-[#080C1A] border border-white/10 hover:border-cyan-400/80 transition-all duration-300 p-7 flex flex-col justify-between cursor-pointer hover:shadow-[0_10px_35px_rgba(0,240,255,0.18)] hover:-translate-y-1 ${
                idx === 0 ? 'md:col-span-2 lg:col-span-1 bg-gradient-to-b from-[#0e122b] to-[#080C1A]' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-cyan-400 group-hover:scale-110 transition-transform"
                    style={{ color: item.accent }}
                  >
                    {getCardIcon(item.icon)}
                  </div>
                  <span className="text-xs font-mono text-slate-400">{item.count}</span>
                </div>

                <h3 className="text-2xl font-bold font-gaming text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>

                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-gaming font-bold text-cyan-400 group-hover:text-cyan-300">
                <span>{item.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Primary Community CTA */}
        <div className="text-center">
          <button
            type="button"
            data-cursor="action"
            onClick={() => {
              soundFx.playClick();
              onJoinCommunity();
            }}
            onMouseEnter={() => soundFx.playHover()}
            className="group px-10 py-4 rounded-xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-pink-500 hover:from-cyan-300 hover:to-pink-400 transition-all duration-300 font-gaming shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(255,0,127,0.7)] hover:scale-105 inline-flex items-center gap-3"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>JOIN THE COMMUNITY</span>
          </button>
        </div>
      </div>
    </section>
  );
};
