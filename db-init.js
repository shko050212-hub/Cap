const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'root1357..',
  host: 'database-1.cl0cmogqigis.ap-southeast-2.rds.amazonaws.com',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const createTables = async () => {
  try {
    console.log('Connecting to RDS and creating tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          role VARCHAR(20) NOT NULL CHECK (role IN ('ARTIST', 'BUYER', 'ADMIN')),
          height_cm NUMERIC(5, 2) NOT NULL,
          bank_name VARCHAR(50),
          bank_account VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS artworks (
          id SERIAL PRIMARY KEY,
          artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          image_url TEXT NOT NULL,
          width_cm NUMERIC(6, 2) NOT NULL,
          height_cm NUMERIC(6, 2) NOT NULL,
          desired_price NUMERIC(12, 2) NOT NULL,
          fee_rate NUMERIC(3, 2) DEFAULT 0.15,
          selling_price NUMERIC(12, 2) NOT NULL,
          views_count INTEGER DEFAULT 0,
          likes_count INTEGER DEFAULT 0,
          status VARCHAR(20) NOT NULL CHECK (status IN ('APPLIED', 'APPROVED', 'ON_SALE', 'SOLD_OUT', 'SETTLED')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          artwork_id INTEGER NOT NULL REFERENCES artworks(id),
          buyer_id INTEGER NOT NULL REFERENCES users(id),
          total_amount NUMERIC(12, 2) NOT NULL,
          order_status VARCHAR(50) NOT NULL,
          shipping_address TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tables created successfully!');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    await pool.end();
  }
};

createTables();
