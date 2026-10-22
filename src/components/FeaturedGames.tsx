import React, { useState } from 'react';
import { Star, Users, Play, Heart, Monitor, Gamepad2, Sparkles } from 'lucide-react';
import { Game } from '../types/gaming';
import { GameArtwork } from './GameArtwork';
import { soundFx } from '../utils/soundEffects';
import { SectionHeader } from './SectionHeader';

interface FeaturedGamesProps {
  games: Game[];
  onPlayGame: (game: Game) => void;
  onToggleWishlist: (game: Game) => void;
  wishlistIds: string[];
}

export const FeaturedGames: React.FC<FeaturedGamesProps> = ({
  games,
  onPlayGame,
  onToggleWishlist,
  wishlistIds,
}) => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  return (
    <section id="games" className="relative py-28 bg-[#060812] border-t border-white/5 overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Cyber UI */}
        <SectionHeader
          sectionNumber="01"
          tagline="SHOWCASE ARCHIVES // AAA DEPLOYMENTS"
          title="ENTER THE GAME"
          subtitle="Discover your next obsession. Select from high-octane competitive titles."
          accentColor="#00F0FF"
          icon={<Gamepad2 className="w-6 h-6 text-cyan-400" />}
          rightElement={
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>6 AAA TITLES ACTIVE</span>
            </div>
          }
        />

        {/* 6-Card Responsive Grid with 3D Tilt & Glow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => {
            const isWishlisted = wishlistIds.includes(game.id);
            const isHovered = hoveredCardId === game.id;

            return (
              <div
                key={game.id}
                onMouseEnter={() => {
                  soundFx.playHover();
                  setHoveredCardId(game.id);
                }}
                onMouseLeave={() => setHoveredCardId(null)}
                className="group relative rounded-2xl bg-[#090D1C] border border-white/10 hover:border-cyan-400/70 transition-all duration-500 flex flex-col overflow-hidden hover:shadow-[0_10px_35px_rgba(0,240,255,0.25)] hover:-translate-y-1.5"
                style={{
                  perspective: '1000px',
                }}
              >
                {/* Artwork Canvas / Frame */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <GameArtwork
                    imageUrl={game.imageUrl}
                    type={game.svgArtwork}
                    alt={`${game.title} official game visual`}
                    officialSource={game.officialSource}
                    showOfficialBadge={true}
                    className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* Top Overlay Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded bg-black/75 backdrop-blur-md border border-white/10 text-cyan-300 text-xs font-bold font-gaming uppercase tracking-wider">
                      {game.genre}
                    </span>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playClick();
                        onToggleWishlist(game);
                      }}
                      onMouseEnter={() => soundFx.playHover()}
                      className={`p-2 rounded-full backdrop-blur-md transition-all ${
                        isWishlisted
                          ? 'bg-pink-500 text-white shadow-[0_0_12px_#FF007F]'
                          : 'bg-black/60 text-slate-300 hover:text-pink-400 hover:bg-black/80 border border-white/10'
                      }`}
                      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090D1C] via-[#090D1C]/30 to-transparent" />

                  {/* Platforms indicator on artwork */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10">
                    {game.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-slate-300"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Rating & Active Players */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-tabular text-sm">{game.rating}</span>
                        <span className="text-slate-500 text-xs font-normal">/ 5.0</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-cyan-300 font-mono">
                        <Users className="w-3.5 h-3.5" />
                        <span>{game.playerCount} Playing</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold font-gaming text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                      {game.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed line-clamp-2">
                      {game.description}
                    </p>
                  </div>

                  {/* Card Footer: Metadata & PLAY NOW Button */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                    <div className="text-[11px] font-mono text-slate-400">
                      <span>STORAGE: {game.storage || '50 GB'}</span>
                    </div>

                    {/* PLAY NOW CTA */}
                    <button
                      type="button"
                      data-cursor="action"
                      onClick={() => {
                        soundFx.playClick();
                        onPlayGame(game);
                      }}
                      onMouseEnter={() => soundFx.playHover()}
                      className="group/btn relative px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black font-gaming overflow-hidden transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.7)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 group-hover/btn:from-cyan-300 group-hover/btn:to-pink-500 transition-all duration-300" />
                      <span className="relative flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        PLAY NOW
                      </span>
                    </button>
                  </div>
                </div>

                {/* Subtle Neon Underline Glow on Hover */}
                <div
                  className={`h-[2px] w-full transition-all duration-500 ${
                    isHovered
                      ? 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_10px_#00F0FF]'
                      : 'bg-transparent'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
