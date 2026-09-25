from fastapi import APIRouter, Depends
from database import get_db, get_cursor
from auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview")
def get_overview(current_user: dict = Depends(get_current_user)):
    """Returns top-level KPI metrics for the dashboard."""
    username = current_user["username"]
    with get_db() as conn:
        with get_cursor(conn) as cur:
            # Total visitors / unique
            cur.execute(
                "SELECT COUNT(*) AS total, COUNT(DISTINCT visitor_fingerprint) AS unique FROM visitors WHERE profile_username=%s",
                (username,)
            )
            visitor_totals = cur.fetchone()

            # Today's stats
            cur.execute(
                """SELECT COALESCE(SUM(total_visits),0) AS visitors_today,
                          COALESCE(SUM(unique_visitors),0) AS unique_today,
                          COALESCE(SUM(project_views),0) AS project_views_today,
                          COALESCE(SUM(demo_clicks),0) AS demo_clicks_today
                   FROM analytics_daily WHERE profile_username=%s AND date=CURRENT_DATE""",
                (username,)
            )
            today = cur.fetchone()

            # This week
            cur.execute(
                """SELECT COALESCE(SUM(total_visits),0) AS visitors_week
                   FROM analytics_daily WHERE profile_username=%s AND date >= CURRENT_DATE - INTERVAL '7 days'""",
                (username,)
            )
            week = cur.fetchone()

            # Total connections/leads
            cur.execute(
                "SELECT COUNT(*) AS total FROM connections WHERE profile_username=%s",
                (username,)
            )
            leads = cur.fetchone()

            # Total project views
            cur.execute(
                "SELECT COUNT(*) AS total FROM page_views WHERE profile_username=%s AND page_type='project'",
                (username,)
            )
            project_views_total = cur.fetchone()

    return {
        "total_visitors": visitor_totals["total"],
        "unique_visitors": visitor_totals["unique"],
        "visitors_today": today["visitors_today"],
        "unique_today": today["unique_today"],
        "project_views_today": today["project_views_today"],
        "demo_clicks_today": today["demo_clicks_today"],
        "visitors_week": week["visitors_week"],
        "total_leads": leads["total"],
        "total_project_views": project_views_total["total"],
    }


@router.get("/chart")
def get_chart_data(days: int = 14, current_user: dict = Depends(get_current_user)):
    """Returns daily visitor chart data for the past N days."""
    username = current_user["username"]
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                """SELECT date, total_visits, unique_visitors, project_views
                   FROM analytics_daily
                   WHERE profile_username=%s AND date >= CURRENT_DATE - INTERVAL '%s days'
                   ORDER BY date ASC""",
                (username, days)
            )
            rows = cur.fetchall()
    return [dict(r) for r in rows]


@router.get("/top-projects")
def get_top_projects(current_user: dict = Depends(get_current_user)):
    """Returns projects ranked by view count."""
    username = current_user["username"]
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                """SELECT pr.title, pr.id,
                          COUNT(pv.id) AS views,
                          COUNT(CASE WHEN pv.page_type='demo_video' THEN 1 END) AS demo_views,
                          COUNT(CASE WHEN pv.page_type='github_click' THEN 1 END) AS github_clicks,
                          COUNT(CASE WHEN pv.page_type='live_demo_click' THEN 1 END) AS live_clicks
                   FROM projects pr
                   LEFT JOIN page_views pv ON pv.project_id=pr.id
                   JOIN users u ON u.id=pr.user_id
                   WHERE u.username=%s AND pr.is_active=TRUE
                   GROUP BY pr.id, pr.title
                   ORDER BY views DESC""",
                (username,)
            )
            rows = cur.fetchall()
    return [dict(r) for r in rows]


@router.get("/recent-visitors")
def get_recent_visitors(limit: int = 20, current_user: dict = Depends(get_current_user)):
    """Returns recent visitor activity with journey."""
    username = current_user["username"]
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                """SELECT v.id, v.country, v.city, v.device_type, v.browser,
                          v.identified_name, v.identified_email,
                          v.visit_count, v.last_seen, v.first_seen,
                          (
                            SELECT json_agg(json_build_object(
                              'page_type', pv2.page_type,
                              'project_id', pv2.project_id,
                              'created_at', pv2.created_at
                            ) ORDER BY pv2.created_at ASC)
                            FROM page_views pv2 WHERE pv2.visitor_id=v.id
                          ) AS journey
                   FROM visitors v
                   WHERE v.profile_username=%s
                   ORDER BY v.last_seen DESC
                   LIMIT %s""",
                (username, limit)
            )
            rows = cur.fetchall()
    return [dict(r) for r in rows]


@router.get("/activity-feed")
def get_activity_feed(limit: int = 30, current_user: dict = Depends(get_current_user)):
    """Returns a chronological activity feed of all events."""
    username = current_user["username"]
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                """SELECT pv.id, pv.page_type, pv.created_at,
                          pv.time_spent_seconds, pv.metadata,
                          v.city, v.country, v.device_type,
                          v.identified_name,
                          pr.title AS project_title
                   FROM page_views pv
                   LEFT JOIN visitors v ON v.id=pv.visitor_id
                   LEFT JOIN projects pr ON pr.id=pv.project_id
                   WHERE pv.profile_username=%s
                   ORDER BY pv.created_at DESC
                   LIMIT %s""",
                (username, limit)
            )
            rows = cur.fetchall()
    return [dict(r) for r in rows]
