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
  release_date: string;
  poster_path: string | null;
  genre_ids: number[];
  job: string;
  vote_count: number;
}

const DIRECTOR_IDS_TO_SEED = [525, 137427, 1032]; // Nolan, Villeneuve, Fincher
const DOCUMENTARY_GENRE_ID = 99;
const MINIMUM_VOTE_COUNT = 100;

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: { api_key: process.env.TMDB_API_KEY },
});

async function clearDatabase(client: PoolClient) {
  console.log("--- Clearing database ---");
  // Expanded to include all tables for a full reset
  await client.query(
    "TRUNCATE TABLE ranked_items, user_rankings, template_movies, movie_genres, messages RESTART IDENTITY CASCADE"
  );
  await client.query(
    "TRUNCATE TABLE users, movies, directors, genres, tierlist_templates RESTART IDENTITY CASCADE"
  );
  console.log("Database cleared.");
}

async function seedGenres(client: PoolClient) {
  console.log("--- Seeding genres ---");
  const { data } = await tmdb.get<{ genres: Genre[] }>("/genre/movie/list");
  for (const genre of data.genres) {
    await client.query(
      "INSERT INTO genres (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
      [genre.id, genre.name]
    );
  }
  console.log(`Seeded ${data.genres.length} genres.`);
}

async function seedDirectorAndMovies(
  client: PoolClient,
  directorTmdbId: number
) {
  const { data: director } = await tmdb.get<Director>(
    `/person/${directorTmdbId}`
  );
  await client.query(
    "INSERT INTO directors (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
    [director.id, director.name]
  );
  console.log(`--- Seeding director: ${director.name} ---`);

  const { data: credits } = await tmdb.get<{ crew: MovieCredit[] }>(
    `/person/${directorTmdbId}/movie_credits`
  );

  const films = credits.crew.filter(
    (film) =>
      film.job === "Director" &&
      film.release_date &&
      film.vote_count >= MINIMUM_VOTE_COUNT &&
      !film.genre_ids.includes(DOCUMENTARY_GENRE_ID)
  );

  const movieIds: number[] = [];
  for (const film of films) {
    await client.query(
      `INSERT INTO movies (id, title, release_year, director_id, poster_path) VALUES ($1, $2, $3, $4, $5)`,
      [
        film.id,
        film.title,
        parseInt(film.release_date.split("-")[0]),
        director.id,
        film.poster_path,
      ]
    );
    movieIds.push(film.id);

    for (const genreId of film.genre_ids) {
      await client.query(
        "INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [film.id, genreId]
      );
    }
  }
  console.log(`Seeded ${films.length} films for ${director.name}.`);
  return { directorName: director.name, movieIds };
}

async function seedUsers(client: PoolClient) {
  console.log("--- Seeding users ---");
  const hash = await bcrypt.hash("password123", 10);
  await client.query(
    `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)`,
    ["testuser", "test@test.com", hash]
  );
  console.log("Seeded testuser (pw: password123)");
}

async function createTemplateAndLinkMovies(
  client: PoolClient,
  directorName: string,
  movieIds: number[]
) {
  const res = await client.query(
    `INSERT INTO tierlist_templates (title, description) VALUES ($1, $2) RETURNING id`,
    [
      `Filmography: ${directorName}`,
      `Rank all films directed by ${directorName}.`,
    ]
  );
  const templateId = res.rows[0].id;

  for (const movieId of movieIds) {
    await client.query(
      `INSERT INTO template_movies (template_id, movie_id) VALUES ($1, $2)`,
      [templateId, movieId]
    );
  }
  console.log(
    `--- Created template for ${directorName} and linked ${movieIds.length} movies ---`
  );
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

    let totalMovies = 0;
    for (const id of DIRECTOR_IDS_TO_SEED) {
      const { directorName, movieIds } = await seedDirectorAndMovies(
        client,
        id
      );
      totalMovies += movieIds.length;
      await createTemplateAndLinkMovies(client, directorName, movieIds);
    }

    await seedUsers(client);

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
