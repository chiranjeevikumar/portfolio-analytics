import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      profile_username = 'chiranjeevi',
      visitor_fingerprint,
      page_type = 'portfolio',
      project_id,
      time_spent_seconds,
      device_type,
      browser,
      os,
      referrer,
    } = body;

    if (!visitor_fingerprint) {
      return NextResponse.json({ ok: false, error: 'Missing fingerprint' }, { status: 400 });
    }

    // Extract geo info from Vercel edge headers
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               req.headers.get('x-real-ip') ||
               '127.0.0.1';
    const country = req.headers.get('x-vercel-ip-country') || 'Unknown';
    const city = req.headers.get('x-vercel-ip-city') || 'Unknown';
    const region = req.headers.get('x-vercel-ip-country-region') || 'Unknown';

    // 1. Upsert into visitors
    const visitorRows = await query<{ id: string }>(
      `INSERT INTO visitors (
        profile_username, visitor_fingerprint, ip_address, country, city, region,
        device_type, browser, os, referrer, first_seen, last_seen, visit_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), 1)
      ON CONFLICT (profile_username, visitor_fingerprint) DO UPDATE SET
        last_seen = NOW(),
        visit_count = visitors.visit_count + 1,
        ip_address = COALESCE(EXCLUDED.ip_address, visitors.ip_address),
        country = CASE WHEN EXCLUDED.country <> 'Unknown' THEN EXCLUDED.country ELSE visitors.country END,
        city = CASE WHEN EXCLUDED.city <> 'Unknown' THEN EXCLUDED.city ELSE visitors.city END,
        device_type = COALESCE(EXCLUDED.device_type, visitors.device_type),
        browser = COALESCE(EXCLUDED.browser, visitors.browser),
        os = COALESCE(EXCLUDED.os, visitors.os)
      RETURNING id`,
      [profile_username, visitor_fingerprint, ip, country, city, region, device_type, browser, os, referrer]
    );

    const visitorId = visitorRows[0]?.id;

    // Check project UUID if provided
    let validProjectId: string | null = null;
    if (project_id) {
      const pCheck = await query<{ id: string }>(
        `SELECT id FROM projects WHERE id::text = $1 LIMIT 1`,
        [project_id]
      );
      if (pCheck.length > 0) {
        validProjectId = pCheck[0].id;
      }
    }

    // 2. Insert into page_views
    await query(
      `INSERT INTO page_views (
        visitor_id, profile_username, page_type, project_id, time_spent_seconds, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        visitorId || null,
        profile_username,
        page_type,
        validProjectId,
        time_spent_seconds || 0,
        JSON.stringify({ ip, city, country, browser, os, device_type })
      ]
    );

    return NextResponse.json({ ok: true, visitor_id: visitorId });
  } catch (err: any) {
    console.error('Tracking API error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
