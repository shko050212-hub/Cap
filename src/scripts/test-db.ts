import { config } from 'dotenv';
config({ path: '.env' });
import { db } from '../lib/db';

async function testConnection() {
  try {
    console.log('Testing RDS connection...');
    const result = await db.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public';");
    console.log('Connection successful!');
    console.log('Tables in public schema:');
    result.rows.forEach(row => {
      console.log(`- ${row.tablename}`);
    });
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    process.exit(0);
  }
}

testConnection();
