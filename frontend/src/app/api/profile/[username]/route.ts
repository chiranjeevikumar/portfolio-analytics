import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { DEFAULT_CHIRU_PROFILE } from '@/lib/fallbackData';

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const target = (username.toLowerCase() === 'chiru' || username.toLowerCase() === 'chiranjeevi' || username.toLowerCase() === 'chiranjeevikumar')
      ? 'chiranjeevi'
      : username;

    const rows = await query(`SELECT * FROM profiles WHERE username = $1 LIMIT 1`, [target]);
    if (rows.length > 0) {
      return NextResponse.json(rows[0]);
    }
    return NextResponse.json(DEFAULT_CHIRU_PROFILE);
  } catch (err: any) {
    return NextResponse.json(DEFAULT_CHIRU_PROFILE);
  }
}
