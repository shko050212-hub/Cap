import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

// 토큰에서 유저 정보 추출 헬퍼
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

export async function GET(request: Request) {
  try {
    const user = getUserFromHeader(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userRes = await db.query('SELECT email, role, coins, profile_name, profile_image FROM users WHERE id = $1', [user.userId]);
    if (userRes.rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const userData = userRes.rows[0];

    const artworksRes = await db.query('SELECT * FROM artworks WHERE user_id = $1 ORDER BY id DESC', [user.userId]);
    
    return NextResponse.json({
      user: userData,
      artworks: artworksRes.rows
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromHeader(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profileName, profileImage } = await request.json();
    
    await db.query('UPDATE users SET profile_name = $1, profile_image = $2 WHERE id = $3', [profileName, profileImage, user.userId]);
    
    return NextResponse.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
