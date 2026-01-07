import pool from "../db.js";
import { directors, movies, templates, users, rankings } from "./data.js";
import { buildBulkInsertPlaceholders } from "./utils.js";
import * as authService from "../../services/authService.js";
import * as tierlistService from "../../services/tierlistService.js";
import { PoolClient } from "pg";

async function seedDirectors(client: PoolClient) {
  console.log("--- Seeding directors ---");
  const directorValues = directors.map((d) => [d.id, d.name]);
  const placeholders = buildBulkInsertPlaceholders(directorValues.length, 2);
  const insertQuery = `--sql
    INSERT INTO directors (id, name)
    VALUES ${placeholders}
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
  `;
  await client.query(insertQuery, directorValues.flat());
  console.log(`Seeded ${directors.length} directors.`);
}

async function seedMovies(client: PoolClient) {
  console.log("--- Seeding movies ---");
  const movieValues = movies.map((m) => [
    m.id,
    m.title,
    m.release_year,
    m.director_id,
    m.poster_path,
  ]);
  const placeholders = buildBulkInsertPlaceholders(movieValues.length, 5);
  const movieInsertQuery = `--sql
    INSERT INTO movies (id, title, release_year, director_id, poster_path)
    VALUES ${placeholders}
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      release_year = EXCLUDED.release_year,
      director_id = EXCLUDED.director_id,
      poster_path = EXCLUDED.poster_path
  `;
  await client.query(movieInsertQuery, movieValues.flat());
  console.log(`Seeded ${movies.length} movies.`);
}

async function seedTemplates(client: PoolClient) {
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
      const templateMovieValues = template.movieIds.map((movieId) => [
        templateId,
        movieId,
      ]);
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
  console.log(`Seeded ${templates.length} templates.`);
  return templateIds;
}

async function seedTmdbConfig(client: PoolClient) {
  console.log("--- Seeding TMDB config ---");
  const base_url = "http://image.tmdb.org/t/p/";
  const secure_base_url = "https://image.tmdb.org/t/p/";
  const poster_sizes = ["w92", "w154", "w185", "w342", "w500", "w780", "original"];

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

async function seedUsersAndGetIds(client: PoolClient): Promise<{ [key: string]: number }> {
    console.log("--- Seeding users ---");
    const userIds: { [key: string]: number } = {};

    const userValues = await Promise.all(
        users.map(async (user) => {
            const hashedPassword = await bcrypt.hash("password123", 10); // Hash the default password
            // Generate a random 256-dimension vector for the profile
            const profileVector = Array.from({ length: 256 }, () => Math.random());
            return [user.username, user.email, hashedPassword, `[${profileVector.join(",")}]`, user.id];
        })
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

    res.rows.forEach(row => {
        userIds[row.username] = row.id;
        console.log(`Upserted user: ${row.username} (id: ${row.id})`);
    });

    console.log(`Upserted ${Object.keys(userIds).length} users.`);
    return userIds;
}


async function seedRankings(client: PoolClient, userIds: { [key: string]: number }, templateIds: { [key: string]: number }) {
  console.log("--- Seeding rankings ---");
  
  // Correction for Leo Morales' ranking of T2
  const correctedRankings = rankings.map(r => {
    if (r.userId === 10 && r.templateId === 2) {
      return {
        ...r,
        rankedItems: r.rankedItems.map(item => item.movieId === 872585 ? { ...item, movieId: 106646 } : item)
      };
    }
    return r;
  });

  for (const ranking of correctedRankings) {
    const user = users.find(u => u.id === ranking.userId);
    const template = templates.find(t => t.id === ranking.templateId);
    if (user && template) {
        const userId = userIds[user.username];
        const templateId = templateIds[template.title];
        if(userId && templateId) {
            console.log(`--- Seeding ranking for user ${user.username} on template ${template.title} (ID: ${templateId}) ---`);
            await tierlistService.saveUserRanking(client, userId, templateId, ranking.rankedItems);
        }
    }
  }
  console.log(`Seeded rankings.`);
}

export async function seedNewData() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await seedDirectors(client);
    await seedMovies(client);
    const templateIds = await seedTemplates(client);
    console.log("Finished seeding templates.");

    // Verify templates in database
    const dbTemplates = await client.query(`SELECT id, title FROM tierlist_templates ORDER BY id ASC;`);
    console.log("Templates currently in DB:", dbTemplates.rows);

    await seedTmdbConfig(client); // Call the new function here
    const userIds = await seedUsersAndGetIds(client);
    await seedRankings(client, userIds, templateIds);
    await client.query("COMMIT");
    console.log("\n✅ New database seeding complete!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error seeding new database data:", err);
    throw err;
  } finally {
    client.release();
  }
}

