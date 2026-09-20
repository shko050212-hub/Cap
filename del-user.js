const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://postgres:root1357..@database-1.cl0cmogqigis.ap-southeast-2.rds.amazonaws.com:5432/postgres',
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('./certs/global-bundle.pem').toString()
  }
});

client.connect().then(() => {
  client.query("DELETE FROM users WHERE email = 'shko0502@daum.net'").then(res => {
    console.log('Deleted rows:', res.rowCount);
    client.end();
  }).catch(console.error);
}).catch(console.error);
