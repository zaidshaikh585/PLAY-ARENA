import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, User, Mail, ArrowRight, LoaderCircle, KeyRound, CheckCircle2, AlertCircle, RotateCw } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { supabase, supabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (gamerTag: string, role?: 'user' | 'admin') => void;
  initialMode?: 'signin' | 'signup' | 'forgot' | 'update-password';
  initialErrorMessage?: string;
}

/** Maximum time (ms) an auth request can take before timing out (30 seconds safeguard for slow network/email dispatch) */
const AUTH_TIMEOUT_MS = 30_000;

/**
 * Diagnostic logger: Logs operation names, elapsed times, HTTP status, and safe error codes.
 * Strictly adheres to security rules: never logs passwords, tokens, full keys, or personal credentials.
 */
function logAuthDiagnostic(
  phase: 'START' | 'FINISH' | 'ERROR',
  operation: string,
  details: {
    elapsedMs?: number;
    status?: number | string;
    errorCode?: string | null;
    errorName?: string | null;
    safeMessage?: string | null;
    hasSession?: boolean;
    hasUser?: boolean;
    identitiesCount?: number;
    emailDomain?: string;
  }
) {
  const prefix = `[PlayArena Auth:${phase}] [${operation}]`;
  if (phase === 'START') {
    console.log(prefix, {
      timestamp: new Date().toISOString(),
      emailDomain: details.emailDomain || 'unknown',
    });
  } else if (phase === 'FINISH') {
    console.log(prefix, {
      elapsedMs: details.elapsedMs,
      status: details.status ?? 200,
      userCreated: details.hasUser ?? false,
      sessionCreated: details.hasSession ?? false,
      identitiesCount: details.identitiesCount ?? 0,
    });
  } else {
    console.warn(prefix, {
      elapsedMs: details.elapsedMs,
      status: details.status ?? 'failed',
      errorCode: details.errorCode ?? 'unknown',
      errorName: details.errorName ?? 'Error',
      message: details.safeMessage ?? 'Auth operation encountered an issue',
    });
  }
}

/** Promise timeout utility to guarantee no authentication call hangs indefinitely */
async function callWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'signin',
  initialErrorMessage,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [gamerTag, setGamerTag] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'update-password'>(initialMode);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  /** Tracks the email used for the last successful signup so we can offer a resend button */
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState('');
  /** Non-blocking recovery session warning */
  const [recoveryWarning, setRecoveryWarning] = useState<string | null>(null);
  const [verificationTimeout, setVerificationTimeout] = useState(false);

  // Sync initialErrorMessage if provided
  useEffect(() => {
    if (isOpen && initialErrorMessage) {
      setErrorMessage(initialErrorMessage);
    }
  }, [isOpen, initialErrorMessage]);

  // Diagnostic log on mount / mode change
  useEffect(() => {
    if (isOpen) {
      console.log('[PlayArena Auth Runtime]', {
        configured: supabaseConfigured,
        clientInitialized: Boolean(supabase),
        mode,
        browserOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      });
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen]);

  // Non-blocking verification of recovery session with guaranteed 8-second fallback
  useEffect(() => {
    let active = true;
    if (isOpen && mode === 'update-password' && supabase) {
      setRecoveryWarning(null);
      setVerificationTimeout(false);
      console.log('[PlayArena Recovery] update-password mode active: verifying recovery session...');

      // Immediate session check
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!active) return;
        console.log('[PlayArena Recovery] Initial session probe:', { hasSession: Boolean(session) });
        if (session) {
          setRecoveryWarning(null);
          setVerificationTimeout(false);
        }
      }).catch((err) => {
        console.warn('[PlayArena Recovery] Session probe warning:', err?.message || err);
      });

      // Listen for auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!active) return;
        console.log('[PlayArena Recovery] Modal received auth event:', event, { hasSession: Boolean(session) });
        if (event === 'PASSWORD_RECOVERY' || (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION'))) {
          setRecoveryWarning(null);
          setVerificationTimeout(false);
        }
      });

      // Guaranteed 8-second fallback timer: if no session confirmed after 8s, surface error with Retry
      const timer = setTimeout(async () => {
        if (!active || !supabase) return;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!active) return;
          console.log('[PlayArena Recovery] 8-second fallback check:', { hasSession: Boolean(session) });
          if (!session) {
            setVerificationTimeout(true);
            setRecoveryWarning(
              'Password recovery link verification took too long or could not be established. Your link may have expired or already been used.'
            );
          }
        } catch {
          if (active) setVerificationTimeout(true);
        }
      }, 8000);

      return () => {
        active = false;
        clearTimeout(timer);
        subscription?.unsubscribe();
      };
    } else {
      setRecoveryWarning(null);
      setVerificationTimeout(false);
    }
  }, [isOpen, mode]);

  const handleRetryVerification = async () => {
    if (!supabase) return;
    soundFx.playClick();
    setRecoveryWarning(null);
    setVerificationTimeout(false);
    resetMessages();
    console.log('[PlayArena Recovery] Manual retry verification initiated');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('[PlayArena Recovery] Retry probe result:', {
        hasSession: Boolean(session),
        hasError: Boolean(error),
      });
      if (session) {
        setSuccessMessage('Recovery session active! Please enter and confirm your new password below.');
      } else {
        setVerificationTimeout(true);
        setRecoveryWarning('No active recovery session was found. Please request a fresh recovery link.');
      }
    } catch {
      setVerificationTimeout(true);
      setRecoveryWarning('Unable to reach auth server. Please check your network and try again.');
    }
  };



  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleModeSwitch = (newMode: 'signin' | 'signup' | 'forgot' | 'update-password') => {
    soundFx.playClick();
    resetMessages();
    setConfirmPassword('');
    setPendingConfirmEmail('');
    setRecoveryWarning(null);
    setMode(newMode);
  };


  /** Resend the confirmation email for the most recent signup or unconfirmed signin */
  const handleResendConfirmation = async () => {
    if (!supabase || !pendingConfirmEmail) return;
    resetMessages();
    setBusy(true);
    const opName = 'resendConfirmation';
    const t0 = performance.now();
    logAuthDiagnostic('START', opName, { emailDomain: pendingConfirmEmail.split('@')[1] });

    try {
      const { error } = await callWithTimeout(
        supabase.auth.resend({
          type: 'signup',
          email: pendingConfirmEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        }),
        AUTH_TIMEOUT_MS,
        'Resending confirmation email timed out. The email delivery provider took too long to respond. Please check your connection or try again.'
      );

      const elapsedMs = Math.round(performance.now() - t0);

      if (error) {
        logAuthDiagnostic('ERROR', opName, {
          elapsedMs,
          status: error.status,
          errorCode: error.code,
          errorName: error.name,
          safeMessage: error.message,
        });

        if (error.message?.toLowerCase().includes('rate limit')) {
          throw new Error('Email resend rate limit reached. Supabase limits email dispatch frequency. Please wait a short while.');
        }
        throw error;
      }

      logAuthDiagnostic('FINISH', opName, { elapsedMs, status: 200 });
      soundFx.playSuccess();
      setSuccessMessage(
        'Confirmation email dispatched again! Please check your inbox and spam/junk folder for the activation link.'
      );
    } catch (err) {
      const elapsedMs = Math.round(performance.now() - t0);
      const msg = err instanceof Error ? err.message : 'Failed to resend confirmation email.';
      logAuthDiagnostic('ERROR', opName, {
        elapsedMs,
        errorName: err instanceof Error ? err.name : 'UnknownError',
        safeMessage: msg,
      });
      setErrorMessage(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!supabaseConfigured || !supabase) {
      setErrorMessage(
        'Supabase is not configured yet. Verify your .env.local file has valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage('Your browser is offline. Please check your internet connection and try again.');
      return;
    }

    setBusy(true);

    try {
      if (mode === 'signup') {
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail || !trimmedEmail.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please verify your password confirmation.');
        }

        const cleanTag = gamerTag.trim() || trimmedEmail.split('@')[0];
        const opName = 'signUp';
        const t0 = performance.now();
        logAuthDiagnostic('START', opName, { emailDomain: trimmedEmail.split('@')[1] });

        // 1. Invoke Supabase Auth signUp with safe timeout
        const { data, error } = await callWithTimeout(
          supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
              data: { gamer_tag: cleanTag },
              emailRedirectTo: `${window.location.origin}/`,
            },
          }),
          AUTH_TIMEOUT_MS,
          'Registration request timed out after 15 seconds. The Supabase auth server or mail provider took too long to respond. Please check your connection or try again.'
        );

        const elapsedMs = Math.round(performance.now() - t0);

        if (error) {
          logAuthDiagnostic('ERROR', opName, {
            elapsedMs,
            status: error.status,
            errorCode: error.code,
            errorName: error.name,
            safeMessage: error.message,
          });

          if (error.message?.toLowerCase().includes('already registered')) {
            throw new Error('An account with this email is already registered. Please sign in or use "Forgot password?".');
          }
          if (error.message?.toLowerCase().includes('rate limit')) {
            throw new Error('Email dispatch rate limit reached. Supabase limits hourly emails. Please wait a moment before trying again.');
          }
          throw error;
        }

        logAuthDiagnostic('FINISH', opName, {
          elapsedMs,
          status: 200,
          hasUser: Boolean(data?.user?.id),
          hasSession: Boolean(data?.session),
          identitiesCount: data?.user?.identities?.length ?? 0,
        });

        // Detect duplicate email where identities is empty (Supabase GoTrue obfuscation to prevent user enumeration)
        if (
          data.user &&
          (!data.user.identities || data.user.identities.length === 0)
        ) {
          throw new Error(
            'An account with this email is already registered. Please sign in with your password, or use "Forgot password?" to reset it.'
          );
        }

        if (data.session && data.user) {
          // Direct login (when Supabase email confirmation is disabled).
          // Note: Passwords are NEVER written to public.profiles; only public profile metadata is stored.
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              email: trimmedEmail,
              gamer_tag: cleanTag,
              role: 'user',
            },
            { onConflict: 'id' }
          );

          soundFx.playSuccess();
          onLoginSuccess(cleanTag, 'user');
          onClose();
        } else if (data.user) {
          // Email confirmation is required by Supabase Auth configuration
          soundFx.playSuccess();
          setPendingConfirmEmail(trimmedEmail);
          setSuccessMessage(
            'Account registration successful! A verification link has been dispatched to your email address. Please click the link to confirm your account, then sign in.'
          );
        } else {
          throw new Error('Unable to complete registration. Please check your network and try again.');
        }
      } else if (mode === 'signin') {
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail || !password) {
          throw new Error('Please enter both your email address and password.');
        }

        const opName = 'signInWithPassword';
        const t0 = performance.now();
        logAuthDiagnostic('START', opName, { emailDomain: trimmedEmail.split('@')[1] });

        // 2. Invoke Supabase Auth signInWithPassword
        const { data, error } = await callWithTimeout(
          supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          }),
          AUTH_TIMEOUT_MS,
          'Sign in timed out while connecting to the authentication server. Please check your internet connection.'
        );

        const elapsedMs = Math.round(performance.now() - t0);

        if (error) {
          logAuthDiagnostic('ERROR', opName, {
            elapsedMs,
            status: error.status,
            errorCode: error.code,
            errorName: error.name,
            safeMessage: error.message,
          });

          if (error.message?.toLowerCase().includes('email not confirmed')) {
            setPendingConfirmEmail(trimmedEmail);
            throw new Error(
              'Your email address has not been confirmed yet. Please verify your inbox/spam folder for the activation link, or click "Resend confirmation email" below.'
            );
          }
          if (error.message?.toLowerCase().includes('invalid login credentials')) {
            throw new Error('Invalid email or password. Please verify your login details.');
          }
          throw error;
        }

        logAuthDiagnostic('FINISH', opName, {
          elapsedMs,
          status: 200,
          hasUser: Boolean(data?.user?.id),
          hasSession: Boolean(data?.session),
        });

        if (!data.user) throw new Error('Could not retrieve user credentials.');

        // Query user profile for role verification (no passwords stored or selected)
        let { data: profile } = await supabase
          .from('profiles')
          .select('role, gamer_tag')
          .eq('id', data.user.id)
          .maybeSingle();

        let userRole = (profile?.role as 'user' | 'admin') || 'user';
        let tag = profile?.gamer_tag || trimmedEmail.split('@')[0];

        // Self-heal profile row if missing so user does not get locked out
        if (!profile) {
          const { data: createdProfile } = await supabase
            .from('profiles')
            .upsert(
              {
                id: data.user.id,
                email: trimmedEmail,
                gamer_tag: tag,
                role: 'user',
              },
              { onConflict: 'id' }
            )
            .select('role, gamer_tag')
            .maybeSingle();
          if (createdProfile) {
            userRole = (createdProfile.role as 'user' | 'admin') || 'user';
            tag = createdProfile.gamer_tag || tag;
          }
        }

        // Trusted database check for admin role via RPC function
        if (role === 'admin' && userRole !== 'admin') {
          const { data: isDbAdmin } = await supabase.rpc('is_playarena_admin');
          if (isDbAdmin === true) {
            userRole = 'admin';
          }
        }

        if (role === 'admin' && userRole !== 'admin') {
          await supabase.auth.signOut();
          throw new Error(
            'Access denied: This account does not have administrator privileges. Please log in through User Login or request admin elevation in the Supabase SQL Editor.'
          );
        }

        soundFx.playSuccess();
        onLoginSuccess(tag, userRole);
        onClose();

        if (userRole === 'admin' && role === 'admin') {
          window.location.assign('/admin');
        }
      } else if (mode === 'forgot') {
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail || !trimmedEmail.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }

        const opName = 'resetPasswordForEmail';
        const t0 = performance.now();
        logAuthDiagnostic('START', opName, { emailDomain: trimmedEmail.split('@')[1] });

        // 3. Invoke Supabase Auth password reset with clean URL (no hash fragment)
        // Standard Supabase URL matching requires clean base redirect path
        const { error } = await callWithTimeout(
          supabase.auth.resetPasswordForEmail(trimmedEmail, {
            redirectTo: `${window.location.origin}/`,
          }),
          AUTH_TIMEOUT_MS,
          'Password reset request timed out. Please check your connection and try again.'
        );

        const elapsedMs = Math.round(performance.now() - t0);

        if (error) {
          logAuthDiagnostic('ERROR', opName, {
            elapsedMs,
            status: error.status,
            errorCode: error.code,
            errorName: error.name,
            safeMessage: error.message,
          });

          if (error.message?.toLowerCase().includes('rate limit')) {
            throw new Error('Password reset email rate limit exceeded. Please wait a short while before trying again.');
          }
          throw error;
        }

        logAuthDiagnostic('FINISH', opName, { elapsedMs, status: 200 });
        soundFx.playSuccess();
        setSuccessMessage(
          'Password recovery link dispatched! Check your inbox (and spam folder) for the reset link.'
        );
      } else if (mode === 'update-password') {
        if (newPassword.length < 8) {
          throw new Error('New password must be at least 8 characters long.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('New passwords do not match. Please verify your new password confirmation.');
        }

        const opName = 'updatePassword';
        const t0 = performance.now();
        logAuthDiagnostic('START', opName, {});

        // 1. Verify that an active recovery session exists before invoking updateUser
        let { data: sessionData } = await supabase.auth.getSession();
        let session = sessionData?.session;

        // If not found immediately, give GoTrue a brief 600ms chance to complete URL hash processing
        if (!session) {
          await new Promise((r) => setTimeout(r, 600));
          const retry = await supabase.auth.getSession();
          session = retry.data?.session;
        }

        if (!session) {
          setRecoveryWarning('No active recovery session was found. Please request a new recovery link below.');
          throw new Error(
            'Your password recovery session has expired or is invalid. Please request a new recovery link below.'
          );
        }

        // 2. Invoke Supabase Auth updateUser directly (no artificial conflicting timeout)
        const { data: updateData, error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        const elapsedMs = Math.round(performance.now() - t0);

        if (error) {
          logAuthDiagnostic('ERROR', opName, {
            elapsedMs,
            status: error.status,
            errorCode: error.code,
            errorName: error.name,
            safeMessage: error.message,
          });

          if (
            error.message?.toLowerCase().includes('session') ||
            error.name === 'AuthSessionMissingError' ||
            (error as any).code === 'session_not_found'
          ) {
            setRecoveryWarning('Your recovery session has expired or is invalid. Please request a new link.');
            throw new Error(
              'Your password recovery session has expired or is invalid. Please request a new recovery link below.'
            );
          }
          if (error.message?.toLowerCase().includes('same password')) {
            throw new Error('Your new password must be different from your existing password.');
          }
          if (error.message?.toLowerCase().includes('rate limit')) {
            throw new Error('Password update rate limit reached. Please wait a short moment before trying again.');
          }
          throw error;
        }

        logAuthDiagnostic('FINISH', opName, {
          elapsedMs,
          status: 200,
          hasUser: Boolean(updateData?.user?.id),
        });
        soundFx.playSuccess();
        setSuccessMessage('Password updated successfully! You can now sign in with your new password.');

        // Clean up recovery fragments from URL so user isn't stuck in recovery mode
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        setTimeout(() => {
          setMode('signin');
          setPassword('');
          setConfirmPassword('');
          setNewPassword('');
          setRecoveryWarning(null);
        }, 1500);
      }
    } catch (err) {
      let message = err instanceof Error ? err.message : 'An unexpected error occurred during authentication.';
      
      // Specifically categorize network-level / ad-blocker fetch rejections
      if (message.toLowerCase().includes('failed to fetch')) {
        message = 'Could not establish connection to the Supabase authentication server (Failed to fetch). This typically indicates an ad-blocker (like uBlock Origin or Brave Shields), firewall, or DNS blocking supabase.co.';
      }

      setErrorMessage(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#080C1B] border border-cyan-400/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,240,255,0.25)]">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 p-[1.5px] mx-auto mb-3">
            <div className="w-full h-full bg-[#080C1B] rounded-[10px] flex items-center justify-center">
              {mode === 'forgot' || mode === 'update-password' ? (
                <KeyRound className="w-6 h-6 text-cyan-400" />
              ) : (
                <Shield className="w-6 h-6 text-cyan-400" />
              )}
            </div>
          </div>

          <h3 className="font-gaming font-black text-2xl text-white uppercase tracking-wider">
            {mode === 'forgot'
              ? 'RESET PASSWORD'
              : mode === 'update-password'
              ? 'SET NEW PASSWORD'
              : role === 'admin'
              ? 'ADMIN CONTROL ACCESS'
              : 'GAMER ARENA ACCESS'}
          </h3>

          <p className="text-slate-400 text-xs mt-1">
            {mode === 'forgot'
              ? 'Enter your email to receive a secure recovery link'
              : mode === 'update-password'
              ? 'Enter your new secure account password'
              : 'Supabase-powered authenticated gaming session'}
          </p>
        </div>

        {/* Role Toggle Selector (Sign In mode only) */}
        {mode === 'signin' && (
          <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setRole('user');
                resetMessages();
              }}
              className={`rounded-lg py-2 text-xs font-bold font-gaming transition-all ${
                role === 'user'
                  ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              USER LOGIN
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setRole('admin');
                resetMessages();
              }}
              className={`rounded-lg py-2 text-xs font-bold font-gaming transition-all ${
                role === 'admin'
                  ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ADMIN LOGIN
            </button>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                Gamer Tag
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={gamerTag}
                  onChange={(e) => setGamerTag(e.target.value)}
                  placeholder="e.g. CyberVanguard"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-sm"
                />
              </div>
            </div>
          )}

          {mode !== 'update-password' && (
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-sm"
                />
              </div>
            </div>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('forgot')}
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-sm"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Re-enter at least 8 characters"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-sm"
                />
              </div>
            </div>
          )}

          {mode === 'update-password' && (recoveryWarning || verificationTimeout) && (
            <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-300 space-y-2.5">
              <div className="flex items-center gap-2 font-gaming font-bold text-amber-400 uppercase">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Recovery Session Notice</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {recoveryWarning || 'Password recovery link verification took too long. Please verify your connection or request a new link.'}
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRetryVerification}
                  className="flex-1 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-gaming uppercase font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-3 h-3" />
                  Retry Verification
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('forgot')}
                  className="flex-1 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-gaming uppercase font-bold text-[11px] transition-all cursor-pointer text-center"
                >
                  Request Fresh Link
                </button>
              </div>
            </div>
          )}

          {mode === 'update-password' && (
            <>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    minLength={8}
                    required
                    disabled={busy}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 8 characters"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    minLength={8}
                    required
                    disabled={busy}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-sm disabled:opacity-50"
                  />
                </div>
              </div>
            </>
          )}

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="leading-relaxed break-words">{errorMessage}</div>
            </div>
          )}

          {/* Success Message Box */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="leading-relaxed break-words">{successMessage}</div>
            </div>
          )}

          {/* Resend Confirmation Button — only when a pending confirmation email exists */}
          {pendingConfirmEmail && (
            <button
              type="button"
              disabled={busy}
              onClick={handleResendConfirmation}
              className="w-full py-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 text-xs font-mono flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Resend confirmation email
            </button>
          )}

          {/* Action Submit Button */}
          <button
            disabled={busy}
            type="submit"
            data-cursor="action"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-slate-950 font-gaming font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-60 cursor-pointer"
          >
            {busy ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            <span>
              {busy
                ? 'AUTHENTICATING...'
                : mode === 'signup'
                ? 'CREATE GAMER ACCOUNT'
                : mode === 'forgot'
                ? 'DISPATCH RECOVERY EMAIL'
                : mode === 'update-password'
                ? 'SAVE NEW PASSWORD'
                : role === 'admin'
                ? 'AUTHORIZE ADMIN ACCESS'
                : 'SIGN IN TO ARENA'}
            </span>
          </button>
        </form>

        {/* Security / Admin Guidance */}
        {role === 'admin' && mode === 'signin' && (
          <p className="text-[11px] text-purple-300/80 mt-3 text-center leading-relaxed">
            Admin access is governed strictly by the database policy. Non-admin accounts will be rejected.
          </p>
        )}

        {/* Mode Switcher Navigation Links */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center text-xs text-slate-400 space-y-2">
          {mode === 'signin' && (
            <p>
              New to Play Arena?{' '}
              <button
                type="button"
                className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 transition-colors"
                onClick={() => handleModeSwitch('signup')}
              >
                Create an account
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already registered?{' '}
              <button
                type="button"
                className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 transition-colors"
                onClick={() => handleModeSwitch('signin')}
              >
                Sign in to your account
              </button>
            </p>
          )}

          {(mode === 'forgot' || mode === 'update-password') && (
            <button
              type="button"
              className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors inline-flex items-center gap-1"
              onClick={() => handleModeSwitch('signin')}
            >
              ← Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
