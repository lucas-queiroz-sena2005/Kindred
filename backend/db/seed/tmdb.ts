import axios from "axios";
import { PoolClient } from "pg";
import { buildBulkInsertPlaceholders } from "./utils.js";

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

const DOCUMENTARY_GENRE_ID = 99;
const MINIMUM_VOTE_COUNT = 100;

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: { api_key: process.env.TMDB_API_KEY },
});

export async function seedGenres(client: PoolClient) {
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

export async function seedDirectorAndMovies(
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
