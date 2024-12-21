import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();
function configDb() {
  const dbConfig: PoolConfig = {
    connectionString: process.env.POSTGRES_URL,
    ssl: false
  };
  return dbConfig;
}

export const pool = new Pool(configDb());
