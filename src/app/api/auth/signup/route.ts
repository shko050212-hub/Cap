import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, height_cm, role, bank_name, bank_account } = body;

    // 빈 값 체크
    if (!email || !password || !name || !height_cm) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    // 비밀번호 유효성 검사 (8자 이상, 특수문자 포함)
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ error: '비밀번호는 8글자 이상이어야 하며, 특수문자를 최소 1개 이상 포함해야 합니다.' }, { status: 400 });
    }

    // 이메일 중복 확인
    const checkUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    
    // DB 저장 (phone 컬럼 생략)
    const insertQuery = `
      INSERT INTO users (email, password_hash, name, role, height_cm, bank_name, bank_account)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, role, height_cm
    `;
    const values = [email, password_hash, name, role || 'BUYER', height_cm || 170.0, bank_name || null, bank_account || null];

    const result = await db.query(insertQuery, values);
    const user = result.rows[0];

    // JWT 발급
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, height_cm: user.height_cm },
      process.env.JWT_SECRET || 'artmart-super-secret-key',
      { expiresIn: '24h' }
    );

    return NextResponse.json({ message: '회원가입 및 발권 완료', token, user }, { status: 201 });
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: '회원가입 실패' }, { status: 500 });
  }
}
