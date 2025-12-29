import "dotenv/config";
import axios from "axios";
import pool from "./db.js";
import bcrypt from "bcryptjs";
import { PoolClient } from "pg";

interface Genre {
  id: number;
  name: string;
}
interface Director {
  id: number;
  name: string;
}
interface MovieCredit {
  id: number;
  title: string;
  release_date: string; // format: "YYYY-MM-DD"
  poster_path: string | null;
  genre_ids: number[];
  job: string;
  vote_count: number;
}

const DIRECTOR_IDS_TO_SEED = [525, 137427, 118]; // Nolan, Villeneuve, Scorsese
const DOCUMENTARY_GENRE_ID = 99;
const MINIMUM_VOTE_COUNT = 100;

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: { api_key: process.env.TMDB_API_KEY },
});

/**
 * Generates placeholder strings for bulk INSERT statements.
 * e.g., for 2 rows and 3 columns: "($1, $2, $3), ($4, $5, $6)"
 */
function buildBulkInsertPlaceholders(rows: number, columns: number): string {
  let paramIndex = 1;
  return Array.from({ length: rows }, () => {
    const rowPlaceholders = Array.from(
      { length: columns },
      () => `$${paramIndex++}`,
    );
    return `(${rowPlaceholders.join(", ")})`;
  }).join(", ");
}

async function clearDatabase(client: PoolClient) {
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

async function seedGenres(client: PoolClient) {
  console.log("--- Seeding genres ---");
  const { data } = await tmdb.get<{ genres: Genre[] }>("/genre/movie/list");

  if (!data.genres || data.genres.length === 0) {
    console.log("No genres to seed.");
    return;
  }

  const genreValues = data.genres.map((g) => [g.id, g.name]);
  const placeholders = buildBulkInsertPlaceholders(genreValues.length, 2);
  const insertQuery = `--sql
    INSERT INTO genres (id, name)
    VALUES ${placeholders}
    ON CONFLICT (id) DO NOTHING
  `;

  await client.query(insertQuery, genreValues.flat());
  console.log(`Seeded ${data.genres.length} genres.`);
}

async function seedDirectorAndMovies(
  client: PoolClient,
  directorTmdbId: number,
) {
  const { data: director } = await tmdb.get<Director>(
    `/person/${directorTmdbId}`,
  );
  await client.query(
    `--sql
    INSERT INTO directors (id, name)
    VALUES ($1, $2)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    `,
    [director.id, director.name],
  );
  console.log(`--- Seeding director: ${director.name} ---`);

  const { data: credits } = await tmdb.get<{ crew: MovieCredit[] }>(
    `/person/${directorTmdbId}/movie_credits`,
  );

  const films = credits.crew.filter(
    (film) =>
      film.job === "Director" &&
      film.release_date &&
      film.vote_count >= MINIMUM_VOTE_COUNT &&
      !film.genre_ids.includes(DOCUMENTARY_GENRE_ID),
  );

  if (films.length === 0) {
    console.log(`No films to seed for ${director.name}.`);
    return { directorName: director.name, movieIds: [] };
  }

  const movieValues = films.map((film) => [
    film.id,
    film.title,
    parseInt(film.release_date.split("-")[0]),
    director.id,
    film.poster_path,
  ]);

  const moviePlaceholders = buildBulkInsertPlaceholders(movieValues.length, 5);
  const movieInsertQuery = `--sql
    INSERT INTO movies (id, title, release_year, director_id, poster_path)
    VALUES ${moviePlaceholders}
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      release_year = EXCLUDED.release_year,
      poster_path = EXCLUDED.poster_path
  `;
  await client.query(movieInsertQuery, movieValues.flat());

  const movieGenreValues = films.flatMap((film) =>
    film.genre_ids.map((genreId) => [film.id, genreId]),
  );

  if (movieGenreValues.length > 0) {
    const genrePlaceholders = buildBulkInsertPlaceholders(
      movieGenreValues.length,
      2,
    );
    const movieGenreInsertQuery = `--sql
      INSERT INTO movie_genres (movie_id, genre_id)
      VALUES ${genrePlaceholders}
      ON CONFLICT (movie_id, genre_id) DO NOTHING
    `;
    await client.query(movieGenreInsertQuery, movieGenreValues.flat());
  }

  const movieIds = films.map((film) => film.id);
  console.log(`Seeded ${films.length} films for ${director.name}.`);
  return { directorName: director.name, movieIds };
}

async function seedUsers(client: PoolClient): Promise<number[]> {
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

async function seedUserConnections(client: PoolClient, userIds: number[]) {
  console.log("--- Seeding user connections ---");
  const [user1, user2, user3] = userIds;
  // testuser is connected to user2 and user3
  const connections = [
    [user1, user2],
    [user1, user3],
  ];

  const values = connections.map(([idA, idB]) =>
    idA < idB ? [idA, idB] : [idB, idA],
  );

  const placeholders = buildBulkInsertPlaceholders(values.length, 2);
  const query = `--sql
    INSERT INTO user_connections (user_id_a, user_id_b)
    VALUES ${placeholders}
    ON CONFLICT (user_id_a, user_id_b) DO NOTHING
  `;

  await client.query(query, values.flat());
  console.log(`Seeded ${values.length} user connections.`);
}

async function seedUserRanking(
  client: PoolClient,
  userId: number,
  templateId: number,
  movieIds: number[],
) {
  console.log(
    `--- Seeding ranking for user ${userId} on template ${templateId} ---`,
  );
  const rankingRes = await client.query(
    `--sql
    INSERT INTO user_rankings (user_id, template_id) VALUES ($1, $2) RETURNING id
  `,
    [userId, templateId],
  );
  const rankingId = rankingRes.rows[0].id;

  const rankedItems = movieIds.map((movieId) => [
    rankingId,
    movieId,
    Math.floor(Math.random() * 6),
  ]); // Random tier 0-5
  const placeholders = buildBulkInsertPlaceholders(rankedItems.length, 3);
  const query = `INSERT INTO ranked_items (ranking_id, movie_id, tier) VALUES ${placeholders}`;
  await client.query(query, rankedItems.flat());
  console.log(`Seeded ${movieIds.length} ranked items.`);
}

async function createTemplateAndLinkMovies(
  client: PoolClient,
  directorName: string,
  movieIds: number[],
) {
  const res = await client.query(
    `--sql
    INSERT INTO tierlist_templates (title, description)
    VALUES ($1, $2)
    RETURNING id
    `,
    [
      `Filmography: ${directorName}`,
      `Rank all films directed by ${directorName}.`,
    ],
  );
  const templateId = res.rows[0].id;

  if (movieIds.length > 0) {
    const templateMovieValues = movieIds.map((movieId) => [
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

  console.log(
    `--- Created template for ${directorName} and linked ${movieIds.length} movies ---`,
  );
  return templateId;
}

async function main() {
  if (!process.env.TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not defined in .env file");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await clearDatabase(client);
    await seedGenres(client);

    const seededTemplates = [];
    let totalMovies = 0;
    for (const directorId of DIRECTOR_IDS_TO_SEED) {
      const { directorName, movieIds } = await seedDirectorAndMovies(
        client,
        directorId,
      );
      totalMovies += movieIds.length;
      const templateId = await createTemplateAndLinkMovies(
        client,
        directorName,
        movieIds,
      );
      seededTemplates.push({ templateId, movieIds });
    }

    const userIds = await seedUsers(client);
    await seedUserConnections(client, userIds);

    // Have the first user (testuser) rank the first director's movies
    if (userIds.length > 0 && seededTemplates.length > 0) {
      const testUser = userIds[0];
      const firstTemplate = seededTemplates[0];
      await seedUserRanking(
        client,
        testUser,
        firstTemplate.templateId,
        firstTemplate.movieIds,
      );
    }

    await client.query("COMMIT");
    console.log(`\n✅ Database seeding complete! Total movies: ${totalMovies}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error seeding database:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
