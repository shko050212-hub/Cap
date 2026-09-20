require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root1357..@database-1.cl0cmogqigis.ap-southeast-2.rds.amazonaws.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect().then(() => {
  client.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name").then(res => {
    console.log(res.rows);
    client.end();
  }).catch(console.error);
}).catch(console.error);
