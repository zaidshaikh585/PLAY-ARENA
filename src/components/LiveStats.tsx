import React, { useEffect, useState, useRef } from 'react';
import { Users, Gamepad2, Swords, Trophy, Activity, Radio } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

interface StatItemProps {
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
  icon: React.ReactNode;
  accent: string;
}

const AnimatedStat: React.FC<StatItemProps> = ({
  value,
  suffix,
  decimals = 0,
  label,
  icon,
  accent,
}) => {
  const [currentVal, setCurrentVal] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1800;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCurrentVal(easeProgress * value);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div
      ref={elementRef}
      className="relative p-8 rounded-2xl bg-[#090D1A]/80 border border-white/10 hover:border-cyan-400/60 transition-all duration-300 backdrop-blur-xl group hover:shadow-[0_10px_35px_rgba(0,240,255,0.2)]"
    >
      {/* Ambient Corner Glow */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"
        style={{ backgroundColor: accent }}
      />

      <div className="flex items-center justify-between mb-4">
        <div
          className="p-3 rounded-xl bg-white/5 border border-white/10 text-cyan-400 group-hover:scale-110 transition-transform"
          style={{ color: accent }}
        >
          {icon}
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>LIVE TELEMETRY</span>
        </div>
      </div>

      <div className="text-4xl sm:text-5xl font-black font-gaming text-white tracking-tight font-tabular">
        {decimals > 0 ? currentVal.toFixed(decimals) : Math.floor(currentVal).toLocaleString()}
        <span style={{ color: accent }}>{suffix}</span>
      </div>

      <div className="mt-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 font-gaming">
        {label}
      </div>
    </div>
  );
};

export const LiveStats: React.FC = () => {
  return (
    <section id="stats" className="relative py-24 bg-[#050711] border-t border-white/5 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-r from-cyan-600/10 via-purple-600/10 to-pink-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Cyber UI */}
        <SectionHeader
          sectionNumber="04"
          tagline="GLOBAL NETWORK METRICS // CLOUD NODES"
          title="LIVE GAMING CONCURRENCY"
          subtitle="Aggregated in real time across active server clusters in North America, Europe, Asia-Pacific, and South America."
          accentColor="#10B981"
          icon={<Activity className="w-6 h-6 text-emerald-400" />}
          rightElement={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-mono text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SYNCHRONIZED · 12MS PING</span>
            </div>
          }
        />

        {/* 4 Primary Stats Requested by User */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedStat
            value={2.4}
            decimals={1}
            suffix="M+"
            label="ACTIVE PLAYERS"
            icon={<Users className="w-6 h-6" />}
            accent="#00F0FF"
          />

          <AnimatedStat
            value={18}
            suffix="K+"
            label="GAMES PLAYED TODAY"
            icon={<Gamepad2 className="w-6 h-6" />}
            accent="#9D00FF"
          />

          <AnimatedStat
            value={5.8}
            decimals={1}
            suffix="K+"
            label="LIVE MATCHES"
            icon={<Swords className="w-6 h-6" />}
            accent="#FF007F"
          />

          <AnimatedStat
            value={127}
            suffix=""
            label="TOURNAMENTS"
            icon={<Trophy className="w-6 h-6" />}
            accent="#F59E0B"
          />
        </div>
      </div>
    </section>
  );
};
