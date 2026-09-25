from fastapi import APIRouter, Request, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from database import get_db, get_cursor
from services.geo_service import get_location_from_ip
from services.email_service import send_visit_notification
import hashlib

router = APIRouter(prefix="/api/visitors", tags=["visitors"])


class TrackEventRequest(BaseModel):
    profile_username: str
    visitor_fingerprint: str
    page_type: str  # 'portfolio', 'project', 'demo_video', 'github_click', 'live_demo_click', 'connect_click', 'resume_download'
    project_id: Optional[str] = None
    time_spent_seconds: Optional[int] = None
    device_type: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    referrer: Optional[str] = None
    metadata: Optional[dict] = {}


async def _process_visit(
    req: TrackEventRequest,
    ip: str,
    user_agent: str,
):
    """Background task: upsert visitor, insert page_view, send notification."""
    location = await get_location_from_ip(ip)

    with get_db() as conn:
        with get_cursor(conn) as cur:
            # Upsert visitor
            cur.execute(
                """INSERT INTO visitors
                   (profile_username, visitor_fingerprint, ip_address, country, city, region,
                    device_type, browser, os, referrer, first_seen, last_seen, visit_count)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), 1)
                   ON CONFLICT (profile_username, visitor_fingerprint)
                   DO UPDATE SET last_seen=NOW(), visit_count=visitors.visit_count+1,
                   country=COALESCE(EXCLUDED.country, visitors.country),
                   city=COALESCE(EXCLUDED.city, visitors.city)
                   RETURNING id, visit_count""",
                (
                    req.profile_username, req.visitor_fingerprint, ip,
                    location["country"], location["city"], location["region"],
                    req.device_type, req.browser, req.os, req.referrer
                )
            )
            visitor = cur.fetchone()
            visitor_id = str(visitor["id"])
            is_new_visit = visitor["visit_count"] == 1

            # Insert page_view event
            cur.execute(
                """INSERT INTO page_views
                   (visitor_id, profile_username, page_type, project_id, time_spent_seconds, metadata)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (
                    visitor_id, req.profile_username, req.page_type,
                    req.project_id, req.time_spent_seconds, __import__("json").dumps(req.metadata or {})
                )
            )

            # Update daily analytics aggregate
            cur.execute(
                """INSERT INTO analytics_daily (profile_username, date, total_visits, unique_visitors)
                   VALUES (%s, CURRENT_DATE, 1, %s)
                   ON CONFLICT (profile_username, date) DO UPDATE SET
                   total_visits = analytics_daily.total_visits + 1,
                   unique_visitors = analytics_daily.unique_visitors + CASE WHEN %s THEN 1 ELSE 0 END""",
                (req.profile_username, 1 if is_new_visit else 0, is_new_visit)
            )

            if req.page_type == "project":
                cur.execute(
                    "UPDATE analytics_daily SET project_views=project_views+1 WHERE profile_username=%s AND date=CURRENT_DATE",
                    (req.profile_username,)
                )

            # Fetch profile owner notification settings
            cur.execute(
                """SELECT p.notify_on_visit, p.notify_email, u.email AS user_email,
                          p.name AS owner_name
                   FROM profiles p JOIN users u ON u.id=p.user_id
                   WHERE p.username=%s""",
                (req.profile_username,)
            )
            owner = cur.fetchone()

        # Send email notification if enabled (only on portfolio page visits)
        if owner and owner["notify_on_visit"] and req.page_type == "portfolio":
            notify_email = owner["notify_email"] or owner["user_email"]
            send_visit_notification(
                notify_email,
                owner["owner_name"],
                {
                    "city": location["city"],
                    "country": location["country"],
                    "device_type": req.device_type,
                    "page_type": req.page_type,
                }
            )


@router.post("/track")
async def track_event(req: TrackEventRequest, request: Request, background_tasks: BackgroundTasks):
    """Track a visitor event — fire and forget."""
    ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "127.0.0.1")
    ip = ip.split(",")[0].strip()

    background_tasks.add_task(_process_visit, req, ip, request.headers.get("User-Agent", ""))
    return {"status": "ok"}


@router.post("/identify")
def identify_visitor(
    profile_username: str,
    visitor_fingerprint: str,
    name: str,
    email: str
):
    """Associate a visitor's identity with their fingerprint after lead form submission."""
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                """UPDATE visitors SET identified_name=%s, identified_email=%s
                   WHERE profile_username=%s AND visitor_fingerprint=%s""",
                (name, email, profile_username, visitor_fingerprint)
            )
    return {"status": "identified"}
