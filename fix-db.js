const { Pool } = require('pg');
const pool = new Pool({
  host: 'database-1.cl0cmogqigis.ap-southeast-2.rds.amazonaws.com',
  user: 'postgres',
  password: 'root1357..',
  database: 'postgres',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_secret VARCHAR(255);')
  .then(() => {
    console.log('Column otp_secret added successfully');
    pool.end();
  })
  .catch((err) => {
    console.error(err);
    pool.end();
  });
