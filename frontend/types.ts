
export interface Anime {
  id: string;
  malId?: number; // MyAnimeList ID for external linking
  title: string;
  description: string;
  thumbnail: string;
  gallery?: string[];
  rating: number;
  episodes: number;
  type: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special' | string;
  status: 'Ongoing' | 'Completed' | string;
  genres: string[];
  // Extended fields from Jikan
  year?: number;
  season?: string;
  studios?: string[];
  source?: string;
  duration?: string;
  airedFrom?: string;
  airedTo?: string;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
}

export interface Episode {
  number: number;
  title: string;
  titleJapanese?: string;
  titleRomanji?: string;
  duration?: string;
  thumbnail?: string;
  aired?: string;
  filler?: boolean;
  recap?: boolean;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  date: string;
}

// History entry for Continue Watching
export interface WatchHistoryEntry {
  id: string;
  animeId: string;
  animeTitle: string;
  animeThumbnail: string;
  episodeNumber: number;
  episodeTitle?: string;
  progress: number; // seconds watched
  duration: number; // total seconds
  lastWatched: string; // ISO date
  userId: string;
}

// Favorite/Watchlist entry
export interface FavoriteEntry {
  id: string;
  animeId: string;
  animeTitle: string;
  animeThumbnail: string;
  userId: string;
  createdAt: string;
}

// User profile
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  createdAt: string;
  preferences?: {
    theme?: 'dark' | 'light';
    language?: string;
    autoplay?: boolean;
    notifications?: boolean;
  };
}
