import React, { useEffect, useState, useMemo } from 'react';
import {
  ShieldCheck,
  LogOut,
  RefreshCw,
  Users,
  MessageSquareWarning,
  Database,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Gamepad2,
  Trophy,
  Mail,
  Trash2,
  ShieldAlert,
  UserCheck,
  UserX,
  Plus,
  ExternalLink,
  Eye,
  Check,
  X,
  Filter,
  Flame,
  Activity,
  Calendar,
  Award,
} from 'lucide-react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { FEATURED_GAMES } from '../data/gamingData';
import { Game, UserProfile, ReportItem, TournamentRegistrationRecord, NewsletterSubscriberRecord } from '../types/gaming';
import { soundFx } from '../utils/soundEffects';
import { AuthModal } from './AuthModal';

interface AdminPanelProps {
  onNavigateHome?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateHome }) => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Data states
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [games, setGames] = useState<Game[]>(FEATURED_GAMES);
  const [registrations, setRegistrations] = useState<TournamentRegistrationRecord[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberRecord[]>([]);

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports' | 'games' | 'tournaments' | 'subscribers' | 'database'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportFilter, setReportFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');

  // Interactive Action Modals
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'promote' | 'demote' | 'deleteUser' | 'deleteReport' | 'deleteSubscriber';
    targetId: string;
    extraData?: any;
  } | null>(null);

  const [selectedUserDetail, setSelectedUserDetail] = useState<UserProfile | null>(null);

  const [editingUserStats, setEditingUserStats] = useState<UserProfile | null>(null);
  const [statsForm, setStatsForm] = useState<{
    gamer_tag: string;
    wins: string;
    xp: string;
    level: string;
    win_rate: string;
    primary_game: string;
    badge: string;
  }>({
    gamer_tag: '',
    wins: '',
    xp: '',
    level: '',
    win_rate: '',
    primary_game: '',
    badge: '',
  });

  const handleOpenEditStats = (u: UserProfile) => {
    setEditingUserStats(u);
    setStatsForm({
      gamer_tag: u.gamer_tag || '',
      wins: u.wins !== null && u.wins !== undefined ? String(u.wins) : '',
      xp: u.xp !== null && u.xp !== undefined ? String(u.xp) : '',
      level: u.level !== null && u.level !== undefined ? String(u.level) : '',
      win_rate: u.win_rate || '',
      primary_game: u.primary_game || '',
      badge: u.badge || '',
    });
  };

  const handleSaveStats = async () => {
    if (!editingUserStats || !supabase) return;
    try {
      const payload: any = {
        gamer_tag: statsForm.gamer_tag.trim() || null,
        wins: statsForm.wins.trim() ? parseInt(statsForm.wins.trim(), 10) : null,
        xp: statsForm.xp.trim() ? parseInt(statsForm.xp.trim(), 10) : null,
        level: statsForm.level.trim() ? parseInt(statsForm.level.trim(), 10) : null,
        win_rate: statsForm.win_rate.trim() || null,
        primary_game: statsForm.primary_game.trim() || null,
        badge: statsForm.badge.trim() || null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', editingUserStats.id);

      if (error) {
        if (error.message.includes('does not exist')) {
          throw new Error(
            'Stats columns do not exist in database yet. Please execute supabase/leaderboard_migration.sql in your Supabase SQL Editor.'
          );
        }
        throw error;
      }

      setProfiles((prev) =>
        prev.map((u) => (u.id === editingUserStats.id ? { ...u, ...payload } : u))
      );
      showNotice(`Stats and profile updated for ${statsForm.gamer_tag || editingUserStats.email}`);
      soundFx.playSuccess();
      setEditingUserStats(null);
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Failed to update user stats.');
    }
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 4000);
  };

  const loadAdminData = async () => {
    if (!supabaseConfigured || !supabase) {
      setErrorMessage(
        'Supabase is not configured yet. Copy .env.example to .env.local, fill in your real Supabase Project URL and Anon/Publishable Key, then reload.'
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Verify authenticated session
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        setCurrentAdminEmail(null);
        setAllowed(false);
        throw new Error('Authentication required: You must be signed in with an administrator account to access this console.');
      }

      setCurrentAdminEmail(user.email || null);

      // 2. Verify admin role on profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      let isAdmin = profile?.role === 'admin';

      // Fallback: check trusted database RPC function is_playarena_admin()
      if (!isAdmin) {
        const { data: rpcAdmin } = await supabase.rpc('is_playarena_admin');
        if (rpcAdmin === true) {
          isAdmin = true;
        }
      }

      if (!isAdmin) {
        setAllowed(false);
        throw new Error(
          `Access restricted: The signed-in account (${user.email}) currently has the 'user' role, not 'admin'. To grant administrator privileges to this account, execute the SQL command below in your Supabase SQL Editor.`
        );
      }

      setAllowed(true);

      // 3. Parallel fetch of all administrative collections
      const [profilesRes, reportsRes, gamesRes, tournamentsRes, subscribersRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('reports').select('*').order('created_at', { ascending: false }),
        supabase.from('games').select('*').order('created_at', { ascending: true }),
        supabase.from('tournament_registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }),
      ]);

      if (profilesRes.data) setProfiles(profilesRes.data);
      if (reportsRes.data) setReports(reportsRes.data);
      if (gamesRes.data && gamesRes.data.length > 0) {
        // Map database game structure to Game type
        const dbGames: Game[] = gamesRes.data.map((g: any) => ({
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
        setGames(dbGames);
      } else {
        // Fallback to rich catalogue in gamingData
        setGames(FEATURED_GAMES);
      }

      if (tournamentsRes.data) setRegistrations(tournamentsRes.data);
      if (subscribersRes.data) setSubscribers(subscribersRes.data);
    } catch (err) {
      setAllowed(false);
      setErrorMessage(err instanceof Error ? err.message : 'Could not synchronize administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  const handleBackToWebsite = () => {
    soundFx.playClick();
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.assign('/');
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    handleBackToWebsite();
  };

  // Status Updater for Reports
  const handleUpdateReportStatus = async (id: string, status: 'open' | 'in_progress' | 'resolved') => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('reports').update({ status }).eq('id', id);
      if (error) throw error;
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      showNotice(`Report status updated to "${status.replace('_', ' ')}"`);
      soundFx.playSuccess();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Failed to update report status.');
    }
  };

  // Execution of confirmed actions
  const executeConfirmedAction = async () => {
    if (!confirmModal || !supabase) return;
    const { actionType, targetId } = confirmModal;

    try {
      if (actionType === 'promote') {
        const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', targetId);
        if (error) throw error;
        setProfiles((prev) => prev.map((u) => (u.id === targetId ? { ...u, role: 'admin' } : u)));
        showNotice('User elevated to Administrator successfully.');
        soundFx.playSuccess();
      } else if (actionType === 'demote') {
        const { error } = await supabase.from('profiles').update({ role: 'user' }).eq('id', targetId);
        if (error) throw error;
        setProfiles((prev) => prev.map((u) => (u.id === targetId ? { ...u, role: 'user' } : u)));
        showNotice('User demoted to standard gamer role.');
        soundFx.playSuccess();
      } else if (actionType === 'deleteUser') {
        const { error } = await supabase.from('profiles').delete().eq('id', targetId);
        if (error) throw error;
        setProfiles((prev) => prev.filter((u) => u.id !== targetId));
        showNotice('User profile record removed.');
        soundFx.playSuccess();
      } else if (actionType === 'deleteReport') {
        const { error } = await supabase.from('reports').delete().eq('id', targetId);
        if (error) throw error;
        setReports((prev) => prev.filter((r) => r.id !== targetId));
        showNotice('Report removed from archives.');
        soundFx.playSuccess();
      } else if (actionType === 'deleteSubscriber') {
        const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', targetId);
        if (error) throw error;
        setSubscribers((prev) => prev.filter((s) => s.id !== targetId));
        showNotice('Subscriber removed.');
        soundFx.playSuccess();
      }
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setConfirmModal(null);
    }
  };

  // Filtered queries
  const filteredUsers = useMemo(() => {
    return profiles.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        (u.gamer_tag || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [profiles, searchQuery, roleFilter]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q);
      const matchesStatus = reportFilter === 'all' || r.status === reportFilter;
      return matchesQuery && matchesStatus;
    });
  }, [reports, searchQuery, reportFilter]);

  return (
    <div className="min-h-screen bg-[#05070E] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080C1B]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <div className="w-full h-full bg-[#080C1B] rounded-[9px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="font-gaming font-black tracking-wider text-base sm:text-lg flex items-center gap-2">
              <span>PLAY ARENA</span>
              <span className="text-purple-400 px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/40 text-[10px] font-mono tracking-widest uppercase">
                ADMIN CONSOLE
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LOGGED IN AS: {currentAdminEmail || 'ADMINISTRATOR'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleBackToWebsite}
            className="rounded-xl px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-gaming font-bold flex items-center gap-2 transition-all text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">BACK TO WEBSITE</span>
          </button>

          <button
            type="button"
            onClick={() => void loadAdminData()}
            className="rounded-xl px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-gaming font-bold flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)]"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">REFRESH</span>
          </button>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="rounded-xl px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-gaming font-bold flex items-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">SIGN OUT</span>
          </button>
        </div>
      </header>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="fixed top-16 right-6 z-50 px-4 py-3 rounded-xl bg-purple-950/90 border border-purple-400/60 shadow-[0_0_25px_rgba(168,85,247,0.35)] text-xs font-mono text-purple-200 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-purple-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm font-gaming text-purple-300 tracking-wider">
              AUTHORIZING SECURE ARENA LINK...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="max-w-2xl mx-auto mt-12 p-8 rounded-3xl border border-purple-500/40 bg-purple-950/20 shadow-[0_0_50px_rgba(168,85,247,0.2)] text-center sm:text-left backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-purple-900/40 border border-purple-500/50 flex items-center justify-center mb-4 mx-auto sm:mx-0 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <ShieldAlert className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-black font-gaming mb-2 text-white uppercase tracking-wider">
              ADMIN ACCESS RESTRICTED
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed mb-6 font-mono">
              {errorMessage}
            </p>

            {currentAdminEmail ? (
              <div className="p-4 rounded-xl bg-black/70 border border-white/10 text-xs font-mono text-cyan-300 space-y-3 mb-6">
                <div className="text-slate-300 font-bold uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Grant Admin Role to "{currentAdminEmail}":
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-200 select-all overflow-x-auto font-mono text-[11px] leading-relaxed">
                  INSERT INTO public.profiles (id, email, gamer_tag, role)<br />
                  SELECT id, email, coalesce(raw_user_meta_data-&gt;&gt;'gamer_tag', split_part(email, '@', 1)), 'admin'<br />
                  FROM auth.users<br />
                  WHERE email = '{currentAdminEmail}'<br />
                  ON CONFLICT (id) DO UPDATE<br />
                  SET role = 'admin', updated_at = now();
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  1. Copy the SQL above.<br />
                  2. Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-cyan-400 underline underline-offset-2">Supabase Dashboard &gt; SQL Editor</a> and run it.<br />
                  3. Return here and click <strong>"Verify &amp; Retry"</strong> below.
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-slate-300 space-y-2 mb-6">
                <p>
                  You are not currently authenticated in this browser session. Please sign in with your administrator account to access the control console:
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-gaming text-xs font-black uppercase hover:from-purple-400 hover:to-cyan-400 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                {currentAdminEmail ? 'Sign In With Different Account' : 'Sign In As Administrator'}
              </button>
              <button
                type="button"
                onClick={() => void loadAdminData()}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-gaming text-xs font-bold uppercase hover:bg-white/20 transition-all flex items-center gap-2 border border-white/10"
              >
                <RefreshCw className="w-4 h-4" />
                Verify &amp; Retry
              </button>
              <button
                type="button"
                onClick={handleBackToWebsite}
                className="px-5 py-2.5 rounded-xl bg-white/5 text-slate-400 font-gaming text-xs font-bold uppercase hover:bg-white/10 hover:text-white transition-all"
              >
                Go to Public Website
              </button>
            </div>
          </div>
        ) : allowed && (
          <div className="space-y-6">
            {/* Top Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-white/10">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Activity },
                { id: 'users', label: `Users (${profiles.length})`, icon: Users },
                { id: 'reports', label: `Reports (${reports.length})`, icon: MessageSquareWarning },
                { id: 'games', label: `Games (${games.length})`, icon: Gamepad2 },
                { id: 'tournaments', label: `Squads (${registrations.length})`, icon: Trophy },
                { id: 'subscribers', label: `Subscribers (${subscribers.length})`, icon: Mail },
                { id: 'database', label: 'Database & SQL', icon: Database },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab(t.id as any);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-gaming font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                    activeTab === t.id
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 rounded-2xl bg-[#090D1E] border border-white/10 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono text-purple-400 uppercase font-bold">PROFILES</span>
                    </div>
                    <div className="text-4xl font-black font-gaming text-white tracking-tight font-tabular">
                      {profiles.length}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {profiles.filter((p) => p.role === 'admin').length} Authorized Admins · {profiles.filter((p) => p.role === 'user').length} Gamers
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#090D1E] border border-white/10 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <MessageSquareWarning className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono text-cyan-400 uppercase font-bold">REPORTS</span>
                    </div>
                    <div className="text-4xl font-black font-gaming text-white tracking-tight font-tabular">
                      {reports.length}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {reports.filter((r) => r.status === 'open').length} Open · {reports.filter((r) => r.status === 'resolved').length} Resolved
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#090D1E] border border-white/10 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono text-amber-400 uppercase font-bold">GAMES</span>
                    </div>
                    <div className="text-4xl font-black font-gaming text-white tracking-tight font-tabular">
                      {games.length}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Active AAA deployments live on homepage
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#090D1E] border border-white/10 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono text-emerald-400 uppercase font-bold">TOURNAMENTS</span>
                    </div>
                    <div className="text-4xl font-black font-gaming text-white tracking-tight font-tabular">
                      {registrations.length}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Registered competitive squads ready for seeds
                    </p>
                  </div>
                </div>

                {/* Split Overview: Recent Users & Recent Feedback */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Users */}
                  <div className="p-6 rounded-2xl bg-[#090D1E] border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-gaming font-bold text-sm uppercase text-slate-200 flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        RECENT USER REGISTRATIONS
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                      >
                        View all →
                      </button>
                    </div>

                    {profiles.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No user profiles recorded yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {profiles.slice(0, 5).map((u) => (
                          <div
                            key={u.id}
                            className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-sm text-white">{u.gamer_tag || 'Unknown Gamer'}</div>
                              <div className="text-xs text-slate-400 font-mono">{u.email || 'No email stored'}</div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                  u.role === 'admin'
                                    ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                                    : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                                }`}
                              >
                                {u.role}
                              </span>
                              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                                {new Date(u.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Reports */}
                  <div className="p-6 rounded-2xl bg-[#090D1E] border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-gaming font-bold text-sm uppercase text-slate-200 flex items-center gap-2">
                        <MessageSquareWarning className="w-4 h-4 text-cyan-400" />
                        LATEST COMMUNITY FEEDBACK
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('reports')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                      >
                        View all →
                      </button>
                    </div>

                    {reports.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No community reports submitted yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {reports.slice(0, 5).map((r) => (
                          <div
                            key={r.id}
                            className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
                          >
                            <div className="max-w-[70%]">
                              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                                {r.category}
                              </span>
                              <div className="font-medium text-xs text-slate-200 truncate mt-0.5">{r.message}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                By {r.name || 'Anonymous'} · {new Date(r.created_at).toLocaleDateString()}
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                                r.status === 'resolved'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : r.status === 'in_progress'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                  : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {r.status.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: USER MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users by gamer tag, email, or ID..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-sm text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-mono text-slate-400">Filter Role:</span>
                    {(['all', 'user', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRoleFilter(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-gaming font-bold uppercase ${
                          roleFilter === r
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Users Table */}
                <div className="rounded-2xl border border-white/10 bg-[#080C1B] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                          <th className="py-3.5 px-4">Gamer Tag</th>
                          <th className="py-3.5 px-4">Email</th>
                          <th className="py-3.5 px-4">Role</th>
                          <th className="py-3.5 px-4">Joined</th>
                          <th className="py-3.5 px-4">UUID</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-xs">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500">
                              No user records found matching the query.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3.5 px-4 font-bold text-white font-sans text-sm">
                                {u.gamer_tag || '—'}
                              </td>
                              <td className="py-3.5 px-4 text-slate-300">{u.email || '—'}</td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                    u.role === 'admin'
                                      ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-400">
                                {new Date(u.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                                {u.id.slice(0, 8)}...
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedUserDetail(u)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                                    title="View User Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditStats(u)}
                                    className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                    title="Edit Gamer Tag and Leaderboard Stats"
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                  </button>

                                  {u.role === 'user' ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmModal({
                                          isOpen: true,
                                          title: 'Elevate User to Administrator',
                                          description: `Are you sure you want to promote ${u.gamer_tag || u.email} to Admin? They will have full administrative privileges over reports, users, and games.`,
                                          actionType: 'promote',
                                          targetId: u.id,
                                        })
                                      }
                                      className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                      title="Promote to Admin"
                                    >
                                      <UserCheck className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmModal({
                                          isOpen: true,
                                          title: 'Demote Administrator to User',
                                          description: `Are you sure you want to revoke admin privileges for ${u.gamer_tag || u.email}?`,
                                          actionType: 'demote',
                                          targetId: u.id,
                                        })
                                      }
                                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      title="Demote to User"
                                    >
                                      <UserX className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmModal({
                                        isOpen: true,
                                        title: 'Delete User Profile',
                                        description: `Are you sure you want to delete profile ${u.gamer_tag || u.email}? This cannot be undone.`,
                                        actionType: 'deleteUser',
                                        targetId: u.id,
                                      })
                                    }
                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: REPORTS & FEEDBACK */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search reports by description, name, category..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-sm text-white"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1">
                    {(['all', 'open', 'in_progress', 'resolved'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReportFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-gaming font-bold uppercase whitespace-nowrap ${
                          reportFilter === s
                            ? 'bg-cyan-400 text-slate-950 font-black'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reports List */}
                {filteredReports.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-white/10 bg-[#080C1B] text-center text-slate-500">
                    No reports match the current filter criteria.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredReports.map((r) => (
                      <article
                        key={r.id}
                        className="p-5 rounded-2xl border border-white/10 bg-[#080C1B] hover:border-cyan-400/40 transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                              CATEGORY: {r.category}
                            </span>
                            <h4 className="text-base font-bold text-white mt-1 leading-snug">
                              {r.message}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={r.status}
                              onChange={(e) =>
                                void handleUpdateReportStatus(
                                  r.id,
                                  e.target.value as 'open' | 'in_progress' | 'resolved'
                                )
                              }
                              className="bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-cyan-400"
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>

                            <button
                              type="button"
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Delete Feedback Report',
                                  description: 'Are you sure you want to remove this report from the archive?',
                                  actionType: 'deleteReport',
                                  targetId: r.id,
                                })
                              }
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              title="Delete Report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
                          <div>
                            <span>SUBMITTED BY: </span>
                            <strong className="text-slate-200">{r.name || 'Anonymous Gamer'}</strong>
                            {r.email && <span> ({r.email})</span>}
                          </div>

                          <div>{new Date(r.created_at).toLocaleString()}</div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: GAME CATALOGUE */}
            {activeTab === 'games' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black font-gaming text-white uppercase">
                      ACTIVE GAME CATALOGUE ({games.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Manage official games deployed across the Play Arena homepage.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {games.map((g) => (
                    <div
                      key={g.id}
                      className="rounded-2xl border border-white/10 bg-[#080C1B] overflow-hidden flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden">
                        <img
                          src={g.imageUrl}
                          alt={g.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-cyan-300 font-bold uppercase">
                          {g.genre}
                        </div>
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold">
                          ★ {g.rating}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-gaming font-black text-lg text-white uppercase">{g.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {g.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/5 space-y-2 text-xs font-mono">
                          <div className="flex justify-between text-slate-400">
                            <span>DEVELOPER:</span>
                            <span className="text-slate-200">{g.developer || 'Play Arena'}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>PLATFORMS:</span>
                            <span className="text-slate-200">{g.platforms.join(', ')}</span>
                          </div>
                          {g.officialUrl && (
                            <div className="pt-2">
                              <a
                                href={g.officialUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-gaming font-bold"
                              >
                                <span>OFFICIAL SOURCE LINK</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: TOURNAMENTS & SQUADS */}
            {activeTab === 'tournaments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black font-gaming text-white uppercase">
                  COMPETITIVE SQUAD REGISTRATIONS ({registrations.length})
                </h3>

                {registrations.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-white/10 bg-[#080C1B] text-center text-slate-500">
                    No squads have registered for tournaments yet. Registrations submitted through the website will appear here.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-[#080C1B] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                            <th className="py-3 px-4">Squad Name</th>
                            <th className="py-3 px-4">Tournament</th>
                            <th className="py-3 px-4">Captain Discord</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Registered Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-xs">
                          {registrations.map((t) => (
                            <tr key={t.id}>
                              <td className="py-3.5 px-4 font-bold font-sans text-white text-sm">
                                {t.team_name}
                              </td>
                              <td className="py-3.5 px-4 text-cyan-300">{t.tournament_title}</td>
                              <td className="py-3.5 px-4 text-slate-300">{t.captain_discord}</td>
                              <td className="py-3.5 px-4 uppercase text-emerald-400 font-bold">
                                {t.status}
                              </td>
                              <td className="py-3.5 px-4 text-slate-500">
                                {new Date(t.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: NEWSLETTER SUBSCRIBERS */}
            {activeTab === 'subscribers' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black font-gaming text-white uppercase">
                  VIP NEWSLETTER ENLISTMENTS ({subscribers.length})
                </h3>

                {subscribers.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-white/10 bg-[#080C1B] text-center text-slate-500">
                    No newsletter subscriptions recorded yet.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-[#080C1B] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                            <th className="py-3 px-4">Subscriber Email</th>
                            <th className="py-3 px-4">Enlistment Date</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-xs">
                          {subscribers.map((s) => (
                            <tr key={s.id}>
                              <td className="py-3.5 px-4 text-white font-bold">{s.email}</td>
                              <td className="py-3.5 px-4 text-slate-400">
                                {new Date(s.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmModal({
                                      isOpen: true,
                                      title: 'Remove Subscriber',
                                      description: `Remove ${s.email} from the mailing list?`,
                                      actionType: 'deleteSubscriber',
                                      targetId: s.id,
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: DATABASE & SQL GUIDE */}
            {activeTab === 'database' && (
              <div className="p-8 rounded-3xl border border-white/10 bg-[#080C1B] space-y-6">
                <div>
                  <h3 className="text-xl font-black font-gaming text-white uppercase flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-400" />
                    SUPABASE DATABASE ARCHITECTURE & RLS GUIDE
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Play Arena stores user accounts, feedback reports, games, and tournament data directly in PostgreSQL with Row Level Security.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="text-xs font-mono font-bold text-cyan-400 uppercase">1. Public Tables</div>
                    <ul className="text-xs font-mono text-slate-300 space-y-1 list-disc pl-4">
                      <li><code>public.profiles</code> — User metadata, gamer tag, role ('user' | 'admin').</li>
                      <li><code>public.reports</code> — Public bug reports and feedback.</li>
                      <li><code>public.games</code> — Deployed AAA games and official links.</li>
                      <li><code>public.tournament_registrations</code> — Squad entries.</li>
                      <li><code>public.newsletter_subscribers</code> — VIP mailing list.</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="text-xs font-mono font-bold text-purple-400 uppercase">2. Security & RLS Policies</div>
                    <ul className="text-xs font-mono text-slate-300 space-y-1 list-disc pl-4">
                      <li>Non-admin users CANNOT modify the <code>role</code> column.</li>
                      <li>Admin rights are determined strictly on the database using <code>is_playarena_admin()</code>.</li>
                      <li>Passwords are stored securely in Supabase Auth (<code>auth.users</code>) with bcrypt/argon2 hashing and never visible.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-black/50 border border-purple-500/30 space-y-3">
                  <div className="text-xs font-mono font-bold text-purple-300 uppercase">
                    Admin Promotion SQL Query
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-cyan-300 overflow-x-auto select-all">
{`-- Run this query in your Supabase Dashboard > SQL Editor:
UPDATE public.profiles
SET role = 'admin'
WHERE email = '${currentAdminEmail || 'your-registered-email@example.com'}';`}
                  </pre>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs font-mono font-bold text-amber-300 uppercase mb-2">
                      Leaderboard Public RPC Migration
                    </div>
                    <p className="text-xs text-slate-400 mb-2 font-mono">
                      To publish real registered players to website visitors without exposing user emails, execute the migration script in <code>supabase/leaderboard_migration.sql</code>.
                    </p>
                    <pre className="p-3 rounded-xl bg-slate-950 border border-white/10 text-[11px] font-mono text-emerald-300 overflow-x-auto select-all">
{`-- Run in Supabase SQL Editor:
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wins integer DEFAULT null,
  ADD COLUMN IF NOT EXISTS xp integer DEFAULT null,
  ADD COLUMN IF NOT EXISTS level integer DEFAULT null,
  ADD COLUMN IF NOT EXISTS win_rate text DEFAULT null,
  ADD COLUMN IF NOT EXISTS primary_game text DEFAULT null,
  ADD COLUMN IF NOT EXISTS badge text DEFAULT null,
  ADD COLUMN IF NOT EXISTS avatar_color text DEFAULT null,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.get_leaderboard_players()
RETURNS TABLE (
  id uuid, gamer_tag text, role text, created_at timestamptz,
  wins integer, xp integer, level integer, win_rate text,
  primary_game text, badge text, avatar_color text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS \$\$
BEGIN
  RETURN QUERY
  SELECT p.id,
    COALESCE(NULLIF(TRIM(p.gamer_tag), ''), 'Gamer #' || SUBSTRING(p.id::text FROM 1 FOR 4)),
    p.role, p.created_at, p.wins, p.xp, p.level, p.win_rate, p.primary_game, p.badge, p.avatar_color
  FROM public.profiles p
  ORDER BY COALESCE(p.wins, 0) DESC, COALESCE(p.xp, 0) DESC, p.created_at ASC;
END; \$\$;

REVOKE ALL ON FUNCTION public.get_leaderboard_players() FROM public;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_players() TO anon, authenticated;`}
                    </pre>
                  </div>

                                    <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white font-gaming text-xs font-bold uppercase shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  >
                    <span>OPEN SUPABASE DASHBOARD</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#090D1E] border border-purple-500/40 p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-gaming font-black text-lg text-white uppercase">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {confirmModal.description}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-gaming font-bold text-slate-300 uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void executeConfirmedAction()}
                className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-gaming font-black uppercase shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Inspection Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#090D1E] border border-cyan-400/40 p-6 shadow-[0_0_50px_rgba(0,240,255,0.25)] relative space-y-4">
            <button
              type="button"
              onClick={() => setSelectedUserDetail(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-400/20 border border-cyan-400 flex items-center justify-center font-gaming text-lg font-bold text-cyan-300">
                {(selectedUserDetail.gamer_tag || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-gaming font-bold text-lg text-white">{selectedUserDetail.gamer_tag}</h4>
                <div className="text-xs font-mono text-cyan-400 uppercase">{selectedUserDetail.role} ACCOUNT</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">EMAIL:</span>
                <span className="text-slate-200">{selectedUserDetail.email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ACCOUNT CREATED:</span>
                <span className="text-slate-200">
                  {new Date(selectedUserDetail.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">USER ID:</span>
                <span className="text-slate-400 break-all">{selectedUserDetail.id}</span>
              </div>
            </div>

            {/* Competitive Stats Section */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-2 text-xs font-mono">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>LEADERBOARD COMPETITIVE STATS</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-500 block">LEVEL:</span>
                  <span className="text-slate-200 font-bold">
                    {selectedUserDetail.level !== null && selectedUserDetail.level !== undefined ? `LVL ${selectedUserDetail.level}` : 'Unranked'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">WINS:</span>
                  <span className="text-slate-200 font-bold">
                    {selectedUserDetail.wins !== null && selectedUserDetail.wins !== undefined ? selectedUserDetail.wins.toLocaleString() : 'No matches'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">XP:</span>
                  <span className="text-cyan-300 font-bold">
                    {selectedUserDetail.xp !== null && selectedUserDetail.xp !== undefined ? String(selectedUserDetail.xp) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">WIN RATE:</span>
                  <span className="text-emerald-400 font-bold">{selectedUserDetail.win_rate || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">PRIMARY GAME:</span>
                  <span className="text-slate-200">{selectedUserDetail.primary_game || 'Play Arena'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">BADGE:</span>
                  <span className="text-amber-400 font-bold">
                    {selectedUserDetail.badge || (selectedUserDetail.role === 'admin' ? 'Arena Admin' : 'Registered Gamer')}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedUserDetail(null)}
              className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-gaming text-xs font-black uppercase"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}

      {/* Player Stats Editor Modal */}
      {editingUserStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#090D1E] border border-cyan-400/40 p-6 shadow-[0_0_50px_rgba(0,240,255,0.25)] relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setEditingUserStats(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-gaming font-black text-lg text-white uppercase">
                  EDIT PLAYER & LEADERBOARD STATS
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  {editingUserStats.email || editingUserStats.id}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">GAMER TAG</label>
                <input
                  type="text"
                  value={statsForm.gamer_tag}
                  onChange={(e) => setStatsForm({ ...statsForm, gamer_tag: e.target.value })}
                  placeholder="e.g. PhoenixGamer"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">TOTAL WINS</label>
                  <input
                    type="number"
                    value={statsForm.wins}
                    onChange={(e) => setStatsForm({ ...statsForm, wins: e.target.value })}
                    placeholder="e.g. 150"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">LEVEL</label>
                  <input
                    type="number"
                    value={statsForm.level}
                    onChange={(e) => setStatsForm({ ...statsForm, level: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">XP EARNED</label>
                  <input
                    type="number"
                    value={statsForm.xp}
                    onChange={(e) => setStatsForm({ ...statsForm, xp: e.target.value })}
                    placeholder="e.g. 85000"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">WIN RATE</label>
                  <input
                    type="text"
                    value={statsForm.win_rate}
                    onChange={(e) => setStatsForm({ ...statsForm, win_rate: e.target.value })}
                    placeholder="e.g. 72.4%"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">PRIMARY GAME</label>
                  <input
                    type="text"
                    value={statsForm.primary_game}
                    onChange={(e) => setStatsForm({ ...statsForm, primary_game: e.target.value })}
                    placeholder="e.g. VALORANT"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">BADGE / RANK TITLE</label>
                  <input
                    type="text"
                    value={statsForm.badge}
                    onChange={(e) => setStatsForm({ ...statsForm, badge: e.target.value })}
                    placeholder="e.g. Apex Predator, Gladiator"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingUserStats(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-gaming font-bold text-slate-300 uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSaveStats()}
                className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-gaming font-black uppercase shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              >
                Save Player Stats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Auth Modal for In-Admin Authentication */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => {
          setIsAuthModalOpen(false);
          void loadAdminData();
        }}
        initialMode="signin"
      />
    </div>
  );
};

