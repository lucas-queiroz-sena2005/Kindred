import pool from "../db.js";
import { directors, templates, users, rankings } from "./data.js";
import { buildBulkInsertPlaceholders } from "./utils.js";
import * as tierlistService from "../../services/tierlistService.js";
import { PoolClient } from "pg";
import {
  seedDirectorAndMovies,
  seedGenres,
  seedMovieByTmdbId,
} from "./tmdb.js";

async function seedMoviesFromTmdb(
  client: PoolClient,
): Promise<Map<number, number>> {
  console.log("--- Seeding movies from TMDB (by director) ---");
  const allTmdbIdToIdMap = new Map<number, number>();

  for (const director of directors) {
    const { tmdbIdToIdMap } = await seedDirectorAndMovies(
      client,
      director.id,
    );
    for (const [tmdbId, id] of tmdbIdToIdMap) {
      allTmdbIdToIdMap.set(tmdbId, id);
    }
  }
  console.log("--- Finished seeding movies from TMDB (by director) ---");

  return allTmdbIdToIdMap;
}

async function seedTemplates(
  client: PoolClient,
  tmdbIdToIdMap: Map<number, number>,
) {
  console.log("--- Seeding tierlist templates ---");
  const templateIds: { [key: string]: number } = {};

  for (const template of templates) {
    const res = await client.query(
      `--sql
      INSERT INTO tierlist_templates (id, title, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description
      RETURNING id
      `,
      [template.id, template.title, `A tierlist for ${template.title}`],
    );
    const templateId = res.rows[0].id;
    templateIds[template.title] = templateId;
    console.log(`  Mapped template: "${template.title}" to ID: ${templateId}`);

    if (template.movieIds.length > 0) {
      const templateMovieValues = template.movieIds
        .map((tmdbId) => {
          const movieId = tmdbIdToIdMap.get(tmdbId);
          if (movieId) {
            return [templateId, movieId];
          }
          return [];
        })
        .filter((v) => v.length > 0);

      if (templateMovieValues.length > 0) {
        const placeholders = buildBulkInsertPlaceholders(
          templateMovieValues.length,
          2,
        );
        const insertQuery = `--sql
          INSERT INTO template_movies (template_id, movie_id)
          VALUES ${placeholders}
          ON CONFLICT (template_id, movie_id) DO NOTHING
        `;
        await client.query(insertQuery, templateMovieValues.flat());
      }
    }
  }
  console.log(`Seeded ${templates.length} templates.`);
  
  await client.query(`SELECT setval('tierlist_templates_id_seq', (SELECT MAX(id) FROM tierlist_templates));`);
  console.log("Synchronized 'tierlist_templates_id_seq' sequence.");

  return templateIds;
}

async function seedTmdbConfig(client: PoolClient) {
  console.log("--- Seeding TMDB config ---");
  const base_url = "http://image.tmdb.org/t/p/";
  const secure_base_url = "https://image.tmdb.org/t/p/";
  const poster_sizes = [
    "w92",
    "w154",
    "w185",
    "w342",
    "w500",
    "w780",
    "original",
  ];

  await client.query(
    `INSERT INTO tmdb_config (id, base_url, secure_base_url, poster_sizes, updated_at)
     VALUES (1, $1, $2, $3, NOW())
     ON CONFLICT (id) DO UPDATE SET
     base_url = EXCLUDED.base_url,
     secure_base_url = EXCLUDED.secure_base_url,
     poster_sizes = EXCLUDED.poster_sizes,
     updated_at = NOW()`,
    [base_url, secure_base_url, poster_sizes],
  );
  console.log("Seeded TMDB config.");
}

import bcrypt from "bcryptjs"; // Need to import bcrypt for hashing

async function seedUsersAndGetIds(
  client: PoolClient,
): Promise<{ [key: string]: number }> {
  console.log("--- Seeding users ---");
  const userIds: { [key: string]: number } = {};

  const userValues = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash("password123", 10); // Hash the default password
      // Generate a random 256-dimension vector for the profile
      const profileVector = Array.from({ length: 256 }, () => Math.random());
      return [
        user.username,
        user.email,
        hashedPassword,
        `[${profileVector.join(",")}]`,
        user.id,
      ];
    }),
  );

  const placeholders = buildBulkInsertPlaceholders(userValues.length, 5);
  const query = `--sql
        INSERT INTO users (username, email, password_hash, profile_vector, id)
        VALUES ${placeholders}
        ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            profile_vector = EXCLUDED.profile_vector
        RETURNING id, username
    `;

  const res = await client.query(query, userValues.flat());

  res.rows.forEach((row) => {
    userIds[row.username] = row.id;
    console.log(`Upserted user: ${row.username} (id: ${row.id})`);
  });

  console.log(`Upserted ${Object.keys(userIds).length} users.`);
  
  await client.query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));`);
  console.log("Synchronized 'users_id_seq' sequence.");

  return userIds;
}

async function seedRankings(
  userIds: { [key: string]: number },
  templateIds: { [key: string]: number },
  tmdbIdToIdMap: Map<number, number>,
) {
  // Correction for Leo Morales' ranking of T2
  const correctedRankings = rankings.map((r) => {
    if (r.userId === 10 && r.templateId === 2) {
      return {
        ...r,
        rankedItems: r.rankedItems.map((item) =>
          item.movieId === 872585 ? { ...item, movieId: 106646 } : item,
        ),
      };
    }
    return r;
  });

  for (const ranking of correctedRankings) {
    const user = users.find((u) => u.id === ranking.userId);
    const template = templates.find((t) => t.id === ranking.templateId);
    if (user && template) {
      const userId = userIds[user.username];
      const templateId = templateIds[template.title];
      if (userId && templateId) {
        console.log(
          `--- Seeding ranking for user ${user.username} on template ${template.title} (ID: ${templateId}) ---`,
        );
        await tierlistService.saveUserRanking(
          userId,
          templateId,
          ranking.rankedItems
            .map((item) => {
              const movieId = tmdbIdToIdMap.get(item.movieId);
              if (movieId) {
                return { movieId, tier: item.tier };
              }
              return null;
            })
            .filter((item): item is { movieId: number; tier: number } => !!item),
        );
      }
    }
  }
  console.log(`Seeded rankings.`);
}

export async function seedNewData() {
  const client = await pool.connect();
  let userIds: { [key: string]: number } = {};
  let templateIds: { [key: string]: number } = {};
  let tmdbIdToIdMap: Map<number, number> = new Map();

  try {
    await client.query("BEGIN");
    await seedGenres(client);
    tmdbIdToIdMap = await seedMoviesFromTmdb(client);

    const allTmdbIds = [
      ...new Set([
        ...templates.flatMap((t) => t.movieIds),
        ...rankings.flatMap((r) => r.rankedItems.map((i) => i.movieId)),
      ]),
    ];

    const missingTmdbIds = allTmdbIds.filter((id) => !tmdbIdToIdMap.has(id));

    if (missingTmdbIds.length > 0) {
      console.log(
        `--- Seeding ${missingTmdbIds.length} additional movies... ---`,
      );
      for (const tmdbId of missingTmdbIds) {
        const newMap = await seedMovieByTmdbId(client, tmdbId);
        for (const [newTmdbId, newId] of newMap) {
          tmdbIdToIdMap.set(newTmdbId, newId);
        }
      }
    }

    templateIds = await seedTemplates(client, tmdbIdToIdMap);
    console.log("Finished seeding templates.");

    // Verify templates in database
    const dbTemplates = await client.query(
      `SELECT id, title FROM tierlist_templates ORDER BY id ASC;`,
    );
    console.log("Templates currently in DB:", dbTemplates.rows);

    await seedTmdbConfig(client);
    userIds = await seedUsersAndGetIds(client);
    
    await client.query("COMMIT");
    console.log("\n✅ Main database seeding complete!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error during main database seeding:", err);
    throw err;
  } finally {
    client.release();
  }

  // Seed rankings in a separate step after the main transaction is committed
  try {
    await seedRankings(userIds, templateIds, tmdbIdToIdMap);
    console.log("\n✅ Rankings seeding complete!");
  } catch(err) {
    console.error("Error during rankings seeding:", err);
    // Not re-throwing, as the main seeding is already done.
  }
}
