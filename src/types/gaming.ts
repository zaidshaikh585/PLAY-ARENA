export interface Game {
  id: string;
  title: string;
  genre: string;
  rating: number;
  playerCount: string;
  platforms: string[];
  description: string;
  bannerGradient: string;
  accentColor: string;
  releaseDate?: string;
  developer?: string;
  badge?: string;
  storage?: string;
  trailerTitle?: string;
  imageUrl?: string;
  officialSource?: string;
  svgArtwork: 'fps' | 'tactical' | 'racing' | 'rpg' | 'battleroyale' | 'scifi' | 'horror' | 'sports';
  officialUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  tagline: string;
  gameCount: number;
  icon: string;
  gradient: string;
  accent: string;
  bgPattern: string;
  imageUrl?: string;
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  prizePool: string;
  date: string;
  teams: number;
  maxTeams: number;
  status: 'Registration Open' | 'Filling Fast' | 'Live Now';
  format: string;
  entryFee: string;
  accentColor: string;
  imageUrl?: string;
  officialGame?: string;
}

export interface PlayerRank {
  rank: number;
  handle: string;
  realName: string;
  avatarColor: string;
  level: number;
  wins: number;
  xp: string;
  winRate: string;
  primaryGame: string;
  badge: 'Apex Predator' | 'Grandmaster' | 'Warlord' | 'Elite' | 'Challenger';
}

export interface NewsArticle {
  id: string;
  title: string;
  category: 'ESPORTS' | 'RELEASE' | 'TECH' | 'COMMUNITY' | 'UPDATE';
  date: string;
  readTime: string;
  description: string;
  author: string;
  tag: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  gamer_tag: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at?: string;
}

export interface ReportItem {
  id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  category: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
}

export interface TournamentRegistrationRecord {
  id: string;
  user_id: string | null;
  tournament_id: string;
  tournament_title: string;
  team_name: string;
  captain_discord: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
}

export interface NewsletterSubscriberRecord {
  id: string;
  email: string;
  created_at: string;
}

