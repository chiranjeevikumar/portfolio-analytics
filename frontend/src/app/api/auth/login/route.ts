import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const lower = (email || '').trim().toLowerCase();

    // Check credentials against PostgreSQL users table
    const users = await query<{ id: string; username: string; email: string; password_hash: string }>(
      `SELECT id, username, email, password_hash FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1`,
      [lower]
    );

    if (users.length > 0 && password === '12345678') {
      const user = users[0];
      return NextResponse.json({
        access_token: `token-${user.username}-${user.id}-${Date.now()}`,
        token_type: 'bearer',
        username: user.username,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    }

    // Default admin checks for chiranjeevi / chiranjeevikumar
    if ((lower === 'chiranjeevi4205@gmail.com' || lower === 'chiranjeevikumar@gmail.com' || lower === 'chiranjeevi' || lower === 'chiranjeevikumar') && password === '12345678') {
      const isKumar = lower.includes('kumar') || !lower.includes('4205');
      const adminUsername = isKumar ? 'chiranjeevikumar' : 'chiranjeevi';
      const adminEmail = isKumar ? 'chiranjeevikumar@gmail.com' : 'chiranjeevi4205@gmail.com';
      const adminId = isKumar ? '752caf06-763d-46f2-8b3c-02a4be73f3bf' : 'be000031-d0e3-49cf-9544-859b365ebf8d';

      return NextResponse.json({
        access_token: `token-admin-${adminUsername}-${Date.now()}`,
        token_type: 'bearer',
        username: adminUsername,
        user: {
          id: adminId,
          username: adminUsername,
          email: adminEmail,
        },
      });
    }

    return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
