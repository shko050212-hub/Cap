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

    const logs = await db.query(`
      SELECT al.*, au.email as admin_email
      FROM admin_audit_logs al
      LEFT JOIN admin_users au ON al.admin_id = au.id
      ORDER BY al.created_at DESC
      LIMIT 200
    `);

    return NextResponse.json({ logs: logs.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
