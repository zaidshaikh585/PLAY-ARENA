import React, { useEffect, useRef, useState } from 'react';
import { Play, Sparkles, ChevronDown, Flame, ShieldAlert, Cpu, Users, Eye, Crosshair, Shield } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { GameArtwork } from './GameArtwork';
import { Game } from '../types/gaming';

interface HeroProps {
  onExploreGames: () => void;
  onJoinArena: () => void;
  onSelectGame: (gameId: string) => void;
  featuredGames: Game[];
}

interface HeroTopic {
  id: string;
  label: string;
  gameId: string;
  gameTitle: string;
  genre: string;
  color: string;
  svgArtwork: 'fps' | 'racing' | 'rpg' | 'tactical' | 'battleroyale' | 'scifi';
  stats: string;
}

const HERO_TOPICS: HeroTopic[] = [
  {
    id: 'fps',
    label: 'TACTICAL FPS',
    gameId: 'cyber-strike',
    gameTitle: 'Cyber Strike',
    genre: 'FPS · 2088 Neon',
    color: '#00F0FF',
    svgArtwork: 'fps',
    stats: '12.5K In Battle · 14ms Ping',
  },
  {
    id: 'racing',
    label: 'NEON RACING',
    gameId: 'neon-drift',
    gameTitle: 'Neon Drift',
    genre: 'Supersonic Drift',
    color: '#FF007F',
    svgArtwork: 'racing',
    stats: '15.2K In Race · 240 FPS RT',
  },
  {
    id: 'rpg',
    label: 'MYTHIC RPG',
    gameId: 'realm-of-legends',
    gameTitle: 'Realm of Legends',
    genre: 'Open-World Celestial',
    color: '#A855F7',
    svgArtwork: 'rpg',
    stats: '21.4K In Raids · Colossus Live',
  },
  {
    id: 'tactical',
    label: 'STEALTH OPS',
    gameId: 'shadow-protocol',
    gameTitle: 'Shadow Protocol',
    genre: 'Tactical Recon',
    color: '#10B981',
    svgArtwork: 'tactical',
    stats: '8.7K In Stealth · Satellite Link 99%',
  },
  {
    id: 'battleroyale',
    label: 'BATTLE ROYALE',
    gameId: 'apex-warriors',
    gameTitle: 'Apex Warriors',
    genre: 'Caldera Drop',
    color: '#F97316',
    svgArtwork: 'battleroyale',
    stats: '32.1K In Drop · 100 Players',
  },
  {
    id: 'scifi',
    label: 'DEEP SPACE',
    gameId: 'dark-horizon',
    gameTitle: 'Dark Horizon',
    genre: 'Planetary Survival',
    color: '#06B6D4',
    svgArtwork: 'scifi',
    stats: '9.8K Explorers · Monolith Event',
  },
];

export const Hero: React.FC<HeroProps> = ({
  onExploreGames,
  onJoinArena,
  onSelectGame,
  featuredGames,
}) => {
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [hoveredTopic, setHoveredTopic] = useState<HeroTopic | null>(null);
  const [isTaglineHovered, setIsTaglineHovered] = useState(false);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeGame = featuredGames[activeHeroIndex] || featuredGames[0];

  // Currently displayed background artwork (switches based on hovered topic, tagline, or title)
  const activeBgArtwork = hoveredTopic
    ? hoveredTopic.svgArtwork
    : isTaglineHovered
    ? 'racing'
    : isTitleHovered
    ? 'fps'
    : activeGame.svgArtwork;

  // Active theme color for glows & highlights
  const activeThemeColor = hoveredTopic
    ? hoveredTopic.color
    : isTaglineHovered
    ? '#FF007F'
    : isTitleHovered
    ? '#00F0FF'
    : '#00F0FF';

  // Mouse tracking for hero ambient cursor-following glow
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }

    const colors = ['#00F0FF', '#9D00FF', '#FF007F', '#38BDF8'];
    const particles: Particle[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5 - 0.2,
      size: Math.random() * 2.5 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 100) * 0.15;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 bg-[#05070F]"
    >
      {/* Dynamic Background Game Artwork: Smoothly activates with vivid colors when hovering on Tagline or Topics */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-700 ease-out z-0 overflow-hidden ${
          hoveredTopic || isTaglineHovered ? 'opacity-40 scale-100' : 'opacity-10 scale-105'
        }`}
      >
        <GameArtwork
          type={activeBgArtwork}
          className="w-full h-full object-cover transition-transform duration-1000"
        />
        {/* Scrim gradients to maintain supreme legibility of text */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070F] via-[#05070F]/85 to-[#05070F]/90" />
        <div className="absolute inset-0 bg-scanlines opacity-20" />
      </div>

      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none z-0" />

      {/* Floating Canvas Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Cursor-Following Glow Spotlight in Hero */}
      <div
        className="pointer-events-none absolute -inset-px opacity-65 transition-opacity duration-300 z-0 hidden md:block"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, ${activeThemeColor}20, rgba(157, 0, 255, 0.05), transparent 70%)`,
        }}
      />

      {/* Dynamic Atmospheric Neon Orbs that react to hovered topic color */}
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: activeThemeColor,
          opacity: hoveredTopic || isTaglineHovered ? 0.28 : 0.12,
        }}
      />
      <div
        className="absolute bottom-1/4 right-0 w-[480px] h-[480px] rounded-full blur-[160px] pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: hoveredTopic ? hoveredTopic.color : '#9D00FF',
          opacity: hoveredTopic || isTaglineHovered ? 0.3 : 0.14,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Distinct Website Name, Interactive Tagline UI & Topics */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Platform Status Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-semibold tracking-wider font-gaming shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-white">ARENA SYSTEM ONLINE</span>
              <span className="text-cyan-500/80">/</span>
              <span className="font-tabular text-cyan-300">2.4M GLADIATORS</span>
            </div>

            {/* 1. DISTINCT WEBSITE NAME: Unboxed with Dedicated Glowing UI on the Line */}
            <div
              onMouseEnter={() => {
                soundFx.playHover();
                setIsTitleHovered(true);
              }}
              onMouseLeave={() => setIsTitleHovered(false)}
              className="group relative select-none cursor-pointer inline-block"
            >
              {/* Dynamic Neon Ambient Glow Backdrop that ignites when pointed */}
              <div
                className={`absolute -inset-x-8 -inset-y-4 rounded-3xl blur-2xl transition-all duration-500 pointer-events-none ${
                  isTitleHovered
                    ? 'bg-gradient-to-r from-cyan-500/35 via-blue-500/25 to-purple-600/35 opacity-100 scale-105'
                    : 'opacity-0 scale-95'
                }`}
              />

              {/* Top Horizon Telemetry Strip on the PLAY ARENA Line */}
              <div className="flex items-center justify-between gap-4 mb-2 text-[10px] font-mono tracking-widest uppercase transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isTitleHovered ? 'bg-cyan-400 shadow-[0_0_12px_#00F0FF] animate-ping' : 'bg-cyan-500/60'
                    }`}
                  />
                  <Crosshair className={`w-3.5 h-3.5 transition-colors ${isTitleHovered ? 'text-cyan-300' : 'text-cyan-500/80'}`} />
                  <span className={`transition-colors duration-300 font-bold ${isTitleHovered ? 'text-cyan-300' : 'text-slate-400'}`}>
                    OFFICIAL PLATFORM ARCHIVES
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400 font-tabular">EST. 2026</span>
                </div>

                {/* Overdrive Status Beacon that lights up on hover */}
                <div
                  className={`hidden sm:flex items-center gap-1.5 transition-all duration-300 ${
                    isTitleHovered ? 'text-cyan-300 opacity-100' : 'text-slate-500 opacity-50'
                  }`}
                >
                  <span className="text-[9px] font-tabular">FREQ 240Hz</span>
                  <span className="text-slate-600">·</span>
                  <span className={isTitleHovered ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {isTitleHovered ? '⚡ OVERDRIVE' : 'ONLINE'}
                  </span>
                </div>
              </div>

              {/* Main PLAY ARENA Line: Reticles, Crest Emblem, and Glowing Wordmark */}
              <div className="relative flex items-center gap-3 sm:gap-5">
                {/* Tactical Left Reticle Bracket */}
                <div
                  className={`hidden sm:flex flex-col justify-between h-14 sm:h-20 w-3.5 border-l-2 border-y-2 rounded-l transition-all duration-300 ${
                    isTitleHovered
                      ? 'border-cyan-400 shadow-[0_0_15px_#00F0FF] translate-x-0'
                      : 'border-white/15 translate-x-1'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full m-0.5 transition-colors ${isTitleHovered ? 'bg-cyan-400 shadow-[0_0_8px_#00F0FF]' : 'bg-slate-600'}`} />
                  <span className={`w-1.5 h-1.5 rounded-full m-0.5 transition-colors ${isTitleHovered ? 'bg-cyan-400 shadow-[0_0_8px_#00F0FF]' : 'bg-slate-600'}`} />
                </div>

                {/* Glowing Hexagonal Cyber Crest Emblem */}
                <div
                  className={`relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl p-[2px] transition-all duration-500 shrink-0 ${
                    isTitleHovered
                      ? 'scale-110 shadow-[0_0_35px_rgba(0,240,255,0.85)] rotate-3'
                      : 'shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  }`}
                  style={{
                    background: isTitleHovered
                      ? 'linear-gradient(135deg, #00F0FF, #9D00FF, #FF007F)'
                      : 'linear-gradient(135deg, #00F0FF, #1E293B)',
                  }}
                >
                  <div className="w-full h-full bg-[#080C1E] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                    <Shield
                      className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 transition-all duration-300 ${
                        isTitleHovered
                          ? 'text-cyan-300 drop-shadow-[0_0_12px_#00F0FF]'
                          : 'text-cyan-400'
                      }`}
                    />
                    {/* Inner Pulse Wave */}
                    <div
                      className={`absolute inset-0 bg-cyan-400/25 transition-opacity duration-300 ${
                        isTitleHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Main Wordmark Text with Radiant Neon Glow-Up */}
                <h1 className="relative text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-wider font-gaming text-white leading-none">
                  <span
                    className={`relative inline-block transition-all duration-300 ${
                      isTitleHovered
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 scale-[1.01]'
                        : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200 drop-shadow-[0_4px_25px_rgba(255,255,255,0.2)]'
                    }`}
                    style={{
                      textShadow: isTitleHovered
                        ? '0 0 25px rgba(0, 240, 255, 0.95), 0 0 50px rgba(0, 240, 255, 0.6), 0 0 85px rgba(157, 0, 255, 0.45)'
                        : undefined,
                    }}
                  >
                    PLAY ARENA
                  </span>
                </h1>

                {/* Tactical Right Reticle Bracket */}
                <div
                  className={`hidden sm:flex flex-col justify-between h-14 sm:h-20 w-3.5 border-r-2 border-y-2 rounded-r transition-all duration-300 ${
                    isTitleHovered
                      ? 'border-cyan-400 shadow-[0_0_15px_#00F0FF] translate-x-0'
                      : 'border-white/15 -translate-x-1'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full m-0.5 transition-colors self-end ${isTitleHovered ? 'bg-cyan-400 shadow-[0_0_8px_#00F0FF]' : 'bg-slate-600'}`} />
                  <span className={`w-1.5 h-1.5 rounded-full m-0.5 transition-colors self-end ${isTitleHovered ? 'bg-cyan-400 shadow-[0_0_8px_#00F0FF]' : 'bg-slate-600'}`} />
                </div>
              </div>

              {/* Bottom Laser Horizon Rail with Neon Underline Surge */}
              <div className="relative mt-3 pt-1">
                <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isTitleHovered
                        ? 'w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_20px_#00F0FF]'
                        : 'w-28 bg-gradient-to-r from-cyan-400 to-transparent'
                    }`}
                  />
                </div>

                {/* Micro-telemetry Coordinates under the Line */}
                <div
                  className={`flex items-center justify-between text-[9px] font-mono tracking-widest uppercase mt-1 transition-all duration-300 ${
                    isTitleHovered ? 'text-cyan-400 opacity-100' : 'text-slate-500 opacity-60'
                  }`}
                >
                  <span>LATENCY: 12MS · DIRECT CONNECT</span>
                  <span className="font-bold">
                    {isTitleHovered ? '✦ NEURAL SYNC LOCKED' : 'STANDBY'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. DISTINCT TAGLINE: Sleek Cinematic Neon Italic Slogan with Interactive Hover & Colors */}
            <div
              onMouseEnter={() => {
                soundFx.playHover();
                setIsTaglineHovered(true);
              }}
              onMouseLeave={() => setIsTaglineHovered(false)}
              className="group relative cursor-pointer select-none inline-block transition-transform duration-300 hover:scale-[1.02]"
            >
              {/* Laser speed accents and glow */}
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-cyan-400 group-hover:w-14 transition-all duration-300" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black italic tracking-wide uppercase font-gaming text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400 drop-shadow-[0_0_20px_rgba(0,240,255,0.5)] group-hover:drop-shadow-[0_0_35px_rgba(255,0,127,0.8)] transition-all duration-300">
                  PLAY BEYOND THE LIMITS
                </h2>
                <span className="h-[2px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-pink-500 group-hover:w-14 transition-all duration-300" />
              </div>

              {/* Interactive Hover Micro-Bar */}
              <div className="h-[2px] w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mt-2 opacity-30 group-hover:opacity-100 group-hover:shadow-[0_0_12px_#00F0FF] transition-all duration-300 rounded-full" />
            </div>

            {/* 3. INTERACTIVE TOPICS / BATTLEGROUNDS: Point to see colors & background game images */}
            <div className="w-full space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  EXPLORE TOPICS & BATTLEGROUNDS
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  (Hover to project game backdrop & neon colors)
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {HERO_TOPICS.map((topic) => {
                  const isHovered = hoveredTopic?.id === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onMouseEnter={() => {
                        soundFx.playHover();
                        setHoveredTopic(topic);
                      }}
                      onMouseLeave={() => setHoveredTopic(null)}
                      onClick={() => {
                        soundFx.playClick();
                        onSelectGame(topic.gameId);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-gaming transition-all duration-300 border flex items-center gap-2 group cursor-pointer ${
                        isHovered
                          ? 'scale-105 text-white shadow-lg'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                      style={{
                        borderColor: isHovered ? topic.color : undefined,
                        backgroundColor: isHovered ? `${topic.color}25` : undefined,
                        boxShadow: isHovered ? `0 0 20px ${topic.color}70` : undefined,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
                        style={{ backgroundColor: topic.color }}
                      />
                      <span>{topic.label}</span>
                      <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                        · {topic.gameTitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed pt-1">
              Enter a world where every challenge becomes an opportunity, every match becomes a battle, and every victory becomes a legend.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                data-cursor="action"
                onClick={() => {
                  soundFx.playClick();
                  onExploreGames();
                }}
                onMouseEnter={() => soundFx.playHover()}
                className="relative group px-8 py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider text-black font-gaming overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.5)] hover:shadow-[0_0_35px_rgba(0,240,255,0.8)] transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 group-hover:from-cyan-300 group-hover:to-pink-500 transition-all duration-500" />
                <span className="relative flex items-center gap-2">
                  <Play className="w-4 h-4 fill-current" />
                  EXPLORE GAMES
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onJoinArena();
                }}
                onMouseEnter={() => soundFx.playHover()}
                className="px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider text-slate-200 hover:text-white font-gaming bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyan-500/60 transition-all duration-300 backdrop-blur-sm"
              >
                JOIN THE ARENA
              </button>
            </div>

            {/* Quick Micro-Specs */}
            <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-white/10 w-full max-w-lg">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Zero-Lag Matchmaking</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span>Anti-Cheat Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-pink-400" />
                <span>$250K+ Active Pools</span>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Gaming Visual with 3D Holographic Card */}
          <div className="lg:col-span-5 relative">
            {/* Cyber Frame Glow Backdrop matching active theme */}
            <div
              className="absolute -inset-2 rounded-3xl blur-2xl opacity-70 animate-pulse pointer-events-none transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${activeThemeColor}40, rgba(157, 0, 255, 0.3), rgba(255, 0, 127, 0.3))`,
              }}
            />

            {/* Card Container */}
            <div className="relative rounded-2xl bg-[#090D1A]/90 border border-cyan-500/40 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl group">
              {/* Header Telemetry Bar */}
              <div className="px-4 py-2.5 bg-[#060812] border-b border-white/10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-bold uppercase tracking-wider">{activeGame.genre} SHOWCASE</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="text-cyan-400 font-bold">★ {activeGame.rating}</span>
                  <span>{activeGame.playerCount} IN BATTLE</span>
                </div>
              </div>

              {/* Artwork Viewport */}
              <div className="relative aspect-[16/10] overflow-hidden">
                
<GameArtwork
  imageUrl={activeGame.imageUrl}
  type={activeGame.svgArtwork}
  className="w-full h-full transition-transform duration-700 group-hover:scale-105"
/> 
                
                {/* Neon overlay vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090D1A] via-transparent to-transparent opacity-90" />

                {/* Floating Holographic Badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-black/60 border border-cyan-400/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md">
                  NEURAL LINK 60FPS
                </div>

                {/* Game Title & Quick Launch */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">{activeGame.genre}</span>
                    <h3 className="text-2xl font-bold font-gaming text-white tracking-wide">{activeGame.title}</h3>
                  </div>

                  <button
                    type="button"
                    data-cursor="action"
                    onClick={() => {
                      soundFx.playClick();
                      onSelectGame(activeGame.id);
                    }}
                    onMouseEnter={() => soundFx.playHover()}
                    className="p-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_15px_#00F0FF] transition-transform hover:scale-110"
                    title={`Launch ${activeGame.title}`}
                  >
                    <Play className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>

              {/* Interactive Game Switcher Tabs */}
              <div className="p-3 bg-[#060A16] border-t border-white/5 grid grid-cols-3 gap-2">
                {featuredGames.slice(0, 3).map((game, idx) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setActiveHeroIndex(idx);
                    }}
                    onMouseEnter={() => soundFx.playHover()}
                    className={`px-2 py-2 rounded-lg text-left transition-all text-xs font-medium border ${
                      activeHeroIndex === idx
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                        : 'bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold truncate font-gaming">{game.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{game.genre}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator at Bottom */}
        <div className="pt-16 pb-4 flex flex-col items-center justify-center text-center">
          <a
            href="#games"
            onClick={(e) => {
              e.preventDefault();
              soundFx.playClick();
              document.querySelector('#games')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onMouseEnter={() => soundFx.playHover()}
            className="group flex flex-col items-center text-xs font-semibold tracking-widest text-slate-400 hover:text-cyan-400 transition-colors uppercase font-gaming space-y-1.5"
          >
            <span>SCROLL TO EXPLORE</span>
            <ChevronDown className="w-4 h-4 text-cyan-400 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
};
