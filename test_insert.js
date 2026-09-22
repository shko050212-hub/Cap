require('dotenv').config({ path: './.env' });
const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:root1357..@database-1.cl0cmogqigis.ap-southeast-2.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => client.query("INSERT INTO artworks (user_id, title, price, src, sale_type) VALUES (5, 'TEST', 100, 'img.png', 'sale') RETURNING *;"))
  .then(res => console.log('artworks insert success:', res.rows[0]))
  .then(() => client.query("INSERT INTO artwork_consignments (seller_id, title, price, image_url, sale_type, status) VALUES (5, 'TEST', 100, 'img.png', 'sale', 'REQUESTED') RETURNING *;"))
  .then(res => console.log('consignments insert success:', res.rows[0]))
  .catch(console.error)
  .finally(() => client.end());
