import { Pool } from 'pg';

const globalForPg = global as unknown as { pgPool: Pool };

export const db =
  globalForPg.pgPool ||
  new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'artmart_db',
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = db;
