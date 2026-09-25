import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const user = getServerUser(req);
    const userId = user.id;

    const rows = await query(
      `SELECT * FROM projects WHERE is_active = TRUE AND user_id = $1 ORDER BY order_index ASC`,
      [userId]
    );
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json([]);
  }
}
