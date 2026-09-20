import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

function getAdminFromCookie(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  if (!match) return null;
  try {
    return jwt.verify(match[1], process.env.JWT_SECRET || 'fallback-secret') as any;
  } catch {
    return null;
  }
}

// 갤러리와 동일한 더미 데이터 생성
const artworks = [
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    title: `AUCTION DUMMY ${i + 1}`,
    artist: '테스트 작가',
    type: 'Digital Art',
    src: `https://picsum.photos/seed/auction${i}/1000/1000`,
    saleType: 'auction',
    price: 100,
  })),
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: i + 16,
    title: `SALE DUMMY ${i + 1}`,
    artist: '테스트 작가',
    type: 'Digital Art',
    src: `https://picsum.photos/seed/sale${i}/1000/1000`,
    saleType: 'sale',
    price: 100,
  }))
];

export async function GET(request: Request) {
  try {
    const admin = getAdminFromCookie(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 각 작품별 최고 입찰가 가져오기
    const bidsRes = await db.query(`
      SELECT artwork_id, MAX(amount) as highest_bid 
      FROM transactions 
      WHERE type = 'bid' 
      GROUP BY artwork_id
    `);
    
    const bidMap: Record<number, number> = {};
    bidsRes.rows.forEach(r => {
      bidMap[r.artwork_id] = r.highest_bid;
    });

    const items = artworks.map(a => ({
      ...a,
      currentPrice: a.saleType === 'auction' ? (bidMap[a.id] || a.price) : a.price,
      isBidded: a.saleType === 'auction' && !!bidMap[a.id]
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
