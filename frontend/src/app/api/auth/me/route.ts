import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }

  const user = getServerUser(req);
  return NextResponse.json(user);
}
