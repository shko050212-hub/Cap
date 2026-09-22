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

// GET: 작품 목록
export async function GET(request: Request) {
  try {
    const admin = getAdminFromCookie(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = `
      SELECT ac.*, u.email as seller_email, u.profile_name as seller_name
      FROM artwork_consignments ac
      LEFT JOIN users u ON ac.seller_id = u.id
    `;
    const params: any[] = [];
    if (status) {
      query += ' WHERE ac.status = $1';
      params.push(status);
    }
    query += ' ORDER BY ac.created_at DESC';

    const res = await db.query(query, params);
    const stats = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'REQUESTED') as requested,
        COUNT(*) FILTER (WHERE status = 'INSPECTED') as inspected,
        COUNT(*) FILTER (WHERE status = 'EXHIBITED') as exhibited,
        COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected,
        COUNT(*) as total
      FROM artwork_consignments
    `);

    return NextResponse.json({ artworks: res.rows, stats: stats.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: 상태 변경 (승인/반려)
export async function POST(request: Request) {
  try {
    const admin = getAdminFromCookie(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { consignment_id, action, reject_reason } = await request.json();

    const before = await db.query('SELECT * FROM artwork_consignments WHERE consignment_id = $1', [consignment_id]);
    
    let newStatus = '';
    if (action === 'approve') newStatus = 'EXHIBITED';
    else if (action === 'reject') newStatus = 'REJECTED';
    else if (action === 'inspect') newStatus = 'INSPECTED';
    else if (action === 'store') newStatus = 'IN_STORAGE';

    await db.query(
      'UPDATE artwork_consignments SET status = $1, reject_reason = $2, updated_at = NOW() WHERE consignment_id = $3',
      [newStatus, reject_reason || null, consignment_id]
    );

    let artStatus = 'pending';
    if (newStatus === 'EXHIBITED') artStatus = 'approved';
    if (newStatus === 'REJECTED') artStatus = 'rejected';
    
    await db.query(
      'UPDATE artworks SET status = $1 WHERE user_id = $2 AND title = $3',
      [artStatus, before.rows[0].seller_id, before.rows[0].title]
    );

    // 감사 로그
    await db.query(
      `INSERT INTO admin_audit_logs (admin_id, action_type, target_domain, target_id, before_state, after_state, ip_address)
       VALUES ($1, $2, 'artwork_consignments', $3, $4, $5, $6)`,
      [admin.adminId, action.toUpperCase(), consignment_id, JSON.stringify(before.rows[0]), JSON.stringify({ status: newStatus }), 'server']
    );

    return NextResponse.json({ message: 'Updated', status: newStatus });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
