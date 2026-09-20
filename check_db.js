require('dotenv').config({ path: './.env' });
const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:root1357..@database-1.cl0cmogqigis.ap-southeast-2.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'artworks'"))
  .then(res => console.log('artworks:', res.rows.map(r => r.column_name)))
  .then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions'"))
  .then(res => console.log('transactions:', res.rows.map(r => r.column_name)))
  .finally(() => client.end());
