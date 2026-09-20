import { NextResponse } from 'next/server';

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

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Verification error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
