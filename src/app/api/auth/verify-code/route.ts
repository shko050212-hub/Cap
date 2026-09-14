import { NextResponse } from 'next/server';
import { verificationStore } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    const storedData = verificationStore.get(email);

    if (!storedData) {
      return NextResponse.json({ error: '인증번호 발송 기록이 없습니다. 다시 요청해주세요.' }, { status: 400 });
    }

    if (Date.now() > storedData.expires) {
      verificationStore.delete(email);
      return NextResponse.json({ error: '인증번호가 만료되었습니다. 다시 요청해주세요.' }, { status: 400 });
    }

    if (storedData.code !== code) {
      return NextResponse.json({ error: '인증번호가 일치하지 않습니다.' }, { status: 400 });
    }

    // 인증 성공 시 기록 삭제 (재사용 방지)
    verificationStore.delete(email);

    return NextResponse.json({ message: '인증이 완료되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
