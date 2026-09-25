import { NextRequest } from 'next/server';

export interface ServerUser {
  id: string;
  username: string;
  email: string;
}

export function getServerUser(req: NextRequest): ServerUser {
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.includes('chiranjeevi') && !authHeader.includes('kumar') && !authHeader.includes('752caf06')) {
    return {
      id: 'be000031-d0e3-49cf-9544-859b365ebf8d',
      username: 'chiranjeevi',
      email: 'chiranjeevi4205@gmail.com',
    };
  }
  // Default admin user is chiranjeevikumar
  return {
    id: '752caf06-763d-46f2-8b3c-02a4be73f3bf',
    username: 'chiranjeevikumar',
    email: 'chiranjeevikumar@gmail.com',
  };
}
