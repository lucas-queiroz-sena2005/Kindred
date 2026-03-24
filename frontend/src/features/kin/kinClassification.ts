export interface KinClassification {
  label: string;
  tagline: string;
}

const BANDS: { max: number; label: string; tagline: string }[] = [
  {
    max: 0.2,
    label: "Opposite reels",
    tagline: "Contrasting taste — you rarely pick the same lane.",
  },
  {
    max: 0.4,
    label: "Different aisles",
    tagline: "Some overlap, but your marquees don’t match often.",
  },
  {
    max: 0.6,
    label: "Shared screen",
    tagline: "Solid middle ground — familiar but not identical.",
  },
  {
    max: 0.8,
    label: "Strong kinship",
    tagline: "You’d argue about the same films at the same volume.",
  },
  {
    max: 1.01,
    label: "Same marquee",
    tagline: "Rare alignment — you’re pulling from the same playlist.",
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
