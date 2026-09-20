require('dotenv').config({ path: './.env' });
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to DB');

    // 1. admin_users 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'CURATOR',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created admin_users table');

    // 2. artwork_consignments 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS artwork_consignments (
        consignment_id SERIAL PRIMARY KEY,
        seller_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255),
        width_cm DECIMAL(6,2),
        height_cm DECIMAL(6,2),
        image_url VARCHAR(1000),
        image_aspect_ratio DECIMAL(6,4) DEFAULT 0,
        aspect_ratio_diff_rate DECIMAL(5,2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'REQUESTED',
        reject_reason TEXT,
        is_scale_verified BOOLEAN DEFAULT FALSE,
        sale_type VARCHAR(20) DEFAULT 'sale',
        price INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created artwork_consignments table');

    // 3. inspection_reports 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS inspection_reports (
        report_id SERIAL PRIMARY KEY,
        consignment_id INT REFERENCES artwork_consignments(consignment_id) ON DELETE CASCADE,
        inspector_id INT,
        frame_condition BOOLEAN DEFAULT TRUE,
        canvas_flaw BOOLEAN DEFAULT FALSE,
        certificate_verified BOOLEAN DEFAULT FALSE,
        inspection_notes TEXT,
        inspected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created inspection_reports table');

    // 4. auction_monitoring 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS auction_monitoring (
        auction_id SERIAL PRIMARY KEY,
        artwork_id INT,
        start_price INT NOT NULL DEFAULT 0,
        current_highest_bid INT DEFAULT 0,
        current_winner_id INT,
        end_time TIMESTAMP,
        status VARCHAR(50) DEFAULT 'READY',
        is_abusing_flagged BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created auction_monitoring table');

    // 5. admin_audit_logs 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        log_id SERIAL PRIMARY KEY,
        admin_id INT,
        action_type VARCHAR(50) NOT NULL,
        target_domain VARCHAR(50),
        target_id INT,
        before_state JSONB,
        after_state JSONB,
        ip_address VARCHAR(45),
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created admin_audit_logs table');

    // 6. 어드민 계정 생성
    const hash = await bcrypt.hash('ArtMart!Admin2024', 10);
    await client.query(`
      INSERT INTO admin_users (email, password_hash, role)
      VALUES ($1, $2, 'SUPER_ADMIN')
      ON CONFLICT (email) DO NOTHING;
    `, ['admin@artmart.kr', hash]);
    console.log('Admin account created: admin@artmart.kr');

    // 7. artworks 테이블에서 existing artworks를 consignments로 동기화
    await client.query(`
      INSERT INTO artwork_consignments (seller_id, title, image_url, sale_type, price, status)
      SELECT user_id, title, src, sale_type, price, 
        CASE WHEN status = 'approved' THEN 'EXHIBITED' ELSE 'REQUESTED' END
      FROM artworks
      ON CONFLICT DO NOTHING;
    `);
    console.log('Synced existing artworks to consignments');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
    console.log('Done');
  }
}

runMigration();
