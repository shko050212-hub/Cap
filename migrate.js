require('dotenv').config({ path: './.env' });
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root1357..@database-1.cl0cmogqigis.ap-southeast-2.rds.amazonaws.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to DB');

    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_name VARCHAR(255) DEFAULT '관람객 님';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT DEFAULT '/mascot.png';
    `);
    console.log('Altered users table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS artworks (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        src TEXT,
        sale_type VARCHAR(50) DEFAULT 'sale',
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created artworks table');

  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await client.end();
    console.log('Disconnected');
  }
}

runMigration();
