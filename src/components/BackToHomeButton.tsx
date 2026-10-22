import React, { useState, useEffect } from 'react';
import { ArrowUp, Home, Shield } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export const BackToHomeButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling past hero section (350px)
      setIsVisible(window.scrollY > 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToHome = () => {
    soundFx.playClick();
    const hero = document.querySelector('#home');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        type="button"
        data-cursor="action"
        onClick={scrollToHome}
        onMouseEnter={() => soundFx.playHover()}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#080C1E]/90 hover:bg-[#0C132B] border border-cyan-400/50 hover:border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
        title="Return to home page"
        aria-label="Back to home page"
      >
        {/* Glowing Indicator Pulse */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>

        {/* Home & Up Arrow Icons */}
        <div className="flex items-center gap-1 text-cyan-400 group-hover:text-cyan-300">
          <Home className="w-4 h-4" />
          <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>

        {/* Text */}
        <span className="font-gaming text-xs font-black uppercase tracking-wider text-white group-hover:text-cyan-200">
          BACK TO HOME
        </span>

        {/* Ambient Corner Accent */}
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-400/60 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-400/60 rounded-bl" />
      </button>
    </div>
  );
};
