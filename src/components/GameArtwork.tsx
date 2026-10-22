import React, { useState } from 'react';

export interface GameArtworkProps {
  type?: string;
  imageUrl?: string;
  alt?: string;
  className?: string;
  glowColor?: string;
  showOfficialBadge?: boolean;
  officialSource?: string;
}

const renderSvgVector = (type: string = 'fps', className: string = 'w-full h-full', glowColor: string = '#00F0FF') => {
  switch (type) {
    case 'fps':
    case 'cyber_strike':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-[#0c1322] via-[#080d19] to-[#04060b] flex items-center justify-center ${className}`}>
          {/* Cyber grid & rain lines */}
          <div className="absolute inset-0 bg-cyber-grid opacity-30" />
          <svg className="w-full h-full object-cover" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cyberSky" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B132B" />
                <stop offset="50%" stopColor="#1C2541" />
                <stop offset="100%" stopColor="#080811" />
              </linearGradient>
              <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00F0FF" />
                <stop offset="100%" stopColor="#0072FF" />
              </linearGradient>
              <linearGradient id="neonPink" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF007A" />
                <stop offset="100%" stopColor="#7928CA" />
              </linearGradient>
              <radialGradient id="muzzleFlash" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="600" height="400" fill="url(#cyberSky)" />
            {/* City skyline silhouettes */}
            <path d="M40 400V210H90V240H140V160H210V280H280V120H360V220H420V150H480V270H550V400H40Z" fill="#0D1629" opacity="0.8" />
            <path d="M80 400V250H130V270H180V190H260V310H330V180H400V250H470V190H520V400H80Z" fill="#141E33" opacity="0.6" />
            
            {/* Neon holographic billboards */}
            <rect x="220" y="140" width="45" height="15" fill="#00F0FF" opacity="0.4" />
            <rect x="375" y="190" width="30" height="50" fill="#FF007A" opacity="0.3" />

            {/* Tactical Operative Silhouette */}
            <g transform="translate(180, 70)">
              {/* Helmet Visor Glow */}
              <ellipse cx="120" cy="85" rx="26" ry="12" fill="url(#neonCyan)" filter="drop-shadow(0 0 12px #00F0FF)" />
              {/* Tactical Helmet */}
              <path d="M85 85C85 45 110 30 145 35C170 38 180 55 175 90C165 95 150 98 120 98C95 98 85 92 85 85Z" fill="#1E293B" />
              <path d="M100 78L145 74L150 88L98 90Z" fill="#00F0FF" opacity="0.9" />
              {/* Armored Shoulders and Torso */}
              <path d="M50 180L75 115L110 110L145 110L180 115L205 180L130 220Z" fill="#0F172A" stroke="#334155" strokeWidth="2" />
              {/* High-tech tactical plates */}
              <path d="M90 125H160L150 170H100L90 125Z" fill="#1E293B" stroke="#00F0FF" strokeWidth="1.5" />
              {/* Plasma rifle barrel */}
              <path d="M140 140L280 120L280 145L220 155L170 170Z" fill="#090D16" stroke="#00F0FF" strokeWidth="1" />
              <line x1="200" y1="132" x2="275" y2="122" stroke="#00F0FF" strokeWidth="3" />
              <circle cx="282" cy="120" r="14" fill="url(#muzzleFlash)" />
            </g>

            {/* Crosshairs HUD overlay */}
            <circle cx="462" cy="190" r="28" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.7" />
            <circle cx="462" cy="190" r="4" fill="#00F0FF" />
            <line x1="434" y1="190" x2="490" y2="190" stroke="#00F0FF" strokeWidth="1" opacity="0.5" />
            <line x1="462" y1="162" x2="462" y2="218" stroke="#00F0FF" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>
      );

    case 'tactical':
    case 'shadow_protocol':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-[#0c0d18] via-[#090b14] to-[#04050a] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-cyber-grid opacity-25" />
          <svg className="w-full h-full object-cover" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="ghostGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#9D00FF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#9D00FF" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="600" height="400" fill="#070913" />
            <circle cx="300" cy="180" r="160" fill="url(#ghostGlow)" />
            
            {/* Hexagonal Stealth Grid */}
            <g stroke="#9D00FF" strokeWidth="1" opacity="0.25">
              <polygon points="300,80 340,105 340,150 300,175 260,150 260,105" />
              <polygon points="380,80 420,105 420,150 380,175 340,150 340,105" />
              <polygon points="220,80 260,105 260,150 220,175 180,150 180,105" />
              <polygon points="340,150 380,175 380,220 340,245 300,220 300,175" />
              <polygon points="260,150 300,175 300,220 260,245 220,220 220,175" />
            </g>

            {/* Infiltration operative with night vision tri-ocular */}
            <g transform="translate(190, 80)">
              {/* Silhouette */}
              <path d="M110 50C70 50 60 90 60 140C60 210 30 260 20 290H220C210 260 180 210 180 140C180 90 150 50 110 50Z" fill="#11162B" />
              {/* Night vision tri-optics */}
              <circle cx="95" cy="100" r="8" fill="#10B981" filter="drop-shadow(0 0 8px #10B981)" />
              <circle cx="125" cy="100" r="8" fill="#10B981" filter="drop-shadow(0 0 8px #10B981)" />
              <circle cx="110" cy="82" r="8" fill="#10B981" filter="drop-shadow(0 0 8px #10B981)" />
              <line x1="95" y1="100" x2="125" y2="100" stroke="#059669" strokeWidth="2" />
              <line x1="110" y1="82" x2="110" y2="100" stroke="#059669" strokeWidth="2" />
              {/* Cybernetic balaclava lines */}
              <path d="M85 130L110 145L135 130" stroke="#9D00FF" strokeWidth="2" fill="none" opacity="0.8" />
            </g>

            {/* Tactical telemetry text */}
            <text x="50" y="70" fill="#9D00FF" fontSize="12" fontFamily="monospace" letterSpacing="2">TACTICAL // SATELLITE UPLINK ACTIVE</text>
            <text x="50" y="90" fill="#64748B" fontSize="11" fontFamily="monospace">STEALTH COEFF: 99.4%</text>
          </svg>
        </div>
      );

    case 'racing':
    case 'neon_drift':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-[#120822] via-[#0b0416] to-[#05020c] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-cyber-grid opacity-20" />
          <svg className="w-full h-full object-cover" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="speedRoad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#FF007A" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#00F0FF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#05020c" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="600" height="400" fill="#080312" />
            
            {/* Vanishing point speed highway */}
            <polygon points="300,120 40,400 560,400" fill="url(#speedRoad)" />
            <line x1="300" y1="120" x2="300" y2="400" stroke="#00F0FF" strokeWidth="3" strokeDasharray="25 15" opacity="0.8" />
            <line x1="300" y1="120" x2="180" y2="400" stroke="#FF007A" strokeWidth="2" opacity="0.6" />
            <line x1="300" y1="120" x2="420" y2="400" stroke="#FF007A" strokeWidth="2" opacity="0.6" />

            {/* Cyber Hypercar rear */}
            <g transform="translate(180, 160)">
              {/* Neon underglow */}
              <ellipse cx="120" cy="140" rx="140" ry="25" fill="#00F0FF" opacity="0.4" filter="drop-shadow(0 0 20px #00F0FF)" />
              {/* Car aerodynamic body */}
              <path d="M40 120L60 80L90 60L150 60L180 80L200 120L180 135H60L40 120Z" fill="#131B30" stroke="#00F0FF" strokeWidth="2" />
              {/* Rear carbon wing */}
              <path d="M20 75L220 75L210 65L30 65Z" fill="#0A0F1D" stroke="#FF007A" strokeWidth="2" />
              {/* High-tech tail lights strip */}
              <path d="M50 95H190" stroke="#FF007A" strokeWidth="8" strokeLinecap="round" filter="drop-shadow(0 0 10px #FF007A)" />
              <path d="M85 95H155" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
              {/* Twin plasma exhaust turbines */}
              <circle cx="85" cy="122" r="14" fill="#00F0FF" filter="drop-shadow(0 0 12px #00F0FF)" />
              <circle cx="155" cy="122" r="14" fill="#00F0FF" filter="drop-shadow(0 0 12px #00F0FF)" />
              <circle cx="85" cy="122" r="6" fill="#FFFFFF" />
              <circle cx="155" cy="122" r="6" fill="#FFFFFF" />
            </g>

            {/* Speed trails */}
            <line x1="30" y1="260" x2="160" y2="260" stroke="#00F0FF" strokeWidth="2" opacity="0.7" />
            <line x1="440" y1="260" x2="570" y2="260" stroke="#FF007A" strokeWidth="2" opacity="0.7" />
            <line x1="10" y1="310" x2="120" y2="310" stroke="#00F0FF" strokeWidth="3" opacity="0.9" />
            <line x1="480" y1="310" x2="590" y2="310" stroke="#FF007A" strokeWidth="3" opacity="0.9" />
          </svg>
        </div>
      );

    case 'rpg':
    case 'realm_of_legends':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-[#120a1f] via-[#0d0717] to-[#05030a] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-cyber-grid opacity-20" />
          <svg className="w-full h-full object-cover" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="magicSword" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="600" height="400" fill="#0A0614" />
            {/* Celestial Rune Portal */}
            <circle cx="300" cy="180" r="130" fill="url(#portalGlow)" />
            <circle cx="300" cy="180" r="110" stroke="#A855F7" strokeWidth="2" strokeDasharray="8 6" opacity="0.8" />
            <circle cx="300" cy="180" r="90" stroke="#38BDF8" strokeWidth="1.5" opacity="0.6" />

            {/* Dragon Wings Silhouette in background */}
            <path d="M140 180C190 120 230 140 280 160C220 180 180 240 140 180Z" fill="#2E1065" opacity="0.7" />
            <path d="M460 180C410 120 370 140 320 160C380 180 420 240 460 180Z" fill="#2E1065" opacity="0.7" />

            {/* Glowing Excalibur Runic Blade */}
            <g transform="translate(285, 40)">
              {/* Blade */}
              <polygon points="15,20 12,220 15,240 18,220" fill="url(#magicSword)" filter="drop-shadow(0 0 16px #38BDF8)" />
              <line x1="15" y1="25" x2="15" y2="235" stroke="#FFFFFF" strokeWidth="2" />
              {/* Crossguard */}
              <rect x="-20" y="235" width="70" height="10" rx="3" fill="#D97706" stroke="#FDE68A" strokeWidth="1" />
              {/* Pommel */}
              <circle cx="15" cy="275" r="8" fill="#F59E0B" />
              <rect x="12" y="245" width="6" height="24" fill="#78350F" />
            </g>

            {/* Floating runic particles */}
            <circle cx="210" cy="140" r="4" fill="#38BDF8" opacity="0.8" />
            <circle cx="390" cy="130" r="3" fill="#EC4899" opacity="0.9" />
            <circle cx="250" cy="240" r="5" fill="#A855F7" opacity="0.7" />
            <circle cx="360" cy="230" r="4" fill="#38BDF8" opacity="0.8" />
          </svg>
        </div>
      );

    case 'battleroyale':
    case 'apex_warriors':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-[#1a0f0a] via-[#120804] to-[#080302] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-cyber-grid opacity-20" />
          <svg className="w-full h-full object-cover" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="fireOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            <rect width="600" height="400" fill="#0D0604" />
            {/* Ring of Fire Shrinking Zone */}
            <circle cx="300" cy="200" r="150" stroke="#F97316" strokeWidth="3" strokeDasharray="16 8" opacity="0.6" filter="drop-shadow(0 0 20px #EA580C)" />
            <circle cx="300" cy="200" r="100" stroke="#EF4444" strokeWidth="2" opacity="0.4" />

            {/* Aerial Drop Pods Streaking Down */}
            <line x1="180" y1="40" x2="230" y2="140" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
            <line x1="280" y1="20" x2="310" y2="120" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
            <line x1="390" y1="50" x2="420" y2="150" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
            
            {/* Loot Crate Beacon */}
            <g transform="translate(260, 180)">
              <rect x="20" y="50" width="40" height="40" rx="4" fill="#7C2D12" stroke="#F97316" strokeWidth="2" />
              {/* Light beam to heaven */}
              <polygon points="40,50 35,-150 45,-150" fill="#FBBF24" opacity="0.5" filter="drop-shadow(0 0 15px #F59E0B)" />
              <line x1="40" y1="50" x2="40" y2="-150" stroke="#FFFFFF" strokeWidth="2" />
            </g>

            {/* Survival status */}
            <text x="60" y="350" fill="#F97316" fontSize="13" fontFamily="monospace" letterSpacing="2">SURVIVORS: 12 / 100</text>
            <text x="420" y="350" fill="#EF4444" fontSize="13" fontFamily="monospace" letterSpacing="2">ZONE COLLAPSING</text>
          </svg>
        </div>
      );

    case 'scifi':
    case 'dark_horizon':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-[#07131e] via-[#050c14] to-[#020508] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-cyber-grid opacity-25" />
          <svg className="w-full h-full object-cover" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nebulaCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <rect width="600" height="400" fill="#04090E" />
            
            {/* Distant alien ring planet */}
            <circle cx="450" cy="110" r="50" fill="#0E7490" />
            <ellipse cx="450" cy="110" rx="80" ry="14" stroke="#22D3EE" strokeWidth="2" opacity="0.8" />
            
            {/* Mysterious Monolith */}
            <polygon points="270,90 330,90 340,310 260,310" fill="#0F172A" stroke="#00F0FF" strokeWidth="2" filter="drop-shadow(0 0 15px #00F0FF)" />
            <line x1="300" y1="100" x2="300" y2="300" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="10 5" opacity="0.8" />
            
            {/* Deep Space Explorer */}
            <g transform="translate(140, 240)">
              <ellipse cx="30" cy="20" rx="12" ry="10" fill="#E2E8F0" />
              <path d="M15 30H45L40 65H20L15 30Z" fill="#334155" />
              <line x1="28" y1="18" x2="36" y2="18" stroke="#00F0FF" strokeWidth="3" />
            </g>

            {/* Stars */}
            <circle cx="80" cy="60" r="1.5" fill="#FFFFFF" opacity="0.8" />
            <circle cx="190" cy="90" r="2" fill="#22D3EE" opacity="0.9" />
            <circle cx="340" cy="40" r="1.5" fill="#FFFFFF" opacity="0.7" />
            <circle cx="520" cy="220" r="2" fill="#FFFFFF" opacity="0.8" />
          </svg>
        </div>
      );
    default:
      return (
        <div className={`relative overflow-hidden bg-slate-900 flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-cyber-grid opacity-30" />
          <div className="text-cyan-400 font-mono text-xs uppercase tracking-wider">PLAY ARENA ARCHIVE</div>
        </div>
      );
  }
};

export const GameArtwork: React.FC<GameArtworkProps> = ({
  type = 'fps',
  imageUrl,
  alt = 'Official Game Artwork',
  className = 'w-full h-full',
  glowColor = '#00F0FF',
  showOfficialBadge = false,
  officialSource,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If imageUrl is provided and hasn't errored out, render the official game image
  if (imageUrl && !imageError) {
    return (
      <div className={`relative overflow-hidden bg-slate-950 ${className}`}>
        {/* Placeholder shimmer during loading */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-slate-900/80 animate-pulse flex items-center justify-center z-0">
            <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          </div>
        )}

        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />

        {/* Ambient subtle cyber vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060812]/80 via-transparent to-black/20 pointer-events-none" />

        {/* Official Game Badge indicator */}
        {showOfficialBadge && (
          <div className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-cyan-400/40 text-[9px] font-mono text-cyan-300 font-bold tracking-wider">
            OFFICIAL ART {officialSource ? `· ${officialSource}` : ''}
          </div>
        )}
      </div>
    );
  }

  // Graceful fallback to custom high-tech SVG vector artwork
  return renderSvgVector(type, className, glowColor);
};
