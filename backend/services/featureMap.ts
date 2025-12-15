export const VECTOR_DIMENSION = 256;
export const k_DAMPENING_FACTOR = 3;

// Tier weight map 'tier' (0-5)
export const TIER_WEIGHTS = {
  0: 3,  // S
  1: 2,  // A
  2: 1,  // B
  3: 0,  // C
  4: -1, // D
  5: -2  // F
};

export type FeatureName = "genre" | "decade" | "director";

export const FEATURE_CONFIG: Record<FeatureName, { slice: string }> = {
  genre:    { slice: '[0:18]' },
  decade:   { slice: '[19:29]' },
  director: { slice: '[30:255]' },
};

export const FEATURE_NAMES = Object.keys(FEATURE_CONFIG) as FeatureName[];

export const FEATURE_MAP = {
  'Action': 0,
  'Comedy': 1,
  'Drama': 2,
  'Fantasy': 3,
  'Horror': 4,
  'Mystery': 5,
  'Romance': 6,
  'Thriller': 7,
  'Western': 8,
  'Science Fiction': 9,
  'Adventure': 10,
  'Animation': 11,
  'Crime': 12,
  'Family': 13,
  'History': 14,
  'Music': 15,
  'War': 16,
  'Documentary': 17,
  'TV Movie': 18,

  // Decades
  '1920': 19,
  '1930': 20,
  '1940': 21,
  '1950': 22,
  '1960': 23,
  '1970': 24,
  '1980': 25,
  '1990': 26,
  '2000': 27,
  '2010': 28,
  '2020': 29,

  // Directors
  'Christopher Nolan': 30,
  'Denis Villeneuve': 31,
  'Martin Scorsese': 32,
  // ... (etc.)
};
