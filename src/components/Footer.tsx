import React from 'react';
import { Shield, Disc as Discord, Youtube, Instagram, Twitter, Tv, ArrowUp, Home } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface FooterProps {
  onOpenSection: (sectionId: string) => void;
  onOpenSupportModal: (topic: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSection, onOpenSupportModal }) => {
  const navItems = [
    { label: 'Home', id: '#home' },
    { label: 'Games', id: '#games' },
    { label: 'Tournaments', id: '#tournaments' },
    { label: 'Leaderboard', id: '#leaderboard' },
    { label: 'Community', id: '#community' },
    { label: 'News', id: '#news' },
    { label: 'About', id: '#home' },
  ];

  const supportItems = [
    'Help Center',
    'Contact',
    'Privacy Policy',
    'Terms & Conditions',
  ];

  const socialLinks = [
    { name: 'Discord', icon: <Discord className="w-4 h-4" /> },
    { name: 'YouTube', icon: <Youtube className="w-4 h-4" /> },
    { name: 'Instagram', icon: <Instagram className="w-4 h-4" /> },
    { name: 'X', icon: <Twitter className="w-4 h-4" /> },
    { name: 'Twitch', icon: <Tv className="w-4 h-4" /> },
  ];

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    soundFx.playClick();
    onOpenSection(id);
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#030408] border-t border-white/10 pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 p-[1.5px]">
                <div className="w-full h-full bg-[#080C1A] rounded-[7px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="text-2xl font-black font-gaming tracking-wider text-white">
                PLAY ARENA
              </span>
            </div>

            <p className="text-sm font-gaming text-cyan-400 tracking-widest font-semibold uppercase">
              PLAY BEYOND THE LIMITS
            </p>

            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              The premier competitive esports arena and instant digital gaming hub designed for world-class players and squads.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              {socialLinks.map((social) => (
                <button
                  key={social.name}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onOpenSupportModal(`${social.name} Community`);
                  }}
                  onMouseEnter={() => soundFx.playHover()}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/60 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-300 transition-all flex items-center justify-center"
                  aria-label={social.name}
                  title={social.name}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold font-gaming tracking-widest text-slate-300 uppercase mb-4">
              NAVIGATION
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.id}
                    onClick={(e) => handleNavClick(e, item.id)}
                    onMouseEnter={() => soundFx.playHover()}
                    className="hover:text-cyan-300 transition-colors inline-block"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-xs font-bold font-gaming tracking-widest text-slate-300 uppercase mb-4">
              SUPPORT
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {supportItems.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      onOpenSupportModal(item);
                    }}
                    onMouseEnter={() => soundFx.playHover()}
                    className="hover:text-cyan-300 transition-colors text-left"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Network Status / Server Status */}
          <div>
            <h4 className="text-xs font-bold font-gaming tracking-widest text-slate-300 uppercase mb-4">
              ARENA STATUS
            </h4>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>US-EAST NODE</span>
                <span className="text-emerald-400 font-bold">12ms · ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>EU-CENTRAL NODE</span>
                <span className="text-emerald-400 font-bold">18ms · ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>APAC-TOKYO NODE</span>
                <span className="text-emerald-400 font-bold">24ms · ONLINE</span>
              </div>
              <div className="pt-2 border-t border-white/5 text-[11px] text-slate-500">
                All cloud systems operational.
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Back to Home Action */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
          <p>© 2026 PLAY ARENA. ALL RIGHTS RESERVED.</p>
          
          {/* Back to Home Page Button in Footer */}
          <button
            type="button"
            onClick={(e) => handleNavClick(e, '#home')}
            onMouseEnter={() => soundFx.playHover()}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all font-gaming text-xs font-bold uppercase tracking-wider"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400" />
            <span>BACK TO HOME PAGE</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <p>BUILT FOR COMPETITIVE ESPORTS & NEXT-GEN GAMING.</p>
        </div>
      </div>
    </footer>
  );
};
