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

    const { amount, action, artworkId, artworkTitle, artworkSrc, type, auctionEndTime } = await request.json();
    
    let query = '';
    if (action === 'add') {
      query = 'UPDATE users SET coins = coins + $1 WHERE id = $2 RETURNING coins';
    } else if (action === 'subtract') {
      query = 'UPDATE users SET coins = coins - $1 WHERE id = $2 RETURNING coins';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const res = await db.query(query, [Number(amount), user.userId]);

    // Transaction 기록
    if (action === 'subtract' && artworkId) {
      await db.query(
        'INSERT INTO transactions (user_id, artwork_id, artwork_title, artwork_src, amount, type, auction_end_time) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [user.userId, artworkId, artworkTitle, artworkSrc, amount, type, auctionEndTime || null]
      );
    }
    
    return NextResponse.json({ message: 'Coins updated', coins: res.rows[0].coins });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
