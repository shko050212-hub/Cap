import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

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
    
    // Google OTP Secret 생성
    const otpSecret = speakeasy.generateSecret({ name: `ArtMart (${email})` });

    // DB 저장 (otp_secret 포함)
    const insertQuery = `
      INSERT INTO users (email, password_hash, name, role, height_cm, bank_name, bank_account, otp_secret)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, role, height_cm
    `;
    const values = [email, password_hash, name, role || 'BUYER', height_cm || 170.0, bank_name || null, bank_account || null, otpSecret.base32];

    const result = await db.query(insertQuery, values);
    const user = result.rows[0];

    // OTP QR Code 이미지 URL 생성
    const qrCodeUrl = await QRCode.toDataURL(otpSecret.otpauth_url || '');

    // JWT 발급
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1d' }
    );

    return NextResponse.json({ 
      message: '회원가입 성공', 
      token, 
      user,
      qrCodeUrl // 클라이언트에게 QR 코드 전달
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: '회원가입 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
