import React from 'react';
import { ArrowRight, Crosshair, Sword, Gauge, Trophy, Flame, Compass, Skull, MapPin, Swords } from 'lucide-react';
import { Category } from '../types/gaming';
import { soundFx } from '../utils/soundEffects';
import { GameArtwork } from './GameArtwork';
import { SectionHeader } from './SectionHeader';

interface GameCategoriesProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

export const GameCategories: React.FC<GameCategoriesProps> = ({
  categories,
  onSelectCategory,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crosshair':
        return <Crosshair className="w-5 h-5" />;
      case 'Sword':
        return <Sword className="w-5 h-5" />;
      case 'Gauge':
        return <Gauge className="w-5 h-5" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'Compass':
        return <Compass className="w-5 h-5" />;
      case 'Skull':
        return <Skull className="w-5 h-5" />;
      case 'MapPin':
      default:
        return <MapPin className="w-5 h-5" />;
        
    }
    
  }; 
    const categoryImages: Record<string, string> = {
    fps: '/categories/fps.jpg',
    rpg: '/categories/rpg.jpg',
    racing: '/categories/racing.jpg',
    sports: '/categories/sports.jpg',
    battleroyale: '/categories/battle-royale.jpg',
    strategy: '/categories/strategy.jpg',
    horror: '/categories/horror.jpg',
    adventure: '/categories/adventure.jpg',
  };
  return (
    
    <section id="categories" className="relative py-28 bg-[#04060D] border-t border-white/5 overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-pink-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Cyber UI */}
        <SectionHeader
          align="center"
          sectionNumber="02"
          tagline="COMBAT SPECIALIZATIONS // GENRE MATRIX"
          title="CHOOSE YOUR BATTLE"
          subtitle="Select your discipline. Dominate every arena from tactical headshots to open-world mythic raids."
          accentColor="#A855F7"
          icon={<Swords className="w-6 h-6 text-purple-400" />}
        />

        {/* 8 Category Interactive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                soundFx.playClick();
                onSelectCategory(cat);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer border border-white/10 transition-all duration-500 hover:scale-[1.03] flex flex-col justify-end p-6 select-none"
              style={{
                borderColor: undefined,
              }}
            >
              {/* Category Background Artwork / Graphic */}
              <div className="absolute inset-0 z-0">
                      <img
          src={categoryImages[cat.id]}
          alt={`${cat.name} category`}
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-125 group-hover:brightness-110"
        />
              </div>

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#060812] via-[#060812]/70 to-[#060812]/20 z-10 transition-opacity duration-500 group-hover:opacity-60" />

              {/* Vivid Glowing Neon Overlay when Pointing on Topic */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 z-10 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${cat.accent}, transparent 75%)`,
                }}
              />

              {/* Interactive Corner Cyber Scanner */}
              <div
                className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top right, ${cat.accent}60, transparent 70%)`,
                }}
              />

              {/* Category Content */}
              <div className="relative z-20 space-y-2">
                {/* Category Icon & Games Count */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <div
                    className="p-2 rounded-lg bg-black/70 border border-white/15 backdrop-blur-md transition-all group-hover:scale-110 shadow-lg"
                    style={{
                      color: cat.accent,
                      borderColor: `${cat.accent}80`,
                      boxShadow: `0 0 15px ${cat.accent}40`,
                    }}
                  >
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <span className="px-2.5 py-1 rounded bg-black/70 border border-white/15 text-slate-300 font-tabular backdrop-blur-md">
                    {cat.gameCount} TITLES
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-2xl font-black font-gaming text-white uppercase tracking-wider transition-colors duration-300"
                  style={{
                    textShadow: `0 0 20px ${cat.accent}50`,
                  }}
                >
                  {cat.name}
                </h3>

                {/* Tagline */}
                <p className="text-slate-300 text-xs line-clamp-1 group-hover:text-white transition-colors">
                  {cat.tagline}
                </p>

                {/* Animated Arrow Prompt */}
                <div
                  className="pt-2 flex items-center gap-2 text-xs font-bold font-gaming transition-all duration-300 group-hover:translate-x-2"
                  style={{ color: cat.accent }}
                >
                  <span>ENTER ARENA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Glowing Bottom Neon Accent Bar on Hover */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                style={{
                  backgroundColor: cat.accent,
                  boxShadow: `0 0 12px ${cat.accent}`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

