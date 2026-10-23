import React, { useState, useMemo } from 'react';
import { Search, X, Play, Trophy, Users, ArrowRight } from 'lucide-react';
import { FEATURED_GAMES, UPCOMING_TOURNAMENTS, GAME_CATEGORIES } from '../data/gamingData';
import { Game } from '../types/gaming';
import { soundFx } from '../utils/soundEffects';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (game: Game) => void;
  games?: Game[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectGame,
  games = FEATURED_GAMES,
}) => {
  const [query, setQuery] = useState('');

  const filteredGames = useMemo(() => {
    const list = games && games.length > 0 ? games : FEATURED_GAMES;
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (g) => g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q)
    );
  }, [query, games]);

  const filteredTournaments = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return UPCOMING_TOURNAMENTS.filter(
      (t) => t.title.toLowerCase().includes(q) || t.game.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-[#090D1E] border border-cyan-400/40 shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden">
        {/* Search Input Bar */}
        <div className="relative p-4 border-b border-white/10 flex items-center">
          <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games, genres, tournaments, or players..."
            className="w-full bg-transparent text-white text-base focus:outline-none placeholder:text-slate-500 font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-white rounded border border-white/10"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {/* Games Category */}
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-2 px-2">
              GAMES ({filteredGames.length})
            </div>
            {filteredGames.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No games matched "{query}"</div>
            ) : (
              <div className="space-y-1">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => {
                      soundFx.playClick();
                      onSelectGame(game);
                      onClose();
                    }}
                    onMouseEnter={() => soundFx.playHover()}
                    className="p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold font-gaming text-white text-sm group-hover:text-cyan-300 transition-colors">
                        {game.title}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {game.genre} · ★ {game.rating} · {game.playerCount} active
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-cyan-400 text-slate-950 text-xs font-bold font-gaming flex items-center gap-1.5 opacity-90 group-hover:opacity-100"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      PLAY
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tournaments if matching */}
          {filteredTournaments.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-2 px-2">
                TOURNAMENTS ({filteredTournaments.length})
              </div>
              <div className="space-y-1">
                {filteredTournaments.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold font-gaming text-white text-sm">{t.title}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        {t.game} · Pool: {t.prizePool} · {t.status}
                      </div>
                    </div>
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
