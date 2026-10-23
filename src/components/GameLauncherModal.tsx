import React, { useState, useEffect } from 'react';
import { X, Play, Star, Users, HardDrive, Wifi, ShieldCheck, Volume2, RotateCcw, Home, ArrowLeft } from 'lucide-react';
import { Game } from '../types/gaming';
import { GameArtwork } from './GameArtwork';
import { soundFx } from '../utils/soundEffects';

interface GameLauncherModalProps {
  game: Game | null;
  onClose: () => void;
  onNavigateHome?: () => void;
  onBack?: () => void;
}

export const GameLauncherModal: React.FC<GameLauncherModalProps> = ({ game, onClose, onNavigateHome, onBack }) => {
  const [launchProgress, setLaunchProgress] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);

  useEffect(() => {
    setLaunchProgress(0);
    setIsLaunching(false);
    setIsLaunched(false);
  }, [game]);

  if (!game) return null;

  const handleGoHome = () => {
    soundFx.playClick();
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      onClose();
      if (typeof window !== 'undefined') {
        if (window.history?.pushState) {
          window.history.pushState({}, '', '/');
        }
        const hero = document.querySelector('#home');
        if (hero) {
          hero.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  const handleBack = () => {
    soundFx.playClick();
    if (onBack) {
      onBack();
    } else {
      handleGoHome();
    }
  };

  const handleLaunch = () => {
    soundFx.playClick();
    if (game.officialUrl) { window.open(game.officialUrl, '_blank', 'noopener,noreferrer'); return; }
    setIsLaunching(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsLaunching(false);
        setIsLaunched(true);
        soundFx.playSuccess();
      }
      setLaunchProgress(progress);
    }, 120);
  };

  const handleReset = () => {
    setIsLaunched(false);
    setLaunchProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#080C1B] border border-cyan-400/50 shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden">
        {/* Header Bar with BACK and GO HOME buttons */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#050713] border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap min-w-0">
            {/* BACK button */}
            <button
              type="button"
              onClick={handleBack}
              onMouseEnter={() => soundFx.playHover()}
              className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyan-400/50 text-slate-300 hover:text-white font-gaming text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shrink-0"
              title="Return to previous page"
              aria-label="Back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>BACK</span>
            </button>

            {/* GO HOME button */}
            <button
              type="button"
              data-cursor="action"
              onClick={handleGoHome}
              onMouseEnter={() => soundFx.playHover()}
              className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-purple-950/80 hover:from-cyan-900/90 hover:to-purple-900/90 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 hover:text-white font-gaming text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all duration-200 active:scale-95 shrink-0"
              title="Return to main homepage"
              aria-label="Go to homepage"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>GO HOME</span>
            </button>

            <div className="h-4 w-px bg-white/15 hidden sm:block shrink-0" />

            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F0FF] shrink-0" />
              <span className="font-gaming text-xs font-bold uppercase tracking-wider text-white truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                PLAY ARENA LAUNCHER // {game.title}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Close launcher"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Main Visual Display */}
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 border border-white/10 group">
            <GameArtwork
  imageUrl={game.imageUrl}
  type={game.svgArtwork}
  className="w-full h-full"
/>
            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080C1B] via-transparent to-transparent opacity-90" />

            {/* In-Game Telemetry Simulation */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-black/70 border border-cyan-400/30 text-cyan-300">
                SERVERS: READY (14ms)
              </span>
              <span className="px-2.5 py-1 rounded bg-black/70 border border-purple-400/30 text-purple-300">
                DIRECTX 12 / RAY-TRACING ON
              </span>
            </div>

            {/* Center Launch Overlay */}
            {isLaunched ? (
              <div className="absolute inset-0 bg-[#060A16]/95 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-cyan-400/20 border border-cyan-400 flex items-center justify-center text-cyan-300 mb-4 shadow-[0_0_30px_#00F0FF]">
                  <Play className="w-8 h-8 fill-current" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black font-gaming text-white uppercase tracking-wider">
                  GAME SESSION ACTIVE
                </h3>
                <p className="text-slate-300 text-sm mt-2 max-w-md">
                  This launcher opens the game publisher’s official page. Actual gameplay runs in the publisher’s app or supported game client, not inside this website.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-gaming text-xs uppercase font-bold flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Session
                  </button>
                  <button
                    type="button"
                    onClick={handleGoHome}
                    className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-gaming text-xs uppercase font-black flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
                  >
                    <Home className="w-3.5 h-3.5 fill-current" />
                    GO HOME
                  </button>
                </div>
              </div>
            ) : isLaunching ? (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="text-cyan-400 font-gaming text-sm font-bold uppercase mb-2">
                  ALLOCATING NEURAL SHADER CACHE... {launchProgress}%
                </div>
                <div className="w-64 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-cyan-400/40">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 shadow-[0_0_12px_#00F0FF] transition-all duration-150"
                    style={{ width: `${launchProgress}%` }}
                  />
                </div>
                <div className="text-slate-400 text-xs font-mono mt-3">
                  Verifying anti-cheat integrity & cloud save synchronization...
                </div>
              </div>
            ) : null}

            {/* Title & Platforms */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">{game.genre}</span>
                <h2 className="text-3xl font-black font-gaming text-white uppercase">{game.title}</h2>
              </div>
              <div className="text-right text-xs font-mono text-slate-300">
                <span>{game.developer || 'Play Arena Studios'}</span>
              </div>
            </div>
          </div>

          {/* Description & Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold font-gaming tracking-widest text-slate-400 uppercase">
                MISSION BRIEFING
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                {game.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{game.rating} Score</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <Users className="w-4 h-4" />
                  <span>{game.playerCount} Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-purple-400" />
                  <span>{game.storage || '65 GB SSD'}</span>
                </div>
              </div>
            </div>

            {/* Quick Launch CTA Card */}
            <div className="p-5 rounded-xl bg-[#050713] border border-white/10 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-[11px] font-mono text-slate-400">LICENSE STATUS</div>
                <div className="text-sm font-bold font-gaming text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                  ARENA PASS VERIFIED
                </div>
              </div>

              {!isLaunched && !isLaunching && (
                <button
                  type="button"
                  data-cursor="action"
                  onClick={handleLaunch}
                  onMouseEnter={() => soundFx.playHover()}
                  className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-300 hover:to-pink-400 transition-all font-gaming shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  OPEN OFFICIAL GAME
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
