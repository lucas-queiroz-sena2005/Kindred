import type { TierListData, TierState } from "../../../types/tierlist";
import { TIER_ORDER, API_TIER_ID_MAP, TMDB_IMAGE_BASE_URL } from "../constants/tier-constants";

/**
 * Transforms flat movie data from the API into a structured TierState object
 * that the UI components can render.
 *
 * @param tierListData - The raw data from the API.
 * @returns A TierState object with movies grouped into their respective tiers.
 */
export function transformToTierState(
  tierListData: TierListData
): TierState {
  // Initialize the tierState object with all required tiers.
  const tierState: TierState = {};
  for (const id of TIER_ORDER) {
    tierState[id] = {
      id: id,
      title: id === "unranked" ? "Unranked" : id,
      items: [],
    };
  }
  
  // Distribute movies into the appropriate tiers.
  for (const movie of tierListData.movies) {
    // Use the centralized map to find the tier ID. Default to "unranked".
    const tierId = movie.tier !== null ? API_TIER_ID_MAP[movie.tier] : "unranked";
    
    // Construct the full poster path.
    const transformedMovie = {
      ...movie,
      poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
    };
    tierState[tierId]?.items.push(transformedMovie);
  }

  return tierState;
}