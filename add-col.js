const { Pool } = require('pg');
const pool = new Pool();
pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_secret VARCHAR(255);')
  .then(() => {
    console.log('Column added');
    pool.end();
  })
  .catch((err) => {
    console.error(err);
    pool.end();
  });
