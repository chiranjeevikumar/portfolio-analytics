import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const result = await query(
      `UPDATE connections SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error('Update connection status error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
