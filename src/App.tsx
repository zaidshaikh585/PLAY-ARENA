/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CustomCursor } from './components/CustomCursor';
import { ScrollProgress } from './components/ScrollProgress';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedGames } from './components/FeaturedGames';
import { GameCategories } from './components/GameCategories';
import { TrendingNow } from './components/TrendingNow';
import { LiveStats } from './components/LiveStats';
import { Tournaments } from './components/Tournaments';
import { Leaderboard } from './components/Leaderboard';
import { Community } from './components/Community';
import { NewsSection } from './components/NewsSection';
import { NewsletterCta } from './components/NewsletterCta';
import { Footer } from './components/Footer';
import { BackToHomeButton } from './components/BackToHomeButton';

import { GameLauncherModal } from './components/GameLauncherModal';
import { SearchModal } from './components/SearchModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { AuthModal } from './components/AuthModal';
import { TournamentModal } from './components/TournamentModal';
import { ArticleModal, PlayerModal, SupportModal } from './components/InfoModals';

import { FEATURED_GAMES, GAME_CATEGORIES } from './data/gamingData';
import { Game, Category, Tournament, PlayerRank, NewsArticle } from './types/gaming';
import { soundFx } from './utils/soundEffects';
import { AdminPanel } from './components/AdminPanel';
import { FeedbackWidget } from './components/FeedbackWidget';
import { supabase, supabaseConfigured, initialAuthUrlInfo } from './lib/supabase';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(window.location.pathname.startsWith('/admin'));

  // Modal states
  const [selectedGameForLaunch, setSelectedGameForLaunch] = useState<Game | null>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/play')) {
      return FEATURED_GAMES[0];
    }
    return null;
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot' | 'update-password'>('signin');
  const [authModalError, setAuthModalError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRank | null>(null);
  const [supportModalTopic, setSupportModalTopic] = useState<string | null>(null);

  // Games catalogue state (dynamic from Supabase, with static fallback)
  const [gamesList, setGamesList] = useState<Game[]>(FEATURED_GAMES);

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<string[]>(['cyber-strike', 'neon-drift']);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authenticated User Session state
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    gamerTag: string;
    role: 'user' | 'admin';
  } | null>(null);

  // Trigger Cyber Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Sync Supabase Auth Session & Games on mount & listen to state changes
  useEffect(() => {
    let mounted = true;
    const client = supabase;

    // 1. Inspect URL parameters & pre-captured initial markers for password recovery callback errors
    const searchParams = new URLSearchParams(window.location.search);
    const rawHash = window.location.hash || '';
    const hashClean = rawHash.startsWith('#') ? rawHash.substring(1) : rawHash;
    const hashParams = new URLSearchParams(hashClean);

    // A) Detect Supabase authentication callback errors (e.g. expired link)
    const urlError = searchParams.get('error') || hashParams.get('error') || initialAuthUrlInfo.error;
    const urlErrorCode = searchParams.get('error_code') || hashParams.get('error_code') || initialAuthUrlInfo.errorCode;
    const urlErrorDesc =
      searchParams.get('error_description') ||
      hashParams.get('error_description') ||
      initialAuthUrlInfo.errorDescription;

    if (urlError || urlErrorCode) {
      const decodedDesc = urlErrorDesc ? decodeURIComponent(urlErrorDesc).replace(/\+/g, ' ') : '';
      const isExpired =
        urlErrorCode === 'otp_expired' ||
        decodedDesc.toLowerCase().includes('expired') ||
        decodedDesc.toLowerCase().includes('invalid');

      const userNotice = isExpired
        ? 'Your password recovery link has expired or has already been used. Please enter your email to request a new recovery link.'
        : `Recovery link notice: ${decodedDesc || urlError}`;

      setAuthModalError(userNotice);
      setAuthModalMode('forgot');
      setIsAuthOpen(true);
      showToast(userNotice);
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    // B) If user landed on an explicit password recovery URL, open modal in update-password mode immediately
    else if (
      initialAuthUrlInfo.isRecovery ||
      rawHash.includes('type=recovery') ||
      rawHash.includes('reset-password') ||
      searchParams.get('type') === 'recovery' ||
      hashParams.get('type') === 'recovery'
    ) {
      console.log('[PlayArena App] Detected password recovery URL markers:', {
        initialWasRecovery: initialAuthUrlInfo.isRecovery,
        hasTypeRecovery: rawHash.includes('type=recovery') || searchParams.get('type') === 'recovery',
        hasResetHash: rawHash.includes('reset-password'),
      });
      setAuthModalError(null);
      setAuthModalMode('update-password');
      setIsAuthOpen(true);
    }
    // C) If user landed on an email verification / signup confirmation callback
    else if (
      initialAuthUrlInfo.isSignupVerification ||
      rawHash.includes('type=signup') ||
      rawHash.includes('type=email_change') ||
      searchParams.get('type') === 'signup' ||
      hashParams.get('type') === 'signup'
    ) {
      console.log('[PlayArena App] Detected email confirmation callback');
      showToast('Email confirmation verified! Connecting neural link...');
      setIsAuthOpen(false);
    }

    // D) Handle PKCE code exchange if present (for either recovery or signup confirmation)
    const code = searchParams.get('code');
    if (code && client) {
      void client.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          console.log('[PlayArena App] Invoking PKCE exchange fallback for code...');
          client.auth.exchangeCodeForSession(code).then(({ data, error }) => {
            console.log('[PlayArena App] PKCE exchange result:', {
              hasSession: Boolean(data?.session),
              hasError: Boolean(error),
            });
            if (!error && typeof window !== 'undefined' && window.history?.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }).catch(() => {});
        } else {
          if (typeof window !== 'undefined' && window.history?.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      });
    }



    if (!supabaseConfigured || !client) return;

    // 2. Fetch live games catalogue from Supabase
    const fetchGames = async () => {
      try {
        const { data } = await client
          .from('games')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });
        if (mounted && data && data.length > 0) {
          const mapped: Game[] = data.map((g: any) => ({
            id: g.id,
            title: g.title,
            genre: g.genre,
            rating: Number(g.rating) || 4.8,
            playerCount: g.player_count || 'Global',
            platforms: Array.isArray(g.platforms) ? g.platforms : ['PC'],
            description: g.description,
            bannerGradient: g.banner_gradient || 'from-cyan-500/20 via-blue-950/40 to-slate-950',
            accentColor: g.accent_color || '#00F0FF',
            releaseDate: g.release_date || 'Live',
            developer: g.developer || 'Play Arena Studios',
            storage: g.storage || 'Varies by device',
            trailerTitle: g.trailer_title || g.title,
            imageUrl: g.image_url,
            officialSource: g.official_source,
            svgArtwork: g.svg_artwork || 'fps',
            officialUrl: g.official_url,
          }));
          setGamesList(mapped);
        }
      } catch {
        // Fallback to static FEATURED_GAMES — already the default state
      }
    };
    void fetchGames();

    // 3. Listen to auth state transitions (automatically receives INITIAL_SESSION on mount)
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log('[PlayArena App] Auth event transition:', event, {
        hasSession: Boolean(session),
        userEmail: session?.user?.email ? session.user.email.split('@')[1] : null,
      });

      if (event === 'PASSWORD_RECOVERY') {
        setAuthModalMode('update-password');
        setIsAuthOpen(true);
        showToast('Password recovery session verified. Enter your new password.');
        return;
      }

      if (event === 'USER_UPDATED') {
        // Password or user was updated
        return;
      }

      if (event === 'SIGNED_OUT' || !session?.user) {
        setCurrentUser(null);
        return;
      }

      // Synchronously set user state from session metadata so UI updates with 0 latency
      const metaTag = (session.user.user_metadata?.gamer_tag as string) || session.user.email?.split('@')[0] || 'Gamer';
      if (mounted) {
        setCurrentUser((prev) => {
          if (prev && prev.email === session.user.email) {
            return prev;
          }
          return {
            email: session.user.email || '',
            gamerTag: metaTag,
            role: 'user',
          };
        });
      }

      // Non-blocking background sync of profile row and elevated admin role
      // Does not return a pending promise to GoTrue, preventing signInWithPassword timeouts
      void (async () => {
        try {
          if (!mounted) return;

          if (event === 'SIGNED_IN') {
            await client.from('profiles').upsert(
              {
                id: session.user.id,
                email: session.user.email || '',
                gamer_tag: metaTag,
                role: 'user',
              },
              { onConflict: 'id', ignoreDuplicates: true }
            );
            if (initialAuthUrlInfo.isSignupVerification || rawHash.includes('type=signup') || searchParams.get('type') === 'signup') {
              showToast(`Email verified! Neural link activated: Welcome ${metaTag}`);
              setIsAuthOpen(false);
            }
          }

          const { data: profile } = await client
            .from('profiles')
            .select('role, gamer_tag')
            .eq('id', session.user.id)
            .maybeSingle();

          let userRole = (profile?.role as 'user' | 'admin') || 'user';
          if (userRole !== 'admin') {
            const { data: isDbAdmin } = await client.rpc('is_playarena_admin');
            if (isDbAdmin === true) {
              userRole = 'admin';
            }
          }

          if (mounted) {
            setCurrentUser({
              email: session.user.email || '',
              gamerTag: profile?.gamer_tag || metaTag,
              role: userRole,
            });
          }
        } catch (err) {
          console.warn('[PlayArena App] Background profile sync notice:', err);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleToggleWishlist = (game: Game) => {
    if (wishlistIds.includes(game.id)) {
      setWishlistIds((prev) => prev.filter((id) => id !== game.id));
      showToast(`Removed "${game.title}" from armory wishlist`);
    } else {
      setWishlistIds((prev) => [...prev, game.id]);
      showToast(`Added "${game.title}" to armory wishlist`);
      soundFx.playSuccess();
    }
  };

  const handleRemoveFromWishlist = (gameId: string) => {
    const game = gamesList.find((g) => g.id === gameId);
    setWishlistIds((prev) => prev.filter((id) => id !== gameId));
    if (game) showToast(`Removed "${game.title}" from armory wishlist`);
  };

  const handlePlayGame = (game: Game) => {
    setSelectedGameForLaunch(game);
    if (typeof window !== 'undefined' && window.history?.pushState) {
      window.history.pushState({ fromHome: true }, '', '/play');
    }
  };

  const handleNavigateHomeFromLauncher = () => {
    setSelectedGameForLaunch(null);
    if (typeof window !== 'undefined') {
      if (window.history?.pushState) {
        window.history.pushState({ fromHome: true }, '', '/');
      }
      const hero = document.querySelector('#home');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBackFromLauncher = () => {
    // Directly navigate to home route without relying on browser history or history.back()
    handleNavigateHomeFromLauncher();
  };

  const handleCloseLauncher = () => {
    setSelectedGameForLaunch(null);
    if (typeof window !== 'undefined' && window.history?.pushState && window.location.pathname.startsWith('/play')) {
      window.history.pushState({ fromHome: true }, '', '/');
    }
  };

  const handleNavigateHomeFromAdmin = () => {
    if (typeof window !== 'undefined') {
      if (window.history?.replaceState) {
        window.history.replaceState({ fromHome: true }, '', '/');
      } else {
        window.location.assign('/');
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    setIsAdminRoute(false);
    setSelectedGameForLaunch(null);
  };

  const handleSelectGameById = (gameId: string) => {
    const found = gamesList.find((g) => g.id === gameId);
    if (found) {
      setSelectedGameForLaunch(found);
    }
  };

  const handleSelectCategory = (category: Category) => {
    showToast(`Category selected: ${category.name} (${category.gameCount} titles)`);
    const el = document.querySelector('#games');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreGames = () => {
    const el = document.querySelector('#games');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJoinArena = () => {
    setAuthModalError(null);
    setAuthModalMode('signup');
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (gamerTag: string, role?: 'user' | 'admin') => {
    showToast(`Neural link authorized: Welcome ${gamerTag}`);
    if (role) {
      setCurrentUser((prev) => (prev ? { ...prev, gamerTag, role } : { email: '', gamerTag, role }));
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    showToast('Neural link terminated. Signed out of Play Arena.');
    if (isAdminRoute) {
      handleNavigateHomeFromAdmin();
    }
  };

  // Keyboard shortcut for search ('/' or 'Cmd+K' / 'Ctrl+K')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for browser popstate (back / forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        setIsAdminRoute(true);
        setSelectedGameForLaunch(null);
      } else if (path.startsWith('/play')) {
        setIsAdminRoute(false);
        setSelectedGameForLaunch((prev) => prev || gamesList[0] || FEATURED_GAMES[0]);
      } else {
        setIsAdminRoute(false);
        setSelectedGameForLaunch(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [gamesList]);

  const wishlistedGames = gamesList.filter((g) => wishlistIds.includes(g.id));

  // If user navigates to /admin, render the full AdminPanel
  if (isAdminRoute) {
    return (
      <div className="relative min-h-screen bg-[#05070E] text-slate-100 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
        <CustomCursor />
        <AdminPanel
          onNavigateHome={handleNavigateHomeFromAdmin}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#05070E] text-slate-100 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Custom Gaming Cursor */}
      <CustomCursor />

      {/* Thin Neon Scroll Progress Indicator at Top */}
      <ScrollProgress />

      {/* Fixed Sticky Glassmorphism Navigation Bar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAuth={() => {
          setAuthModalError(null);
          setAuthModalMode('signin');
          setIsAuthOpen(true);
        }}
        onPlayNow={() => handlePlayGame(gamesList[0] || FEATURED_GAMES[0])}
        wishlistCount={wishlistIds.length}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenAdmin={() => {
          setIsAdminRoute(true);
          if (typeof window !== 'undefined' && window.history?.pushState) {
            window.history.pushState({ fromAdmin: true }, '', '/admin');
          }
        }}
      />

      {/* Main Content Sections */}
      <main>
        {/* Cinematic Full-Screen Gaming Hero Section */}
        <Hero
          onExploreGames={handleExploreGames}
          onJoinArena={handleJoinArena}
          onSelectGame={handleSelectGameById}
          featuredGames={gamesList}
        />

        {/* Featured Games Section: "ENTER THE GAME" */}
        <FeaturedGames
          games={gamesList}
          onPlayGame={handlePlayGame}
          onToggleWishlist={handleToggleWishlist}
          wishlistIds={wishlistIds}
        />

        {/* Game Categories: "CHOOSE YOUR BATTLE" */}
        <GameCategories
          categories={GAME_CATEGORIES}
          onSelectCategory={handleSelectCategory}
        />

        {/* Trending Now Horizontal Carousel */}
        <TrendingNow onSelectGame={handleSelectGameById} />

        {/* Live Gaming / Online Players Statistics Section */}
        <LiveStats />

        {/* Tournament Section: "RULE THE ARENA" */}
        <Tournaments onJoinTournament={(t) => setSelectedTournament(t)} />

        {/* Leaderboard: "TOP PLAYERS" */}
        <Leaderboard onSelectPlayer={(p) => setSelectedPlayer(p)} />

        {/* Community Section: "FIND YOUR SQUAD" */}
        <Community
          onJoinCommunity={() => setSupportModalTopic('Discord Global Community')}
          onOpenCard={(title) => setSupportModalTopic(title)}
        />

        {/* News / Gaming Updates: "FROM THE ARENA" */}
        <NewsSection onReadArticle={(art) => setSelectedArticle(art)} />

        {/* Newsletter / Final Powerful CTA */}
        <NewsletterCta />
      </main>

      {/* Footer */}
      <Footer
        onOpenSection={(id) => {
          const el = document.querySelector(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenSupportModal={(topic) => setSupportModalTopic(topic)}
      />

      {/* Interactive Modals */}
      <GameLauncherModal
        game={selectedGameForLaunch}
        onClose={handleCloseLauncher}
        onNavigateHome={handleNavigateHomeFromLauncher}
        onBack={handleBackFromLauncher}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectGame={(g) => handlePlayGame(g)}
        games={gamesList}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistGames={wishlistedGames}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onPlayGame={(g) => handlePlayGame(g)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthModalError(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authModalMode}
        initialErrorMessage={authModalError || undefined}
      />

      <TournamentModal
        tournament={selectedTournament}
        onClose={() => setSelectedTournament(null)}
      />

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <PlayerModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />

      <SupportModal
        topic={supportModalTopic}
        onClose={() => setSupportModalTopic(null)}
      />

      {/* Floating Back to Home Page Button (bottom-6 left-6) */}
      <BackToHomeButton />

      {/* Floating Feedback Widget (bottom-20 left-6, stacked neatly above Back to Home) */}
      <FeedbackWidget />

      {/* Cyber Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#090D1E]/95 border border-cyan-400/60 shadow-[0_0_25px_rgba(0,240,255,0.3)] text-xs font-mono text-cyan-300 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
