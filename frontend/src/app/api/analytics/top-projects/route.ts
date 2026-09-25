import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const user = getServerUser(req);
    const userId = user.id;

    const rows = await query<{
      id: string;
      title: string;
      views: string;
      demo_views: string;
      github_clicks: string;
      live_clicks: string;
    }>(
      `SELECT
        p.id,
        p.title,
        COUNT(CASE WHEN pv.page_type IN ('project', 'demo_video', 'live_demo_click') THEN 1 END) as views,
        COUNT(CASE WHEN pv.page_type = 'demo_video' THEN 1 END) as demo_views,
        COUNT(CASE WHEN pv.page_type = 'github_click' THEN 1 END) as github_clicks,
        COUNT(CASE WHEN pv.page_type = 'live_demo_click' THEN 1 END) as live_clicks
       FROM projects p
       LEFT JOIN page_views pv ON pv.project_id = p.id
       WHERE p.is_active = TRUE AND p.user_id = $1
       GROUP BY p.id, p.title, p.order_index
       ORDER BY p.order_index ASC, views DESC`,
      [userId]
    );

    const topProjects = rows.map(r => ({
      id: r.id,
      title: r.title,
      views: parseInt(r.views || '0', 10),
      demo_views: parseInt(r.demo_views || '0', 10),
      github_clicks: parseInt(r.github_clicks || '0', 10),
      live_clicks: parseInt(r.live_clicks || '0', 10),
    }));

    return NextResponse.json(topProjects);
  } catch (err: any) {
    console.error('Top projects API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
