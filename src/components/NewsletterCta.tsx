import React, { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck, Sparkles, Send, LoaderCircle } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { supabase, supabaseConfigured } from '../lib/supabase';

export const NewsletterCta: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid email address');
      return;
    }
    setError('');
    setBusy(true);

    try {
      if (supabaseConfigured && supabase) {
        await supabase
          .from('newsletter_subscribers')
          .insert({ email: email.trim().toLowerCase() });
      }
      setIsSubmitted(true);
      soundFx.playSuccess();
    } catch (err) {
      // If already subscribed or network error, still show friendly success
      setIsSubmitted(true);
      soundFx.playSuccess();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="relative py-28 bg-[#04060C] overflow-hidden border-t border-white/5">
      {/* Dynamic Animated Neon Plasma Glow Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-cyan-500/20 via-purple-600/20 to-pink-500/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute inset-0 bg-cyber-grid opacity-20" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Glow Frame Wrapper */}
        <div className="relative rounded-3xl bg-[#080C1D]/80 border border-cyan-400/40 p-8 sm:p-14 backdrop-blur-xl shadow-[0_0_60px_rgba(0,240,255,0.15)]">
          {/* Telemetry Kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-bold font-gaming tracking-wider uppercase mb-5 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>TERMINAL ACCESS // VIP ENLISTMENT</span>
          </div>

          {/* Title with Laser Speed Wing Slashes and Cyber Glow */}
          <div className="flex items-center justify-center gap-3 max-w-4xl mx-auto">
            <span className="hidden sm:inline-block h-[2px] w-10 bg-gradient-to-r from-transparent to-cyan-400" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-gaming text-white uppercase tracking-tight leading-tight drop-shadow-[0_4px_30px_rgba(0,240,255,0.3)]">
              READY TO PLAY BEYOND THE LIMITS?
            </h2>
            <span className="hidden sm:inline-block h-[2px] w-10 bg-gradient-to-l from-transparent to-pink-500" />
          </div>
          <div className="h-[2px] w-24 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mx-auto mt-3 rounded-full shadow-[0_0_10px_#00F0FF]" />

          {/* Supporting Text */}
          <p className="text-slate-300 text-base sm:text-lg mt-4 max-w-xl mx-auto">
            Join thousands of gamers and enter the next level of gaming.
          </p>

          {/* Input Form or Success State */}
          <div className="mt-8 max-w-md mx-auto">
            {isSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-400/50 text-center animate-in fade-in zoom-in-95">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-lg font-bold font-gaming text-white uppercase">
                  WELCOME TO PLAY ARENA
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Access pass dispatched to <span className="text-emerald-300 font-mono">{email}</span>. Prepare for combat.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 text-xs font-gaming text-slate-400 hover:text-white underline underline-offset-4"
                >
                  Register another account
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter your email"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-sm placeholder:text-slate-500 transition-colors"
                      required
                    />
                  </div>

                  <button
                    disabled={busy}
                    type="submit"
                    data-cursor="action"
                    onMouseEnter={() => soundFx.playHover()}
                    className="px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-pink-500 hover:from-cyan-300 hover:to-pink-400 transition-all font-gaming shadow-[0_0_20px_rgba(0,240,255,0.4)] whitespace-nowrap hover:scale-105 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {busy && <LoaderCircle className="w-3.5 h-3.5 animate-spin" />}
                    <span>{busy ? 'ENLISTING...' : 'JOIN PLAY ARENA'}</span>
                  </button>
                </div>

                {error && <p className="text-xs text-rose-400 font-mono text-left">{error}</p>}

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Instant access to closed qualifiers and game test servers.</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
