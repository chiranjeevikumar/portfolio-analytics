import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { DEFAULT_CHIRU_PROJECTS } from '@/lib/fallbackData';

export async function GET() {
  try {
    const rows = await query(`SELECT * FROM projects WHERE is_active = TRUE ORDER BY order_index ASC`);
    if (rows.length > 0) {
      return NextResponse.json(rows);
    }
    return NextResponse.json(DEFAULT_CHIRU_PROJECTS);
  } catch (err: any) {
    return NextResponse.json(DEFAULT_CHIRU_PROJECTS);
  }
}
