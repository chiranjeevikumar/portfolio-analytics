import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '14', 10);

    const rows = await query<{
      date: string;
      total_visits: string;
      unique_visitors: string;
      project_views: string;
    }>(
      `SELECT
        d::date::text as date,
        COUNT(pv.id) as total_visits,
        COUNT(DISTINCT pv.visitor_id) as unique_visitors,
        COUNT(CASE WHEN pv.page_type IN ('project', 'demo_video', 'live_demo_click') THEN 1 END) as project_views
       FROM generate_series(
         (CURRENT_DATE - ($1 || ' days')::interval)::date,
         CURRENT_DATE,
         '1 day'::interval
       ) d
       LEFT JOIN page_views pv ON pv.created_at::date = d::date
       GROUP BY d::date
       ORDER BY d::date ASC`,
      [days]
    );

    const chartData = rows.map(r => ({
      date: r.date,
      total_visits: parseInt(r.total_visits || '0', 10),
      unique_visitors: parseInt(r.unique_visitors || '0', 10),
      project_views: parseInt(r.project_views || '0', 10),
    }));

    return NextResponse.json(chartData);
  } catch (err: any) {
    console.error('Chart API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
