import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query(
      `SELECT id, name, email, interest_type, message, status, created_at
       FROM connections
       ORDER BY created_at DESC
       LIMIT 50`
    );
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('Connections list API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      profile_username = 'chiranjeevi',
      visitor_fingerprint,
      name,
      email,
      interest_type = 'job_opportunity',
      message = '',
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Find visitor_id by fingerprint if present
    let visitorId: string | null = null;
    if (visitor_fingerprint) {
      const v = await query<{ id: string }>(
        `SELECT id FROM visitors WHERE visitor_fingerprint = $1 LIMIT 1`,
        [visitor_fingerprint]
      );
      if (v.length > 0) {
        visitorId = v[0].id;
        // Update identified name/email
        await query(
          `UPDATE visitors SET identified_name = $1, identified_email = $2 WHERE id = $3`,
          [name, email, visitorId]
        );
      }
    }

    // Insert connection lead
    const result = await query(
      `INSERT INTO connections (profile_username, visitor_id, name, email, interest_type, message, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'new', NOW())
       RETURNING id, name, email, interest_type, message, status, created_at`,
      [profile_username, visitorId, name, email, interest_type, message]
    );

    // Also record as a connect_click page view event
    await query(
      `INSERT INTO page_views (visitor_id, profile_username, page_type, metadata, created_at)
       VALUES ($1, $2, 'connect_click', $3, NOW())`,
      [visitorId, profile_username, JSON.stringify({ name, email, interest_type })]
    );

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error('Connection submit API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
