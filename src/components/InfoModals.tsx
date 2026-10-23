import React from 'react';
import { X, Calendar, User, Newspaper, Crown, Trophy, ExternalLink, Shield } from 'lucide-react';
import { NewsArticle, PlayerRank } from '../types/gaming';
import { soundFx } from '../utils/soundEffects';

interface ArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-[#080C1B] border border-cyan-400/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,240,255,0.25)] relative max-h-[85vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-3">
          <span className="font-bold">{article.category}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">{article.date}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">{article.readTime}</span>
        </div>

        <h3 className="font-gaming font-black text-2xl sm:text-3xl text-white uppercase leading-snug">
          {article.title}
        </h3>

        <div className="my-4 pb-4 border-b border-white/10 text-xs font-mono text-slate-400 flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span>Reported by {article.author}</span>
        </div>

        <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
          <p>{article.description}</p>
          <p>
            During today's developer telemetry round, the competitive operations committee announced refined server sub-tick synchronization alongside community-requested anti-cheat telemetry updates. Squads participating in open qualifiers will automatically benefit from improved photon ray-tracing pipeline optimizations.
          </p>
          <p>
            Further updates and localized server cluster telemetry reports will be delivered directly through the Play Arena mobile terminal and official Discord scrim rooms.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-gaming text-xs font-black uppercase"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};

interface PlayerModalProps {
  player: PlayerRank | null;
  onClose: () => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({ player, onClose }) => {
  if (!player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#080C1B] border border-cyan-400/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,240,255,0.25)] relative text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-bold text-xl text-slate-950 font-gaming mb-4 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          style={{ backgroundColor: player.avatarColor }}
        >
          {player.handle.slice(0, 2).toUpperCase()}
        </div>

        <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
          RANK #{player.rank < 10 ? `0${player.rank}` : player.rank} · {player.badge}
        </div>

        <h3 className="font-gaming font-black text-2xl text-white uppercase mt-1">
          {player.handle}
        </h3>
        <p className="text-slate-400 text-xs font-mono">{player.realName || 'Registered Member'}</p>

        <div className="my-6 p-4 rounded-xl bg-[#050814] border border-white/10 grid grid-cols-2 gap-4 text-xs font-mono text-left">
          <div>
            <span className="text-slate-500 block">PRIMARY GAME</span>
            <span className="font-bold text-slate-200">{player.primaryGame || 'Play Arena'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">LEVEL</span>
            <span className="font-bold text-cyan-300 font-tabular">
              {player.level !== null && player.level !== undefined ? `Level ${player.level}` : 'Unranked'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">TOTAL WINS</span>
            <span className="font-bold text-emerald-400 font-tabular">
              {player.wins !== null && player.wins !== undefined ? player.wins.toLocaleString() : 'No matches'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">WIN RATE</span>
            <span className="font-bold text-amber-400 font-tabular">{player.winRate || '—'}</span>
          </div>
          <div className="col-span-2 pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-slate-500">XP EARNED</span>
            <span className="font-bold text-cyan-300 font-tabular">{player.xp || '—'}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-gaming text-xs font-black uppercase"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

interface SupportModalProps {
  topic: string | null;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ topic, onClose }) => {
  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#080C1B] border border-cyan-400/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,240,255,0.25)] relative text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <Shield className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
        <h3 className="font-gaming font-black text-xl text-white uppercase tracking-wider">
          {topic}
        </h3>
        <p className="text-slate-300 text-xs mt-3 leading-relaxed">
          You are connecting to the Play Arena official portal for <strong className="text-cyan-300">{topic}</strong>. Encrypted protocols and community safety guidelines apply.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-gaming text-xs font-black uppercase"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};
