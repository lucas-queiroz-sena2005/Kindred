import bcrypt from "bcryptjs";
import { PoolClient } from "pg";
import { buildBulkInsertPlaceholders } from "./utils.js";

export async function seedUsers(client: PoolClient): Promise<number[]> {
  console.log("--- Seeding users ---");
  const usersToSeed = [
    { username: "testuser", email: "test@gmail.com", password: "test123" },
    { username: "user2", email: "user2@test.com", password: "password123" },
    { username: "user3", email: "user3@test.com", password: "password123" },
    { username: "user4", email: "user4@test.com", password: "password123" },
  ];

  const userValues = await Promise.all(
    usersToSeed.map(async (user) => {
      const hash = await bcrypt.hash(user.password, 10);
      console.log(`Seeded ${user.username} (pw: ${user.password})`);
      // Generate a random 256-dimension vector for the profile
      const profileVector = Array.from({ length: 256 }, () => Math.random());
      return [user.username, user.email, hash, `[${profileVector.join(",")}]`];
    }),
  );

  const placeholders = buildBulkInsertPlaceholders(userValues.length, 4);
  const query = `--sql
    INSERT INTO users (username, email, password_hash, profile_vector)
    VALUES ${placeholders}
    ON CONFLICT (username) DO UPDATE SET
      email = EXCLUDED.email,
      password_hash = EXCLUDED.password_hash,
      profile_vector = EXCLUDED.profile_vector
    RETURNING id -- This will now work even on conflict
  `;

  const res = await client.query(query, userValues.flat());
  const userIds = res.rows.map((row) => row.id);
  console.log(`Upserted ${userIds.length} users with profile vectors.`);
  return userIds;
}
