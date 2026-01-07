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

async function seedUsersAndGetIds(client: PoolClient): Promise<{ [key: string]: number }> {
    console.log("--- Seeding users ---");
    const userIds: { [key: string]: number } = {};
    for (const user of users) {
        try {
            const registeredUser = await authService.register({ ...user, password: "password123" });
            userIds[user.username] = registeredUser.id;
            console.log(`Seeded ${user.username} (pw: password123)`);
        } catch (error) {
            // If user already exists, try to get the id
            const res = await client.query('SELECT id FROM users WHERE username = $1', [user.username]);
            if (res.rows.length > 0) {
                userIds[user.username] = res.rows[0].id;
                console.log(`Found existing user ${user.username}`);
            } else {
                console.error(`Could not seed or find user ${user.username}`);
            }
        }
    }
    console.log(`Seeded or found ${Object.keys(userIds).length} users.`);
    return userIds;
}


async function seedRankings(userIds: { [key: string]: number }, templateIds: { [key: string]: number }) {
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
            console.log(`--- Seeding ranking for user ${user.username} on template ${template.title} ---`);
            await tierlistService.saveUserRanking(userId, templateId, ranking.rankedItems);
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
    const userIds = await seedUsersAndGetIds(client);
    await seedRankings(userIds, templateIds);
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
