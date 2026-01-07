import { PoolClient } from "pg";

export async function clearDatabase(client: PoolClient) {
  console.log("--- Clearing database ---");
  await client.query(
    `--sql
    TRUNCATE TABLE ranked_items, user_rankings, template_movies, movie_genres, messages RESTART IDENTITY CASCADE`,
  );
  await client.query(
    `--sql
    TRUNCATE TABLE users, movies, directors, genres, tierlist_templates RESTART IDENTITY CASCADE`,
  );
  console.log("Database cleared.");
}
