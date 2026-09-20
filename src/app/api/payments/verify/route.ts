import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
export async function POST(req: Request) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    const secretKey = 'test_sk_ex6BJGQOVDONlDoKmN1a3W4w2zNb';
    const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

    const response = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId, amount })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Toss Payments verification failed:', data);
      return NextResponse.json({ error: data.message }, { status: response.status });
    }

    // 결제 성공 후 DB 코인 업데이트
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        await db.query('UPDATE users SET coins = coins + $1 WHERE id = $2', [amount, decoded.userId]);
      } catch (err) {
        console.error('Failed to update coins:', err);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Verification error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
