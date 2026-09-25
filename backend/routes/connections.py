from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, EmailStr
from database import get_db, get_cursor
from auth import get_current_user
from services.email_service import send_connect_notification

router = APIRouter(prefix="/api/connections", tags=["connections"])


class ConnectionRequest(BaseModel):
    profile_username: str
    visitor_fingerprint: str
    name: str
    email: EmailStr
    interest_type: str  # job_opportunity, freelance, collaboration, discussion, other
    message: str


@router.post("/")
async def submit_connection(data: ConnectionRequest, background_tasks: BackgroundTasks):
    """Public endpoint — lead generation form submission."""
    with get_db() as conn:
        with get_cursor(conn) as cur:
            # Get visitor id
            cur.execute(
                "SELECT id FROM visitors WHERE profile_username=%s AND visitor_fingerprint=%s",
                (data.profile_username, data.visitor_fingerprint)
            )
            visitor = cur.fetchone()
            visitor_id = str(visitor["id"]) if visitor else None

            # Save connection
            cur.execute(
                """INSERT INTO connections (profile_username, visitor_id, name, email, interest_type, message)
                   VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
                (data.profile_username, visitor_id, data.name, data.email, data.interest_type, data.message)
            )
            conn_record = cur.fetchone()

            # Identify visitor
            if visitor_id:
                cur.execute(
                    "UPDATE visitors SET identified_name=%s, identified_email=%s WHERE id=%s",
                    (data.name, data.email, visitor_id)
                )

            # Update connect_click in analytics
            cur.execute(
                """INSERT INTO analytics_daily (profile_username, date, connect_clicks)
                   VALUES (%s, CURRENT_DATE, 1)
                   ON CONFLICT (profile_username, date) DO UPDATE SET
                   connect_clicks = analytics_daily.connect_clicks + 1""",
                (data.profile_username,)
            )

            # Fetch owner notification settings
            cur.execute(
                """SELECT p.notify_on_connect, p.notify_email, p.name AS owner_name, u.email AS user_email
                   FROM profiles p JOIN users u ON u.id=p.user_id
                   WHERE p.username=%s""",
                (data.profile_username,)
            )
            owner = cur.fetchone()

    if owner and owner["notify_on_connect"]:
        notify_email = owner["notify_email"] or owner["user_email"]
        background_tasks.add_task(
            send_connect_notification,
            notify_email,
            owner["owner_name"],
            data.dict()
        )

    return {"status": "success", "connection_id": str(conn_record["id"])}


@router.get("/")
def get_connections(
    status: str = None,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Dashboard: list all connection requests for the authenticated user."""
    username = current_user["username"]
    with get_db() as conn:
        with get_cursor(conn) as cur:
            if status:
                cur.execute(
                    "SELECT * FROM connections WHERE profile_username=%s AND status=%s ORDER BY created_at DESC LIMIT %s",
                    (username, status, limit)
                )
            else:
                cur.execute(
                    "SELECT * FROM connections WHERE profile_username=%s ORDER BY created_at DESC LIMIT %s",
                    (username, limit)
                )
            rows = cur.fetchall()
    return [dict(r) for r in rows]


@router.put("/{connection_id}/status")
def update_connection_status(
    connection_id: str,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    """Update status of a connection request: new, read, replied, archived."""
    valid_statuses = ["new", "read", "replied", "archived"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    username = current_user["username"]
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                "UPDATE connections SET status=%s WHERE id=%s AND profile_username=%s RETURNING id",
                (status, connection_id, username)
            )
            result = cur.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Connection not found")
    return {"status": "updated"}
