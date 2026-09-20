import { config } from 'dotenv';
config({ path: '.env' });
import { db } from '../lib/db';

async function testConnection() {
  try {
    console.log('Testing RDS connection...');
    const result = await db.query("DELETE FROM users WHERE email = 'shko0502@daum.net' RETURNING *;");
    console.log('Deleted user successfully!', result.rows);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    process.exit(0);
  }
}

testConnection();
