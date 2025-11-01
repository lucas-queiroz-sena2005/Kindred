export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
}

/**
 * Represents a movie within a specific tierlist response, which may include
 * the tier it has been ranked in.
 */
export interface RankedMovie extends Movie {
  tier: number | null;
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
  movies: RankedMovie[];
}

/**
 * Represents a summary of a tierlist, used in list views.
 * It omits heavier fields like `movies` and adds user-specific metadata.
 */
export interface TierListSummary extends Omit<TierListData, "movies"> {
  isRanked: boolean;
  updatedAt: string | null; // The date the user last ranked it
}

/**
 * Represents the complete state of a tier list, including all ranked tiers
 * and a dedicated tier for unranked items. The keys are tier IDs (e.g., "S", "A", "unranked").
 */

/**
 * Represents the payload sent to the API when saving a user's ranking.
 */
export interface TierlistResponse {
  rankedItems: { movieId: number; tier: number }[];
  templateId: number;
  
}
export type TierState = Record<string, Tier>;
