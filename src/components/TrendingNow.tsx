import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Users, Flame, Play } from 'lucide-react';
import { TRENDING_GAMES } from '../data/gamingData';
import { GameArtwork } from './GameArtwork';
import { soundFx } from '../utils/soundEffects';
import { SectionHeader } from './SectionHeader';

interface TrendingNowProps {
  onSelectGame: (gameId: string) => void;
}

export const TrendingNow: React.FC<TrendingNowProps> = ({ onSelectGame }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleScroll = (direction: 'left' | 'right') => {
    soundFx.playClick();
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -380 : 380;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section id="trending" className="relative py-24 bg-[#050711] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        {/* Section Header with Cyber UI */}
        <SectionHeader
          sectionNumber="03"
          tagline="HOT VELOCITY PICKS // MOMENTUM SURGE"
          title="TRENDING NOW"
          subtitle="The most active battlegrounds across the Play Arena network this hour."
          accentColor="#FF007F"
          icon={<Flame className="w-6 h-6 text-pink-500 fill-current" />}
          rightElement={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                onMouseEnter={() => soundFx.playHover()}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/50 text-slate-300 hover:text-white transition-all active:scale-95"
                aria-label="Previous trending games"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                onMouseEnter={() => soundFx.playHover()}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/50 text-slate-300 hover:text-white transition-all active:scale-95"
                aria-label="Next trending games"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          }
        />
      </div>

      {/* Horizontal Carousel Track with Drag Support */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex gap-6 overflow-x-auto pb-8 pt-2 px-4 sm:px-8 no-scrollbar scroll-smooth cursor-grab ${
          isDragging ? 'cursor-grabbing select-none' : ''
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TRENDING_GAMES.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (!isDragging) {
                soundFx.playClick();
                onSelectGame(item.id);
              }
            }}
            onMouseEnter={() => soundFx.playHover()}
            className="flex-shrink-0 w-80 sm:w-96 rounded-2xl bg-[#090D1C] border border-white/10 hover:border-cyan-400/70 transition-all duration-300 overflow-hidden group hover:shadow-[0_10px_30px_rgba(0,240,255,0.25)] flex flex-col"
          >
            {/* Visual Cover Art with Large Ranking Badge */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
              <GameArtwork
                imageUrl={item.imageUrl}
                type={item.artwork}
                alt={`${item.title} cover`}
                officialSource={item.officialGame}
                showOfficialBadge={true}
                className="w-full h-full transition-transform duration-700 group-hover:scale-110"
              />

              {/* Large Stylized Ranking Number */}
              <div className="absolute top-3 left-3 w-12 h-12 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-400/60 flex items-center justify-center font-gaming text-2xl font-black text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                #{item.rank}
              </div>

              {/* Weekly Momentum Tag */}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 backdrop-blur-md">
                {item.change}
              </div>

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090D1C] via-transparent to-transparent" />
            </div>

            {/* Information */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">{item.genre}</div>
                <h3 className="text-xl font-bold font-gaming text-white group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-tabular">{item.rating}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-tabular">{item.playersOnline}</span> online
                </div>

                <div className="p-2 rounded-lg bg-cyan-400/10 group-hover:bg-cyan-400 text-cyan-400 group-hover:text-black transition-colors">
                  <Play className="w-4 h-4 fill-current" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
