import React, { useState, useEffect } from 'react';
import { Search, Heart, Volume2, VolumeX, Menu, X, Shield, Play, User, LogOut } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onOpenAuth: () => void;
  onPlayNow: () => void;
  wishlistCount: number;
  currentUser?: {
    email: string;
    gamerTag: string;
    role: 'user' | 'admin';
  } | null;
  onSignOut?: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenWishlist,
  onOpenAuth,
  onPlayNow,
  wishlistCount,
  currentUser,
  onSignOut,
  onOpenAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Games', href: '#games' },
    { label: 'Categories', href: '#categories' },
    { label: 'Leaderboard', href: '#leaderboard' },
    { label: 'Tournaments', href: '#tournaments' },
    { label: 'Community', href: '#community' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    soundFx.playClick();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.playSuccess();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#060913]/90 backdrop-blur-md border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.7)] py-3'
          : 'bg-gradient-to-b from-[#060913]/80 to-transparent backdrop-blur-[2px] py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left: PLAY ARENA Logo */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, '#home')}
            onMouseEnter={() => soundFx.playHover()}
            className="group flex items-center gap-3 select-none"
          >
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-[1.5px] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]">
              <div className="w-full h-full bg-[#080C1A] rounded-[7px] flex items-center justify-center">
                {/* Cyber Arena Glyphs */}
                <div className="relative flex items-center justify-center">
                  <Shield className="w-5 h-5 text-cyan-400 transition-colors group-hover:text-cyan-300" />
                  <span className="absolute w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider font-gaming text-white group-hover:text-cyan-300 transition-colors drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                PLAY ARENA
              </span>
              <span className="text-[8.5px] font-mono tracking-widest text-cyan-400 uppercase font-bold flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
                PLAY BEYOND THE LIMITS
              </span>
            </div>
          </a>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                onMouseEnter={() => soundFx.playHover()}
                className="relative text-sm font-medium text-slate-300 hover:text-white transition-colors py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 group-hover:w-full rounded-full" />
              </a>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Audio Feedback Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              onMouseEnter={() => soundFx.playHover()}
              title={isMuted ? 'Unmute cyber audio' : 'Mute cyber audio'}
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Search Icon */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenSearch();
              }}
              onMouseEnter={() => soundFx.playHover()}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
              title="Search games, tournaments, players"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Icon */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenWishlist();
              }}
              onMouseEnter={() => soundFx.playHover()}
              className="relative p-2 rounded-lg text-slate-300 hover:text-pink-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center font-tabular shadow-[0_0_8px_#FF007F]">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Authentication / User Session Controls */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      if (onOpenAdmin) onOpenAdmin();
                      else window.location.assign('/admin');
                    }}
                    onMouseEnter={() => soundFx.playHover()}
                    className="px-3 py-1.5 text-xs font-bold font-gaming uppercase tracking-wider text-purple-200 bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/50 rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                    title="Open Secure Admin Control Room"
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>ADMIN</span>
                  </button>
                )}

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-gaming">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-white font-bold max-w-[120px] truncate" title={currentUser.email}>
                    {currentUser.gamerTag}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    if (onSignOut) onSignOut();
                  }}
                  onMouseEnter={() => soundFx.playHover()}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/30 transition-colors"
                  title="Sign out of Play Arena"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenAuth();
                }}
                onMouseEnter={() => soundFx.playHover()}
                className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white rounded-lg hover:bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all font-gaming"
              >
                Log In
              </button>
            )}

            {/* PLAY NOW CTA */}
            <button
              type="button"
              data-cursor="action"
              onClick={() => {
                soundFx.playClick();
                onPlayNow();
              }}
              onMouseEnter={() => soundFx.playHover()}
              className="relative group overflow-hidden px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider text-black font-gaming transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 transition-all group-hover:from-cyan-300 group-hover:to-pink-500" />
              <div className="absolute inset-0 shadow-[0_0_20px_rgba(0,240,255,0.6)] group-hover:shadow-[0_0_25px_rgba(255,0,127,0.8)]" />
              <span className="relative flex items-center gap-1.5 text-slate-950 font-extrabold">
                <Play className="w-3.5 h-3.5 fill-current" />
                PLAY NOW
              </span>
            </button>
          </div>

          {/* Mobile Hamburger & Actions */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 text-slate-300 hover:text-white"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onOpenWishlist}
              className="relative p-2 text-slate-300 hover:text-pink-400"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute 1 top-0 right-0 w-3.5 h-3.5 bg-pink-500 rounded-full text-[9px] text-white flex items-center justify-center font-tabular">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#070B18]/95 border-b border-white/10 backdrop-blur-xl px-4 pt-3 pb-6 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-base font-medium text-slate-200 hover:text-cyan-400 py-2 border-b border-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-3 flex flex-col gap-2.5">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-xs font-gaming">
                    <span className="text-white font-bold">{currentUser.gamerTag}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] uppercase">
                      {currentUser.role}
                    </span>
                  </div>

                  {currentUser.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onOpenAdmin) onOpenAdmin();
                        else window.location.assign('/admin');
                      }}
                      className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider text-purple-200 bg-purple-950/60 border border-purple-500/40 rounded-lg font-gaming flex items-center justify-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-purple-400" />
                      ADMIN CONTROL ROOM
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onSignOut) onSignOut();
                    }}
                    className="w-full py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-rose-300 border border-rose-500/30 rounded-lg hover:bg-rose-500/10 font-gaming flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    SIGN OUT
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-300 border border-white/10 rounded-lg hover:bg-white/5 font-gaming"
                >
                  Log In
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onPlayNow();
                }}
                className="w-full py-3 text-center text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-cyan-400 to-pink-500 rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.5)] font-gaming flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                PLAY NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
