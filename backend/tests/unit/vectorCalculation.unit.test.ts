import { describe, it, expect } from "vitest";
import {
  aggregateFeatureScores,
  calculateDampenedVector,
} from "../../services/vectorService.js";
import type { UserRankingFeature } from "../../services/vectorService.js";
import {
  FEATURE_MAP,
  VECTOR_DIMENSION,
  k_DAMPENING_FACTOR,
  TIER_WEIGHTS,
} from "../../services/featureMap.js";

describe("aggregateFeatureScores", () => {
  it("aggregates feature scores correctly", () => {
    const userRankings: UserRankingFeature[] = [
      { tier: 1, features: ["Action", "Christopher Nolan"] },
      { tier: 2, features: ["Action"] },
    ];

    const weightTier1 = TIER_WEIGHTS[1];
    const weightTier2 = TIER_WEIGHTS[2];

    const expectedScores = new Array(VECTOR_DIMENSION).fill(0);
    const expectedCounts = new Array(VECTOR_DIMENSION).fill(0);

    const idxAction = FEATURE_MAP["Action" as keyof typeof FEATURE_MAP];
    const idxNolan =
      FEATURE_MAP["Christopher Nolan" as keyof typeof FEATURE_MAP];

    expectedScores[idxAction] = weightTier1 + weightTier2;
    expectedCounts[idxAction] = 2;

    expectedScores[idxNolan] = weightTier1;
    expectedCounts[idxNolan] = 1;

    const result = aggregateFeatureScores(userRankings);

    expect(result).toEqual({
      total_score_vector: expectedScores,
      feature_count_vector: expectedCounts,
    });
  });

  it("ignores features that are not defined in the FEATURE_MAP", () => {
    const userRankings: UserRankingFeature[] = [
      { tier: 1, features: ["Action", "Some_Obscure_Indie_Director"] },
    ];

    const result = aggregateFeatureScores(userRankings);

    const actionIdx = FEATURE_MAP["Action" as keyof typeof FEATURE_MAP];
    expect(result.total_score_vector[actionIdx]).toBe(TIER_WEIGHTS[1]);

    const nonZeroScores = result.total_score_vector.filter(
      (score) => score !== 0,
    );
    expect(nonZeroScores.length).toBe(1);
  });

  it("handles undefined or invalid tiers by using a weight of 0", () => {
    const userRankings: UserRankingFeature[] = [
      { tier: 999, features: ["Action"] },
    ];

    const result = aggregateFeatureScores(userRankings);

    const actionIdx = FEATURE_MAP["Action" as keyof typeof FEATURE_MAP];

    expect(result.total_score_vector[actionIdx]).toBe(0);
    expect(result.feature_count_vector[actionIdx]).toBe(1);
  });

  it("returns zeroed vectors when the input array is empty", () => {
    const result = aggregateFeatureScores([]);

    expect(result.total_score_vector).toHaveLength(VECTOR_DIMENSION);
    expect(result.total_score_vector.every((val) => val === 0)).toBe(true);
    expect(result.feature_count_vector.every((val) => val === 0)).toBe(true);
  });

  it("does not increment vectors if the features array is empty", () => {
    const userRankings: UserRankingFeature[] = [{ tier: 1, features: [] }];

    const result = aggregateFeatureScores(userRankings);

    expect(result.total_score_vector.every((val) => val === 0)).toBe(true);
    expect(result.feature_count_vector.every((val) => val === 0)).toBe(true);
  });
});

describe("calculateDampenedVector", () => {
  // Constants for manual math verification
  const k = k_DAMPENING_FACTOR;

  it("calculates dampened scores correctly for different counts", () => {
    const scores = new Array(VECTOR_DIMENSION).fill(0);
    const counts = new Array(VECTOR_DIMENSION).fill(0);

    const idxLow = 0;
    const idxHigh = 1;

    // Setup: One feature with 1 hit, one with 100 hits, to test dampening
    scores[idxLow] = 10;
    counts[idxLow] = 1;

    scores[idxHigh] = 1000;
    counts[idxHigh] = 100;

    const result = calculateDampenedVector(scores, counts);

    // Assert Low Count: 10 / (5 + 1) = 1.666...
    expect(result[idxLow]).toBeCloseTo(10 / (k + 1), 5);

    // Assert High Count: 1000 / (5 + 100) = 9.523...
    expect(result[idxHigh]).toBeCloseTo(1000 / (k + 100), 5);
  });

  it("leaves indices as 0 if the feature count is 0", () => {
    const scores = new Array(VECTOR_DIMENSION).fill(0);
    const counts = new Array(VECTOR_DIMENSION).fill(0);

    // Even if there's a "ghost" score, if count is 0, result must be 0
    scores[5] = 500;
    counts[5] = 0;

    const result = calculateDampenedVector(scores, counts);
    expect(result[5]).toBe(0);
  });

  it("calculates dampening for every dimension in a fully populated vector", () => {
    const scores = new Array(VECTOR_DIMENSION).fill(100);
    const counts = new Array(VECTOR_DIMENSION).fill(10);

    const result = calculateDampenedVector(scores, counts);

    const expectedValue = 100 / (k_DAMPENING_FACTOR + 10);

    expect(result).toHaveLength(VECTOR_DIMENSION);
    // Checks first, middle, and last values
    expect(result[0]).toBeCloseTo(expectedValue, 5);
    expect(result[Math.floor(VECTOR_DIMENSION / 2)]).toBeCloseTo(
      expectedValue,
      5,
    );
    expect(result[VECTOR_DIMENSION - 1]).toBeCloseTo(expectedValue, 5);
  });

  it("significantly dampens high scores with low counts (noise reduction)", () => {
    const scores = new Array(VECTOR_DIMENSION).fill(0);
    const counts = new Array(VECTOR_DIMENSION).fill(0);

    scores[10] = 50;
    counts[10] = 1;

    const result = calculateDampenedVector(scores, counts);

    const rawAverage = 50 / 1;
    const dampenedValue = 50 / (k_DAMPENING_FACTOR + 1);

    expect(result[10]).toBeLessThan(rawAverage);
    expect(result[10]).toBeCloseTo(dampenedValue, 5);
  });

  it("maintains zeros for all indices without counts in a sparse input", () => {
    const scores = new Array(VECTOR_DIMENSION).fill(50); // Every index has a score
    const counts = new Array(VECTOR_DIMENSION).fill(0); // But NO index has a count

    // Only index 42 has a valid count
    counts[42] = 5;

    const result = calculateDampenedVector(scores, counts);
    expect(result[42]).toBe(50 / (k_DAMPENING_FACTOR + 5));

    // Every other index must be exactly 0 because count was 0
    const zeroIndices = result.filter((val, i) => i !== 42);
    expect(zeroIndices.every((val) => val === 0)).toBe(true);
  });

  it("handles extreme values without returning NaN or Infinity", () => {
    const scores = new Array(VECTOR_DIMENSION).fill(0);
    const counts = new Array(VECTOR_DIMENSION).fill(0);

    scores[0] = 0.000001;
    counts[0] = 1;

    scores[1] = 1000000;
    counts[1] = 1000000;

    const result = calculateDampenedVector(scores, counts);

    expect(Number.isFinite(result[0])).toBe(true);
    expect(Number.isFinite(result[1])).toBe(true);
    expect(result[0]).toBeGreaterThan(0);
  });
});
