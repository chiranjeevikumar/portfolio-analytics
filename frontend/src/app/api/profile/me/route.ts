import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { DEFAULT_CHIRU_PROFILE } from '@/lib/fallbackData';

export async function GET(req: NextRequest) {
  try {
    const rows = await query(`SELECT * FROM profiles WHERE username = 'chiranjeevi' LIMIT 1`);
    if (rows.length > 0) {
      return NextResponse.json(rows[0]);
    }
    return NextResponse.json(DEFAULT_CHIRU_PROFILE);
  } catch (err: any) {
    return NextResponse.json(DEFAULT_CHIRU_PROFILE);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, title, company, bio, linkedin_url, github_url, email_contact, skills } = body;

    const res = await query(
      `UPDATE profiles SET
        name = COALESCE($1, name),
        title = COALESCE($2, title),
        company = COALESCE($3, company),
        bio = COALESCE($4, bio),
        linkedin_url = COALESCE($5, linkedin_url),
        github_url = COALESCE($6, github_url),
        email_contact = COALESCE($7, email_contact),
        skills = COALESCE($8::jsonb, skills),
        updated_at = NOW()
       WHERE username IN ('chiranjeevi', 'chiru', 'chiranjeevikumar')
       RETURNING *`,
      [name, title, company, bio, linkedin_url, github_url, email_contact, skills ? JSON.stringify(skills) : null]
    );

    return NextResponse.json(res[0] || body);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
