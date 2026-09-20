import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

function getAdminFromCookie(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  if (!match) return null;
  try {
    return jwt.verify(match[1], process.env.JWT_SECRET || 'fallback-secret') as any;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const admin = getAdminFromCookie(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const users = await db.query(`
      SELECT id, email, role, coins, profile_name, created_at,
        CASE WHEN role = 'BLACKLIST' THEN true ELSE false END as is_blacklisted
      FROM users
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ users: users.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = getAdminFromCookie(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { user_id, action, reason } = await request.json();

    const before = await db.query('SELECT * FROM users WHERE id = $1', [user_id]);
    let newRole = action === 'blacklist' ? 'BLACKLIST' : 'USER';

    await db.query('UPDATE users SET role = $1 WHERE id = $2', [newRole, user_id]);

    await db.query(
      `INSERT INTO admin_audit_logs (admin_id, action_type, target_domain, target_id, before_state, after_state, ip_address, reason)
       VALUES ($1, 'ROLE_CHANGE', 'users', $2, $3, $4, 'server', $5)`,
      [admin.adminId, user_id, JSON.stringify(before.rows[0]), JSON.stringify({ role: newRole }), reason]
    );

    return NextResponse.json({ message: 'User updated' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
