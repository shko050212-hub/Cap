require('dotenv').config({ path: './.env' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root1357..@database-1.cl0cmogqigis.ap-southeast-2.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to DB');

    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        artwork_id INT,
        artwork_title VARCHAR(255),
        artwork_src TEXT,
        amount INT,
        type VARCHAR(50),
        auction_end_time BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created transactions table');

  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await client.end();
    console.log('Disconnected');
  }
}

runMigration();
