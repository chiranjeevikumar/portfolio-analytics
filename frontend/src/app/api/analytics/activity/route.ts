import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query<{
      id: string;
      page_type: string;
      created_at: string;
      time_spent_seconds: number;
      city: string;
      country: string;
      device_type: string;
      identified_name: string;
      project_title: string;
    }>(
      `SELECT
        pv.id,
        pv.page_type,
        pv.created_at,
        pv.time_spent_seconds,
        v.city,
        v.country,
        v.device_type,
        v.identified_name,
        p.title as project_title
       FROM page_views pv
       LEFT JOIN visitors v ON v.id = pv.visitor_id
       LEFT JOIN projects p ON p.id = pv.project_id
       ORDER BY pv.created_at DESC
       LIMIT 30`
    );

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('Activity API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
