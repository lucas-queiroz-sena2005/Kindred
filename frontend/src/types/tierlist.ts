export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
}

export interface Tier {
  id: string;
  title: string;
  items: Movie[];
}

export interface TierListTemplateData {
  id: number;
  title: string;
  description: string;
  movies: Movie[];
}

export type TierState = Record<string, Tier>;