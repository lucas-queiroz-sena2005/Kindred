/**
 * Represents a single movie with its essential details.
 */
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_year: number;
}

/**
 * Represents a movie within a specific tierlist response, which may include
 * the tier it has been ranked in.
 */
export interface RankedMovie extends Movie {
  tier: number | null;
}

/**
 * Defines the structure of a single tier in the tierlist,
 * including its identifier, display title, and the movies it contains.
 */
export interface Tier {
  id: string;
  title: string;
  items: Movie[];
}

/**
 * Represents the detailed data for a specific tierlist template,
 * including its metadata and the list of movies to be ranked.
 */
export interface TierListData {
  id: number;
  title: string;
  description: string;
  movies: RankedMovie[];
}

/**
 * Represents a summary of a tierlist, used in list views.
 * It omits heavier fields like `movies` and includes user-specific metadata.
 */
export type TierListSummary = Omit<TierListData, "movies"> & {
  updatedAt: string | null;
  isRanked: boolean;
};

/**
 * Represents the payload sent to the API when saving a user's ranking.
 */
export interface TierlistResponse {
  rankedItems: { movieId: number; tier: number }[];
  templateId: number;
}

/**
 * Represents the UI state of a tier list, mapping tier IDs to tier objects.
 * This is useful for managing the drag-and-drop interface.
 * The keys are tier IDs (e.g., "S", "A", "unranked").
 */
export type TierState = Record<string, Tier>;
