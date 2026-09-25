from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from database import get_db, get_cursor
from auth import get_current_user
import json

router = APIRouter(prefix="/api/profile", tags=["profile"])


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    twitter_url: Optional[str] = None
    website_url: Optional[str] = None
    email_contact: Optional[str] = None
    phone_contact: Optional[str] = None
    email_visible: Optional[bool] = None
    phone_visible: Optional[bool] = None
    notify_on_visit: Optional[bool] = None
    notify_on_connect: Optional[bool] = None
    notify_email: Optional[str] = None
    skills: Optional[List[str]] = None


@router.get("/me")
def get_my_profile(current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute("SELECT * FROM profiles WHERE user_id=%s", (current_user["sub"],))
            profile = cur.fetchone()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return dict(profile)


@router.put("/me")
def update_profile(data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in data.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Handle skills JSON
    if "skills" in updates:
        updates["skills"] = json.dumps(updates["skills"])

    set_clause = ", ".join([f"{k}=%s" for k in updates.keys()])
    values = list(updates.values()) + [current_user["sub"]]

    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                f"UPDATE profiles SET {set_clause}, updated_at=NOW() WHERE user_id=%s RETURNING *",
                values
            )
            profile = cur.fetchone()
    return dict(profile)


@router.get("/{username}")
def get_public_profile(username: str):
    """Public endpoint — no auth required."""
    target_username = "chiranjeevi" if username.lower() in ("chiru", "chiranjeevi") else username
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                """SELECT name, username, title, company, experience_years, bio, avatar_url,
                          resume_url, linkedin_url, github_url, twitter_url, website_url,
                          email_contact, phone_contact, email_visible, phone_visible, skills
                   FROM profiles WHERE username=%s AND is_active=TRUE""",
                (target_username,)
            )
            profile = cur.fetchone()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    result = dict(profile)
    # Respect visibility settings
    if not result.get("email_visible"):
        result.pop("email_contact", None)
    if not result.get("phone_visible"):
        result.pop("phone_contact", None)
    return result
