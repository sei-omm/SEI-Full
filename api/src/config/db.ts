import { Client, Pool, PoolConfig } from "pg";

// export const dbConfig : PoolConfig = {
//   user: "postgres",
//   host: "localhost",
//   database: "sei_db",
//   password: "123456",
//   port: 5432,
// };

export const dbConfig: PoolConfig = {
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
};

export const pool = new Pool(dbConfig);
export const client = new Client(dbConfig);
