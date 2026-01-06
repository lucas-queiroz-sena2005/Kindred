/**
 * Defines the metadata for a single tier.
 */
export interface TierDefinition {
  id: string;
  title: string;
  colorClass: string;
}

/**
 * An array of standard tier definitions in their display order.
 */
export const TIERS: TierDefinition[] = [
  { id: "S", title: "S", colorClass: "bg-red-500" },
  { id: "A", title: "A", colorClass: "bg-orange-500" },
  { id: "B", title: "B", colorClass: "bg-yellow-500" },
  { id: "C", title: "C", colorClass: "bg-green-500" },
  { id: "D", title: "D", colorClass: "bg-blue-500" },
  { id: "F", title: "F", colorClass: "bg-gray-500" },
];

/**
 * The definition for the unranked tier.
 */
export const UNRANKED_TIER: TierDefinition = {
  id: "unranked",
  title: "Unranked",
  colorClass: "bg-gray-800",
};

/**
 * An array of all tier IDs in their intended display order.
 */
export const TIER_ORDER: string[] = [
  ...TIERS.map((t) => t.id),
  UNRANKED_TIER.id,
];

/**
 * Maps numeric tier value from the API (e.g., 0) to the string ID (e.g., "S").
 */
export const API_TIER_ID_MAP: Record<number, string> = Object.fromEntries(
  TIERS.map((t, i) => [i, t.id])
);
