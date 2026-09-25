from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from database import get_db, get_cursor
from auth import get_current_user
import json

router = APIRouter(prefix="/api/projects", tags=["projects"])


class ProjectCreate(BaseModel):
    title: str
    description: str
    long_description: Optional[str] = None
    tech_stack: List[str] = []
    capabilities: List[str] = []
    demo_video_url: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_featured: bool = True
    order_index: int = 0


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    long_description: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    capabilities: Optional[List[str]] = None
    demo_video_url: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    order_index: Optional[int] = None


@router.get("/public/{username}")
def get_public_projects(username: str):
    """Public endpoint — returns active featured projects for a username."""
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                """SELECT p.id, p.title, p.description, p.long_description,
                          p.tech_stack, p.capabilities, p.demo_video_url,
                          p.github_url, p.live_url, p.thumbnail_url, p.is_featured,
                          p.order_index,
                          COALESCE(pv.view_count, 0) AS view_count
                   FROM projects p
                   LEFT JOIN (
                       SELECT project_id, COUNT(*) as view_count
                       FROM page_views WHERE page_type='project'
                       GROUP BY project_id
                   ) pv ON pv.project_id = p.id
                   JOIN users u ON u.id = p.user_id
                   WHERE u.username=%s AND p.is_active=TRUE AND p.is_featured=TRUE
                   ORDER BY p.order_index ASC, p.created_at DESC""",
                (username,)
            )
            projects = cur.fetchall()
    return [dict(p) for p in projects]


@router.get("/mine")
def get_my_projects(current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                "SELECT * FROM projects WHERE user_id=%s ORDER BY order_index ASC, created_at DESC",
                (current_user["sub"],)
            )
            projects = cur.fetchall()
    return [dict(p) for p in projects]


@router.post("/")
def create_project(data: ProjectCreate, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                """INSERT INTO projects (user_id, title, description, long_description,
                   tech_stack, capabilities, demo_video_url, github_url, live_url,
                   thumbnail_url, is_featured, order_index)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *""",
                (
                    current_user["sub"], data.title, data.description,
                    data.long_description, json.dumps(data.tech_stack),
                    json.dumps(data.capabilities), data.demo_video_url,
                    data.github_url, data.live_url, data.thumbnail_url,
                    data.is_featured, data.order_index
                )
            )
            project = cur.fetchone()
    return dict(project)


@router.put("/{project_id}")
def update_project(project_id: str, data: ProjectUpdate, current_user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in data.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    for field in ["tech_stack", "capabilities"]:
        if field in updates:
            updates[field] = json.dumps(updates[field])

    set_clause = ", ".join([f"{k}=%s" for k in updates.keys()])
    values = list(updates.values()) + [project_id, current_user["sub"]]

    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                f"UPDATE projects SET {set_clause}, updated_at=NOW() WHERE id=%s AND user_id=%s RETURNING *",
                values
            )
            project = cur.fetchone()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return dict(project)


@router.delete("/{project_id}")
def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                "UPDATE projects SET is_active=FALSE WHERE id=%s AND user_id=%s",
                (project_id, current_user["sub"])
            )
    return {"message": "Project deleted"}
