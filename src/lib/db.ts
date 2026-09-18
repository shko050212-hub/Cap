import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const globalForPg = global as unknown as { pgPool: Pool };

let sslConfig: any = { rejectUnauthorized: false };

try {
  const certPath = path.join(process.cwd(), 'certs', 'global-bundle.pem');
  if (fs.existsSync(certPath)) {
    sslConfig = {
      rejectUnauthorized: true,
      ca: fs.readFileSync(certPath).toString(),
    };
    console.log('Loaded RDS global-bundle.pem successfully.');
  }
} catch (err) {
  console.warn('Could not load global-bundle.pem. Using fallback SSL.');
}

export const db =
  globalForPg.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig,
  });

db.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = db;
