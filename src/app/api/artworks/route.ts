import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

function getUserFromHeader(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
  } catch (err) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromHeader(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, price, src, saleType } = await request.json();
    
    const res = await db.query(
      'INSERT INTO artwork_consignments (seller_id, title, price, image_url, sale_type, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING consignment_id as id, title, price, image_url as src, sale_type, status',
      [user.userId, title, price, src, saleType, 'REQUESTED']
    );
    
    return NextResponse.json({ message: 'Artwork created', artwork: res.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
