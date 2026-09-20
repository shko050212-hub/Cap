import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const res = await db.query('SELECT * FROM admin_users WHERE email = $1 AND is_active = TRUE', [email]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    const admin = res.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '8h' }
    );

    // 감사 로그 (실패해도 로그인 차단 안 함)
    try {
      await db.query(
        `INSERT INTO admin_audit_logs (admin_id, action_type, target_domain, target_id, ip_address) VALUES ($1, 'LOGIN', 'admin_users', $2, $3)`,
        [admin.id, admin.id, 'unknown']
      );
    } catch (logErr) {
      console.error('Audit log failed (non-critical):', logErr);
    }

    const response = NextResponse.json({ message: 'Login successful', role: admin.role });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
