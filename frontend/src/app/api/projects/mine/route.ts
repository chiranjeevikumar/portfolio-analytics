import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const user = getServerUser(req);
    const userId = user.id;

    const rows = await query(
      `SELECT * FROM projects WHERE is_active = TRUE AND (user_id = $1 OR user_id = 'be000031-d0e3-49cf-9544-859b365ebf8d' OR user_id = '752caf06-763d-46f2-8b3c-02a4be73f3bf') ORDER BY order_index ASC`,
      [userId]
    );
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json([]);
  }
}
