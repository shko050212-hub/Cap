#!/bin/bash
rm -rf artmart-deploy
git clone https://github.com/shko050212-hub/Cap.git artmart-deploy
cd artmart-deploy

cat << 'EOF' > .env
DB_USER=postgres
DB_PASSWORD=root1357..
DB_HOST=database-1.cl0cmogqigis.ap-southeast-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=postgres
JWT_SECRET=artmart-super-secret-key-2026
EOF

cat << 'EOF' > db-init.js
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});
const createTables = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, name VARCHAR(100) NOT NULL, phone VARCHAR(20), role VARCHAR(20) NOT NULL, height_cm NUMERIC(5, 2) NOT NULL, bank_name VARCHAR(50), bank_account VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await pool.query(`CREATE TABLE IF NOT EXISTS artworks (id SERIAL PRIMARY KEY, artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, title VARCHAR(255) NOT NULL, description TEXT, image_url TEXT NOT NULL, width_cm NUMERIC(6, 2) NOT NULL, height_cm NUMERIC(6, 2) NOT NULL, desired_price NUMERIC(12, 2) NOT NULL, fee_rate NUMERIC(3, 2) DEFAULT 0.15, selling_price NUMERIC(12, 2) NOT NULL, views_count INTEGER DEFAULT 0, likes_count INTEGER DEFAULT 0, status VARCHAR(20) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await pool.query(`CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, artwork_id INTEGER NOT NULL REFERENCES artworks(id), buyer_id INTEGER NOT NULL REFERENCES users(id), total_amount NUMERIC(12, 2) NOT NULL, order_status VARCHAR(50) NOT NULL, shipping_address TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    console.log('Tables created successfully via EC2!');
  } catch (err) {
    console.error('Error:', err);
  } finally { 
    await pool.end(); 
  }
};
createTables();
EOF

npm install
npm install dotenv
node db-init.js

npm run build
sudo npm install -g pm2
pm2 stop artmart || true
pm2 start npm --name 'artmart' -- start
