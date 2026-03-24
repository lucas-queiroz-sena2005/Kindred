export interface KinClassification {
  label: string;
  tagline: string;
}

const BANDS: { max: number; label: string; tagline: string }[] = [
  {
    max: 0.2,
    label: "Very different taste (under ~20% match)",
    tagline: "You rarely agree on what to watch; preferences point opposite ways.",
  },
  {
    max: 0.4,
    label: "Mostly different (~20–40%)",
    tagline: "A little overlap, but you usually drift toward different kinds of films.",
  },
  {
    max: 0.6,
    label: "Somewhat similar (~40–60%)",
    tagline: "You share a middle ground—familiar territory, not identical picks.",
  },
  {
    max: 0.8,
    label: "Quite similar (~60–80%)",
    tagline: "Strong overlap; you’d often recommend the same movies to each other.",
  },
  {
    max: 1.01,
    label: "Extremely similar (about 80%+)",
    tagline: "Very close taste—your rankings line up far more often than average.",
  },
];

export function getKinClassification(similarityScore: number): KinClassification {
  const s =
    typeof similarityScore === "number" && Number.isFinite(similarityScore)
      ? Math.min(1, Math.max(0, similarityScore))
      : 0.5;

  const band = BANDS.find((b) => s < b.max) ?? BANDS[BANDS.length - 1];
  return { label: band.label, tagline: band.tagline };
}
