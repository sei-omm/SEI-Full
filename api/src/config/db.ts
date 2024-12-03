import { Client, Pool, PoolConfig } from "pg";

export const dbConfig = {
  user: "postgres",
  host: "localhost",
  database: "sei_db",
  password: "123456",
  port: 5432,
};

// export const dbConfig: PoolConfig = {
//   connectionString: "postgres://default:Sbn2tCg5dilv@ep-soft-darkness-a45ok4wz-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
//   ssl: {
//     rejectUnauthorized: false,
//   },
// };

export const pool = new Pool(dbConfig);
export const client = new Client(dbConfig);
