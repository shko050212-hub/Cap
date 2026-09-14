import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';

export async function POST(request: Request) {
  try {
    const { email, otpToken } = await request.json();

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const user = result.rows[0];

    // OTP 검증
    const verified = speakeasy.totp.verify({
      secret: user.otp_secret,
      encoding: 'base32',
      token: otpToken
    });

    if (!verified) {
      return NextResponse.json({ error: 'OTP 인증번호가 올바르지 않습니다.' }, { status: 401 });
    }

    // JWT 발급
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1d' }
    );

    return NextResponse.json({ message: 'OTP 인증 성공', token, role: user.role }, { status: 200 });

  } catch (error) {
    console.error('OTP Verify error:', error);
    return NextResponse.json({ error: '서버 에러' }, { status: 500 });
  }
}
