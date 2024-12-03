import { QueryResult } from "pg";
import { pool } from "../config/db";

interface IParams {
  query1: {
    sql: string;
    values: any[];
  };
  query2: {
    sql: string;
    values: any[];
  };
}

export const dbTransaction = async ({ query1, query2 }: IParams) => {
  const client = await pool.connect();

  let query1Response : QueryResult<any> | null = null;
  let query2Response : QueryResult<any> | null = null;

  try {
    await client.query("BEGIN");

    query1Response = await client.query(query1.sql, query1.values);

    query2Response = await client.query(query2.sql, query2.values);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();

    return {query1Response, query2Response};
  }
};
