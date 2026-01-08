
export interface Anime {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  rating: number;
  episodes: number;
  type: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special';
  status: 'Ongoing' | 'Completed';
  genres: string[];
}

export interface Episode {
  number: number;
  title: string;
  duration: string;
  thumbnail?: string;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  date: string;
}
