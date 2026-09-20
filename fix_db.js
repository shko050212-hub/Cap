require('dotenv').config({ path: './.env' });
const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:root1357..@database-1.cl0cmogqigis.ap-southeast-2.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => client.query(`ALTER TABLE artworks ADD COLUMN IF NOT EXISTS user_id INT;`))
  .then(() => client.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id INT;`))
  .then(() => console.log('Added user_id columns if they were missing'))
  .catch(console.error)
  .finally(() => client.end());
