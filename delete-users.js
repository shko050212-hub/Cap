const { Pool } = require('pg');
const pool = new Pool({
  host: 'database-1.cl0cmogqigis.ap-southeast-2.rds.amazonaws.com',
  user: 'postgres',
  password: 'root1357..',
  database: 'postgres',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

pool.query('DELETE FROM users')
  .then(() => {
    console.log('All users deleted successfully');
    pool.end();
  })
  .catch((err) => {
    console.error(err);
    pool.end();
  });
