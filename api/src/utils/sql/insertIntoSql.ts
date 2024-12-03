type UpsertParams = {
  tableName: string;
  columns: string[];
  conflictColumn? : string;
  rows: (string | number | null)[][];
};

export function insertIntoSql({
  tableName,
  columns,
  conflictColumn,
  rows,
}: UpsertParams) {
  if (rows.length === 0) {
    throw new Error("No rows provided for upsert.");
  }

  // Create the column names part
  const columnNames = columns.join(", ");

  // Dynamically generate placeholders for the rows
  const valuePlaceholders = rows
    .map(
      (_, rowIndex) =>
        `(${columns
          .map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`)
          .join(", ")})`
    )
    .join(", ");

  // Generate the update clause dynamically, excluding the conflict column
  const updateSet = conflictColumn
    ? columns
        .filter((col) => col !== conflictColumn)
        .map((col) => `${col} = EXCLUDED.${col}`)
        .join(", ")
    : "";

  // Combine everything into the final query
  const query = `
        INSERT INTO ${tableName} (${columnNames})
        VALUES ${valuePlaceholders}
        ${
          conflictColumn
            ? `
        ON CONFLICT (${conflictColumn})
        DO UPDATE SET ${updateSet}`
            : ""
        }
    `;

  // Flatten the rows into a single array of values
  const values = rows.flat();

  return {query, values};

  // Execute the query
//   await pool.query(query, values);
}
