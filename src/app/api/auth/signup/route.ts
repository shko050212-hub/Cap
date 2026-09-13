import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, role, height_cm, bank_name, bank_account } = body;

    const password_hash = await bcrypt.hash(password, 10);
    
    // Default height_cm to 170.0 if not provided to satisfy DB schema for now
    const userHeight = height_cm || 170.0;

    // DB Insert (PostgreSQL)
    const result = await db.query(
      `INSERT INTO users (email, password_hash, name, phone, role, height_cm, bank_name, bank_account)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, role, height_cm`,
      [email, password_hash, name, phone, role || 'BUYER', userHeight, bank_name, bank_account]
    );

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
