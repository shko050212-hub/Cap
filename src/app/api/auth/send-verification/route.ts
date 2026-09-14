import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { verificationStore } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 });
    }

    // 6자리 난수 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 5분 후 만료
    verificationStore.set(email, {
      code,
      expires: Date.now() + 5 * 60 * 1000
    });

    // nodemailer 설정
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 메일 발송
    await transporter.sendMail({
      from: `"ArtMart 갤러리" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '[ArtMart] 회원가입 이메일 인증번호 안내',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">ArtMart 이메일 인증</h2>
          <p style="color: #555; text-align: center;">아래 6자리 인증번호를 가입 화면에 입력해주세요.</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">이 인증번호는 5분 동안만 유효합니다.</p>
        </div>
      `
    });

    return NextResponse.json({ message: '인증번호가 발송되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: '메일 발송에 실패했습니다.' }, { status: 500 });
  }
}
