import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 1. Total visitors
    const totalVisitorsRes = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM visitors`
    );
    const totalVisitors = parseInt(totalVisitorsRes[0]?.count || '0', 10);

    // 2. Unique visitors
    const uniqueVisitorsRes = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT visitor_fingerprint) as count FROM visitors`
    );
    const uniqueVisitors = parseInt(uniqueVisitorsRes[0]?.count || '0', 10);

    // 3. Visitors today
    const visitorsTodayRes = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT visitor_id) as count FROM page_views WHERE created_at >= CURRENT_DATE`
    );
    const visitorsToday = parseInt(visitorsTodayRes[0]?.count || '0', 10);

    // 4. Unique today
    const uniqueTodayRes = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT visitor_id) as count FROM page_views WHERE created_at >= CURRENT_DATE`
    );
    const uniqueToday = parseInt(uniqueTodayRes[0]?.count || '0', 10);

    // 5. Project views today
    const projectViewsTodayRes = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM page_views WHERE page_type IN ('project', 'demo_video', 'live_demo_click') AND created_at >= CURRENT_DATE`
    );
    const projectViewsToday = parseInt(projectViewsTodayRes[0]?.count || '0', 10);

    // 6. Demo clicks today
    const demoClicksTodayRes = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM page_views WHERE page_type IN ('demo_video', 'live_demo_click') AND created_at >= CURRENT_DATE`
    );
    const demoClicksToday = parseInt(demoClicksTodayRes[0]?.count || '0', 10);

    // 7. Visitors this week
    const visitorsWeekRes = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT visitor_id) as count FROM page_views WHERE created_at >= (NOW() - INTERVAL '7 days')`
    );
    const visitorsWeek = parseInt(visitorsWeekRes[0]?.count || '0', 10);

    // 8. Total leads
    const totalLeadsRes = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM connections`
    );
    const totalLeads = parseInt(totalLeadsRes[0]?.count || '0', 10);

    // 9. Total project views
    const totalProjectViewsRes = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM page_views WHERE page_type IN ('project', 'demo_video', 'live_demo_click')`
    );
    const totalProjectViews = parseInt(totalProjectViewsRes[0]?.count || '0', 10);

    return NextResponse.json({
      total_visitors: totalVisitors,
      unique_visitors: uniqueVisitors,
      visitors_today: visitorsToday,
      unique_today: uniqueToday,
      project_views_today: projectViewsToday,
      demo_clicks_today: demoClicksToday,
      visitors_week: visitorsWeek,
      total_leads: totalLeads,
      total_project_views: totalProjectViews,
    });
  } catch (err: any) {
    console.error('Overview API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
