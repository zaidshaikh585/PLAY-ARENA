import React, { useState } from 'react';
import { MessageSquareWarning, X, Send, LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { soundFx } from '../utils/soundEffects';

export const FeedbackWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('Website problem');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (!supabaseConfigured || !supabase) {
      setNotice({
        type: 'error',
        text: 'Database is not connected yet. Once you add your Supabase credentials in .env.local, reports will save automatically.',
      });
      return;
    }

    setBusy(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('reports').insert({
        user_id: user?.id || null,
        name: name.trim() || null,
        email: email.trim() || user?.email || null,
        category,
        message: message.trim(),
        status: 'open',
      });

      if (error) throw error;

      soundFx.playSuccess();
      setNotice({
        type: 'success',
        text: 'Thank you! Your feedback report has been transmitted to the Play Arena admin room.',
      });
      setMessage('');
    } catch (err) {
      setNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not submit report.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button — stacked safely above BackToHomeButton */}
      <button
        type="button"
        data-cursor="action"
        onClick={() => {
          soundFx.playClick();
          setOpen(true);
        }}
        onMouseEnter={() => soundFx.playHover()}
        className="fixed bottom-20 left-6 z-40 rounded-xl px-3.5 py-2.5 bg-[#090D1E]/95 hover:bg-[#0C132B] border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] font-gaming text-xs font-bold uppercase tracking-wider flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105"
        title="Report a problem or submit feedback"
      >
        <MessageSquareWarning className="w-4 h-4 text-cyan-400" />
        <span className="hidden sm:inline">REPORT / FEEDBACK</span>
      </button>

      {/* Report Modal */}
      {open && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-cyan-400/40 bg-[#080C1B] p-6 sm:p-8 space-y-4 shadow-[0_0_50px_rgba(0,240,255,0.25)] relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-black font-gaming text-white uppercase tracking-wider">
                  REPORT AN ISSUE / FEEDBACK
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Help us maintain peak arena performance. Report broken links, login bugs, or suggest features for upcoming seasons.
            </p>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-black/60 border border-white/15 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                <option>Website problem</option>
                <option>Feedback / suggestion</option>
                <option>Game launch issue</option>
                <option>Login / account issue</option>
                <option>Tournament issue</option>
                <option>Security concern</option>
                <option>Other</option>
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Gamer tag or name"
                  className="w-full rounded-xl bg-black/60 border border-white/15 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For admin replies"
                  className="w-full rounded-xl bg-black/60 border border-white/15 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                Detailed Message
              </label>
              <textarea
                required
                minLength={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or suggestions in detail..."
                rows={4}
                className="w-full rounded-xl bg-black/60 border border-white/15 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {notice && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  notice.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                {notice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{notice.text}</span>
              </div>
            )}

            <button
              disabled={busy}
              type="submit"
              data-cursor="action"
              className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-slate-950 p-3 font-gaming font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-60 transition-all"
            >
              {busy ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{busy ? 'SUBMITTING REPORT...' : 'SUBMIT REPORT TO ADMIN'}</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
};
