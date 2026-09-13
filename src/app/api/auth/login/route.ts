import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 개발/테스트용 하드코딩된 마스터 어드민 계정 (DB 연동 없이 바로 로그인 가능)
    if (email === 'admin@artmart.com' && password === 'admin1234') {
      const token = jwt.sign(
        { userId: 0, email: 'admin@artmart.com', role: 'ADMIN', name: '마스터 관리자' },
        process.env.JWT_SECRET || 'artmart-super-secret-key',
        { expiresIn: '24h' }
      );
      return NextResponse.json({ 
        message: '관리자 로그인 성공', 
        token, 
        user: { id: 0, email: 'admin@artmart.com', role: 'ADMIN', name: '마스터 관리자' } 
      }, { status: 200 });
    }

    // 실제 DB 연동 로그인 로직
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: '가입되지 않은 이메일입니다.' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    // JWT 발급
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'artmart-super-secret-key',
      { expiresIn: '24h' }
    );

    return NextResponse.json({ message: '로그인 성공', token, user: { id: user.id, email: user.email, role: user.role, name: user.name } }, { status: 200 });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
