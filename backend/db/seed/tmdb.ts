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
  let director: Director;
  try {
    const response = await tmdb.get<Director>(`/person/${directorTmdbId}`);
    director = response.data;
  } catch (error: any) {
    if (error.isAxiosError && error.response && error.response.status === 404) {
      console.warn(
        `[WARN] Director with TMDB ID ${directorTmdbId} not found (404). Skipping.`,
      );
      return { directorName: "Unknown", movieIds: [], tmdbIdToIdMap: new Map() }; // Return a default object to avoid breaking destructuring in the calling function
    } else {
      // For any other error, re-throw it to halt the seeding process
      console.error(
        `[ERROR] Failed to fetch director with TMDB ID ${directorTmdbId}.`,
      );
      throw error;
    }
  }

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
    return { directorName: director.name, movieIds: [], tmdbIdToIdMap: new Map() };
  }

  const movieValues = films.map((film) => [
    film.id, // tmdb_id
    film.title,
    parseInt(film.release_date.split("-")[0]),
    director.id,
    film.poster_path,
  ]);

  const moviePlaceholders = buildBulkInsertPlaceholders(movieValues.length, 5);
  const movieInsertQuery = `--sql
    INSERT INTO movies (tmdb_id, title, release_year, director_id, poster_path)
    VALUES ${moviePlaceholders}
    ON CONFLICT (tmdb_id) DO UPDATE SET
      title = EXCLUDED.title,
      release_year = EXCLUDED.release_year,
      poster_path = EXCLUDED.poster_path
    RETURNING id, tmdb_id
  `;
  const movieInsertResult = await client.query(
    movieInsertQuery,
    movieValues.flat(),
  );

  const tmdbIdToIdMap = new Map<number, number>();
  movieInsertResult.rows.forEach((row) => {
    tmdbIdToIdMap.set(row.tmdb_id, row.id);
  });

  const movieGenreValues = films
    .flatMap((film) => {
      const movieId = tmdbIdToIdMap.get(film.id);
      if (movieId) {
        return film.genre_ids.map((genreId) => [movieId, genreId]);
      }
      return [];
    })
    .filter((v) => v.length > 0);

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

  const movieIds = films
    .map((film) => tmdbIdToIdMap.get(film.id)!)
    .filter((id) => id != null);
  console.log(`Seeded ${films.length} films for ${director.name}.`);
  return { directorName: director.name, movieIds, tmdbIdToIdMap };
}

interface MovieDetails {
    id: number;
    title: string;
    release_date: string;
    poster_path: string | null;
    genres: Genre[];
    vote_count: number;
}

interface Credits {
    crew: {
        id: number;
        name: string;
        job: string;
    }[];
}

export async function seedMovieByTmdbId(client: PoolClient, tmdbId: number): Promise<Map<number, number>> {
    console.log(`--- Seeding movie with TMDB ID: ${tmdbId} ---`);
    const tmdbIdToIdMap = new Map<number, number>();

    try {
        const { data: movieDetails } = await tmdb.get<MovieDetails>(`/movie/${tmdbId}`);
        const { data: credits } = await tmdb.get<Credits>(`/movie/${tmdbId}/credits`);

        const director = credits.crew.find((person) => person.job === 'Director');

        if (!director) {
            console.warn(`[WARN] No director found for movie with TMDB ID ${tmdbId}. Skipping.`);
            return tmdbIdToIdMap;
        }

        // Seed director
        await client.query(
            `--sql
            INSERT INTO directors (id, name)
            VALUES ($1, $2)
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
            `,
            [director.id, director.name],
        );

        // Seed movie
        const movieInsertQuery = `--sql
            INSERT INTO movies (tmdb_id, title, release_year, director_id, poster_path)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (tmdb_id) DO UPDATE SET
                title = EXCLUDED.title,
                release_year = EXCLUDED.release_year,
                poster_path = EXCLUDED.poster_path
            RETURNING id, tmdb_id
        `;
        const movieInsertResult = await client.query(movieInsertQuery, [
            movieDetails.id,
            movieDetails.title,
            parseInt(movieDetails.release_date.split("-")[0]),
            director.id,
            movieDetails.poster_path,
        ]);
        
        movieInsertResult.rows.forEach((row) => {
            tmdbIdToIdMap.set(row.tmdb_id, row.id);
        });
        
        const movieId = tmdbIdToIdMap.get(movieDetails.id);

        // Seed movie_genres
        if (movieId && movieDetails.genres.length > 0) {
            const movieGenreValues = movieDetails.genres.map(genre => [movieId, genre.id]);
            const genrePlaceholders = buildBulkInsertPlaceholders(movieGenreValues.length, 2);
            const movieGenreInsertQuery = `--sql
                INSERT INTO movie_genres (movie_id, genre_id)
                VALUES ${genrePlaceholders}
                ON CONFLICT (movie_id, genre_id) DO NOTHING
            `;
            await client.query(movieGenreInsertQuery, movieGenreValues.flat());
        }

        console.log(`Seeded movie: ${movieDetails.title}`);

    } catch (error: any) {
        if (error.isAxiosError && error.response && error.response.status === 404) {
            console.warn(`[WARN] Movie with TMDB ID ${tmdbId} not found (404). Skipping.`);
        } else {
            console.error(`[ERROR] Failed to fetch movie with TMDB ID ${tmdbId}.`);
            throw error;
        }
    }
    
    return tmdbIdToIdMap;
}

