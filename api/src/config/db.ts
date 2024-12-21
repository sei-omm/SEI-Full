import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();
function configDb() {
  const dbConfig: PoolConfig = {
    connectionString: process.env.POSTGRES_URL,
    ssl:
      process.env.NODE_ENV === "development"
        ? false
        : {
            rejectUnauthorized: false,
          },
  };
  return dbConfig;
}

export const pool = new Pool(configDb());
