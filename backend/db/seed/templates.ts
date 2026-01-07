import { PoolClient } from "pg";
import { buildBulkInsertPlaceholders } from "./utils.js";

export async function createTemplateAndLinkMovies(
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
  console.log(res.rows);
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
