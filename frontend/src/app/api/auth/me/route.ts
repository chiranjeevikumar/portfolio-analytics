import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // If authorization header or token exists, return admin user
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.includes('chiranjeevikumar')) {
    return NextResponse.json({
      id: '752caf06-763d-46f2-8b3c-02a4be73f3bf',
      username: 'chiranjeevikumar',
      email: 'chiranjeevikumar@gmail.com',
    });
  }

  return NextResponse.json({
    id: 'be000031-d0e3-49cf-9544-859b365ebf8d',
    username: 'chiranjeevi',
    email: 'chiranjeevi4205@gmail.com',
  });
}
