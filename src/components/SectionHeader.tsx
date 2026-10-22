import React from 'react';
import { soundFx } from '../utils/soundEffects';

interface SectionHeaderProps {
  sectionNumber?: string;
  tagline: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
  icon?: React.ReactNode;
  align?: 'left' | 'center';
  rightElement?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  sectionNumber,
  tagline,
  title,
  subtitle,
  accentColor = '#00F0FF',
  icon,
  align = 'left',
  rightElement,
  className = '',
}) => {
  const isCentered = align === 'center';

  return (
    <div
      onMouseEnter={() => soundFx.playHover()}
      className={`group relative mb-14 select-none ${isCentered ? 'text-center max-w-3xl mx-auto' : ''} ${className}`}
    >
      <div className={`flex flex-col ${isCentered ? 'items-center' : 'md:flex-row md:items-end md:justify-between'} gap-4`}>
        <div className={isCentered ? 'flex flex-col items-center' : ''}>
          {/* Top Telemetry Kicker with Live Radar Beacon */}
          <div
            className={`flex items-center gap-2.5 text-[11px] font-mono tracking-widest uppercase mb-2 ${
              isCentered ? 'justify-center' : ''
            }`}
            style={{ color: accentColor }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-ping"
              style={{ backgroundColor: accentColor }}
            />
            {sectionNumber && (
              <>
                <span className="font-bold">SEC // {sectionNumber}</span>
                <span className="text-slate-600">·</span>
              </>
            )}
            <span className="font-bold text-slate-300 group-hover:text-white transition-colors">
              {tagline}
            </span>
          </div>

          {/* Main Title Row with Cyber Badge and Typography */}
          <div className={`flex items-center gap-3 sm:gap-4 ${isCentered ? 'justify-center' : ''}`}>
            {icon && (
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl p-[1.5px] shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, rgba(157, 0, 255, 0.6))`,
                  boxShadow: `0 0 20px ${accentColor}40`,
                }}
              >
                <div className="w-full h-full bg-[#080C1E] rounded-[10px] flex items-center justify-center text-white">
                  {icon}
                </div>
              </div>
            )}

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-gaming text-white uppercase tracking-tight leading-tight">
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 group-hover:to-cyan-200 transition-all drop-shadow-[0_4px_25px_rgba(255,255,255,0.2)]">
                  {title}
                </span>
              </h2>
            </div>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-slate-400 text-sm sm:text-base mt-2.5 max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Interactive Laser Underline Rule */}
          <div
            className={`mt-3 h-[2px] rounded-full transition-all duration-500 origin-left ${
              isCentered ? 'w-24 group-hover:w-40 mx-auto' : 'w-20 group-hover:w-36'
            }`}
            style={{
              background: `linear-gradient(to right, ${accentColor}, transparent)`,
              boxShadow: `0 0 10px ${accentColor}`,
            }}
          />
        </div>

        {/* Optional Right Element (e.g. stats, filters, counter) */}
        {rightElement && (
          <div className="shrink-0 pt-2 md:pt-0">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
};
