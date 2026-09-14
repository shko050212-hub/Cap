import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Admin bypass
    if (email === 'admin@artmart.com' && password === 'admin1234') {
      const token = jwt.sign(
        { userId: 999, email: 'admin@artmart.com', role: 'ADMIN' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '1d' }
      );
      return NextResponse.json({ message: 'Admin login', token, role: 'ADMIN', requireOtp: false });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 틀렸습니다.' }, { status: 401 });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 틀렸습니다.' }, { status: 401 });
    }

    // 비밀번호가 맞으면 OTP 단계를 요구함 (JWT는 아직 발급 안 함)
    return NextResponse.json({ 
      message: 'OTP 인증이 필요합니다.', 
      requireOtp: true,
      email: user.email,
      role: user.role
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '로그인 처리 중 서버 에러' }, { status: 500 });
  }
}
