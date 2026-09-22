require('dotenv').config({ path: './.env' });
const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:root1357..@database-1.cl0cmogqigis.ap-southeast-2.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => client.query('ALTER TABLE artworks ADD COLUMN IF NOT EXISTS src TEXT;'))
  .then(() => client.query("ALTER TABLE artworks ADD COLUMN IF NOT EXISTS sale_type VARCHAR(50) DEFAULT 'sale';"))
  .then(() => client.query("ALTER TABLE artworks ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';"))
  .then(() => console.log('Added missing columns to artworks'))
  .catch(console.error)
  .finally(() => client.end());
