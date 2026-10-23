import { createClient } from '@supabase/supabase-js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : ({} as Record<string, string | undefined>);

const rawUrl = (env.VITE_SUPABASE_URL as string | undefined)?.trim();
const key = (env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

const sanitizeUrl = (u?: string): string => {
  if (!u) return '';
  return u
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/auth\/v1\/?$/i, '')
    .replace(/\/+$/, '');
};

const url = sanitizeUrl(rawUrl);

const isPlaceholder = (val?: string): boolean => {
  if (!val) return true;
  const lower = val.toLowerCase();
  return (
    lower.includes('your-project') ||
    lower.includes('your-real-project') ||
    lower.includes('your_supabase') ||
    lower.includes('your-publishable') ||
    lower.includes('your-real-key') ||
    lower === 'https://your-project.supabase.co' ||
    lower === 'https://your-real-project-id.supabase.co' ||
    lower === 'sb_publishable_your-real-key'
  );
};

export const supabaseConfigured = Boolean(
  url &&
  key &&
  url.startsWith('https://') &&
  url.includes('.supabase.co') &&
  !isPlaceholder(url) &&
  !isPlaceholder(key)
);

// Sanitize legacy or nested hash URLs (e.g. /#reset-password#access_token=...) so GoTrue can cleanly detect the session
if (typeof window !== 'undefined' && window.location.hash) {
  const hash = window.location.hash;
  if (hash.includes('access_token=') && !hash.startsWith('#access_token=')) {
    const tokenIdx = hash.indexOf('access_token=');
    if (tokenIdx !== -1) {
      window.location.hash = '#' + hash.substring(tokenIdx);
    }
  } else if (hash.includes('error=') && !hash.startsWith('#error=')) {
    const errIdx = hash.indexOf('error=');
    if (errIdx !== -1) {
      window.location.hash = '#' + hash.substring(errIdx);
    }
  }
}

/**
 * Resolves the absolute redirect URL for Supabase authentication callbacks
 * (email verification, password recovery, magic link).
 * 
 * Works dynamically across environments:
 * - On production Render (e.g. https://<app-name>.onrender.com)
 * - On local development (e.g. http://localhost:3000)
 * - Supports VITE_SITE_URL or VITE_APP_URL environment variable overrides if configured.
 * - Guarantees no hardcoded localhost URLs are emitted when deployed.
 */
export function getAuthRedirectUrl(path: string = '/'): string {
  let origin = '';

  const envUrl = (
    (env.VITE_SITE_URL as string | undefined) ||
    (env.VITE_APP_URL as string | undefined)
  )?.trim();

  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    origin = envUrl.replace(/\/+$/, '');
  } else if (typeof window !== 'undefined' && window.location?.origin) {
    origin = window.location.origin.replace(/\/+$/, '');
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = origin ? `${origin}${cleanPath}` : cleanPath;

  console.log('[PlayArena Auth] Generated auth redirect URL:', {
    origin,
    fullUrl,
    environment: env.MODE || 'production',
  });

  return fullUrl;
}

/**
 * Capture initial auth URL parameters immediately upon script evaluation,
 * before GoTrue's detectSessionInUrl strips them from window.location.
 */
export const initialAuthUrlInfo = (function checkInitialUrl() {
  if (typeof window === 'undefined') {
    return {
      isRecovery: false,
      isSignupVerification: false,
      hasAuthCode: false,
      error: null,
      errorCode: null,
      errorDescription: null,
    };
  }
  const searchParams = new URLSearchParams(window.location.search);
  const rawHash = window.location.hash || '';
  const cleanHash = rawHash.startsWith('#') ? rawHash.substring(1) : rawHash;
  const hashParams = new URLSearchParams(cleanHash);

  const error = searchParams.get('error') || hashParams.get('error');
  const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
  const rawErrorDesc = searchParams.get('error_description') || hashParams.get('error_description');
  const errorDescription = rawErrorDesc ? decodeURIComponent(rawErrorDesc).replace(/\+/g, ' ') : null;

  const isExplicitRecovery = Boolean(
    rawHash.includes('type=recovery') ||
    rawHash.includes('reset-password') ||
    searchParams.get('type') === 'recovery' ||
    hashParams.get('type') === 'recovery'
  );

  const isSignupVerification = Boolean(
    rawHash.includes('type=signup') ||
    rawHash.includes('type=email_change') ||
    searchParams.get('type') === 'signup' ||
    searchParams.get('type') === 'email_change' ||
    hashParams.get('type') === 'signup' ||
    hashParams.get('type') === 'email_change'
  );

  const hasAuthCode = Boolean(searchParams.get('code') && !error);

  return {
    isRecovery: isExplicitRecovery,
    isSignupVerification,
    hasAuthCode,
    error,
    errorCode,
    errorDescription,
  };
})();

export const supabase = supabaseConfigured
  ? createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;





