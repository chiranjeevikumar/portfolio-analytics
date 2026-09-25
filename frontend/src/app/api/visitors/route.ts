import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const user = getServerUser(req);
    const username = user.username;

    const visitors = await query<{
      id: string;
      country: string;
      city: string;
      device_type: string;
      browser: string;
      identified_name: string;
      identified_email: string;
      visit_count: number;
      last_seen: string;
      first_seen: string;
    }>(
      `SELECT
        id, country, city, device_type, browser,
        identified_name, identified_email, visit_count,
        last_seen, first_seen
       FROM visitors
       WHERE profile_username = $1
       ORDER BY last_seen DESC
       LIMIT 50`,
      [username]
    );

    const visitorIds = visitors.map(v => v.id);
    let journeys: Record<string, any[]> = {};

    if (visitorIds.length > 0) {
      const journeyRows = await query<{
        visitor_id: string;
        page_type: string;
        project_id: string;
        created_at: string;
      }>(
        `SELECT visitor_id, page_type, project_id, created_at
         FROM page_views
         WHERE visitor_id = ANY($1::uuid[])
         ORDER BY created_at DESC
         LIMIT 200`,
        [visitorIds]
      );

      for (const j of journeyRows) {
        if (!journeys[j.visitor_id]) journeys[j.visitor_id] = [];
        journeys[j.visitor_id].push({
          page_type: j.page_type,
          project_id: j.project_id,
          created_at: j.created_at,
        });
      }
    }

    const result = visitors.map(v => ({
      ...v,
      journey: journeys[v.id] || [],
    }));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Visitors API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
