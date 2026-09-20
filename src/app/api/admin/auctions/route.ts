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

export async function GET(request: Request) {
  try {
    const admin = getAdminFromCookie(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const auctions = await db.query(`
      SELECT am.*, ac.title, ac.image_url, u.email as winner_email
      FROM auction_monitoring am
      LEFT JOIN artwork_consignments ac ON am.artwork_id = ac.consignment_id
      LEFT JOIN users u ON am.current_winner_id = u.id
      ORDER BY am.created_at DESC
    `);

    const bids = await db.query(`
      SELECT t.*, u.email, ac.title as artwork_title
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN artwork_consignments ac ON t.artwork_id = ac.consignment_id
      WHERE t.type = 'bid'
      ORDER BY t.created_at DESC
      LIMIT 50
    `);

    return NextResponse.json({ auctions: auctions.rows, recent_bids: bids.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// 경매 강제 정지/재개
export async function POST(request: Request) {
  try {
    const admin = getAdminFromCookie(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { auction_id, action } = await request.json();
    let newStatus = action === 'suspend' ? 'SUSPENDED' : 'BIDDING';

    await db.query('UPDATE auction_monitoring SET status = $1 WHERE auction_id = $2', [newStatus, auction_id]);

    await db.query(
      `INSERT INTO admin_audit_logs (admin_id, action_type, target_domain, target_id, ip_address)
       VALUES ($1, 'BID_CANCEL', 'auction_monitoring', $2, 'server')`,
      [admin.adminId, auction_id]
    );

    return NextResponse.json({ message: 'Auction status updated', status: newStatus });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
