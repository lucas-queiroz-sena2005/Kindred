/**
 * Generates placeholder strings for bulk INSERT statements.
 * e.g., for 2 rows and 3 columns: "($1, $2, $3), ($4, $5, $6)"
 */
export function buildBulkInsertPlaceholders(rows: number, columns: number): string {
  let paramIndex = 1;
  return Array.from({ length: rows }, () => {
    const rowPlaceholders = Array.from(
      { length: columns },
      () => `$${paramIndex++}`,
    );
    return `(${rowPlaceholders.join(", ")})`;
  }).join(", ");
}
