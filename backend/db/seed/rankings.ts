import { saveUserRanking } from "../../services/tierlistService.js";

export async function seedUserRanking(
  userId: number,
  templateId: number,
  movieIds: number[],
) {
  console.log(
    `--- Seeding ranking for user ${userId} on template ${templateId} ---`,
  );

  const rankedItems = movieIds.map((movieId) => ({
    movieId,
    tier: Math.floor(Math.random() * 6), // Random tier 0-5
  }));

  await saveUserRanking(userId, templateId, rankedItems);

  console.log(`Seeded ${movieIds.length} ranked items.`);
}
