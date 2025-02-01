import { QueryResult } from "pg";
import { pool } from "../config/db";

export const transaction = async (
  queries: { sql: string; values: any[] }[],
  withoutRollback = false
) => {
  const client = await pool.connect();

  const response: QueryResult<any>[] = [];
  try {
    await client.query("BEGIN");

    for (let i = 0; i < queries.length; i++) {
      const result = await client.query(queries[i].sql, queries[i].values);
      response.push(result);
    }

    await client.query("COMMIT");
    client.release();
    return response;
  } catch (error) {
    if (withoutRollback === false) {
      await client.query("ROLLBACK");
      client.release();
      throw error;
    } else {
      return response;
    }
  }
};
