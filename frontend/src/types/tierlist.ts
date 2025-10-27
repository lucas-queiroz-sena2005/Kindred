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

export interface TierListData {
  id: number;
  title: string;
  description: string;
  movies: Movie[];
}

/**
 * Represents a summary of a tierlist, used in list views.
 * It omits heavier fields like `movies` and adds user-specific metadata.
 */
export interface TierListSummary extends Omit<TierListData, "movies"> {
  isRanked: boolean;
  updatedAt: string | null; // The date the user last ranked it
}

export type TierState = Record<string, Tier>;