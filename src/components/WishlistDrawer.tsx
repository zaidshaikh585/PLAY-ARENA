import React from 'react';
import { X, Heart, Play, Trash2, ArrowRight } from 'lucide-react';
import { Game } from '../types/gaming';
import { soundFx } from '../utils/soundEffects';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistGames: Game[];
  onRemoveFromWishlist: (gameId: string) => void;
  onPlayGame: (game: Game) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistGames,
  onRemoveFromWishlist,
  onPlayGame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#080C1B] border-l border-white/10 p-6 flex flex-col justify-between shadow-[-10px_0_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500 fill-current" />
              <h3 className="font-gaming font-black text-lg text-white uppercase tracking-wider">
                SAVED ARMORY ({wishlistGames.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Wishlisted Games */}
          <div className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {wishlistGames.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Heart className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-slate-400 text-sm font-medium">Your wishlist is empty.</p>
                <p className="text-slate-500 text-xs">
                  Click the heart icon on any game card to bookmark titles for fast launch.
                </p>
              </div>
            ) : (
              wishlistGames.map((game) => (
                <div
                  key={game.id}
                  className="p-4 rounded-xl bg-[#050814] border border-white/10 hover:border-cyan-400/50 transition-colors flex items-center justify-between gap-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                      {game.genre}
                    </span>
                    <h4 className="font-gaming font-bold text-white text-base truncate group-hover:text-cyan-300 transition-colors">
                      {game.title}
                    </h4>
                    <span className="text-xs font-mono text-slate-400 block mt-0.5">
                      ★ {game.rating} · {game.playerCount} active
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        onPlayGame(game);
                        onClose();
                      }}
                      className="p-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold shadow-[0_0_10px_#00F0FF] transition-transform hover:scale-105"
                      title="Launch game"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        onRemoveFromWishlist(game.id);
                      }}
                      className="p-2.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-gaming text-xs font-bold uppercase tracking-wider transition-colors border border-white/10"
          >
            RETURN TO ARENA
          </button>
        </div>
      </div>
    </div>
  );
};
