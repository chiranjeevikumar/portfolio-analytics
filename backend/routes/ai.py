import os
import re
import json
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from database import get_db, get_cursor

router = APIRouter(prefix="/api/ai", tags=["ai"])


class AskRequest(BaseModel):
    username: str
    query: str
    visitor_id: Optional[str] = None


class RelevantProject(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = []
    live_url: Optional[str] = None
    github_url: Optional[str] = None


class AskResponse(BaseModel):
    answer: str
    relevant_projects: List[dict] = []
    suggested_followups: List[str] = []


def fallback_rag(query: str, profile: dict, projects: list) -> dict:
    """Smart contextual RAG fallback when no external LLM API key is configured."""
    q = query.lower().strip()
    name = profile.get("name") or profile.get("username")
    title = profile.get("title") or "Software Professional"
    company = profile.get("company") or ""
    exp = profile.get("experience_years")
    bio = profile.get("bio") or ""
    skills = profile.get("skills") or []
    if isinstance(skills, str):
        try:
            skills = json.loads(skills)
        except Exception:
            skills = [s.strip() for s in skills.split(",") if s.strip()]

    # Score and match projects
    scored_projects = []
    for proj in projects:
        score = 0
        p_title = (proj.get("title") or "").lower()
        p_desc = (proj.get("description") or "").lower()
        p_tech = proj.get("tech_stack") or []
        if isinstance(p_tech, str):
            try:
                p_tech = json.loads(p_tech)
            except Exception:
                p_tech = []
        p_tech_lower = [t.lower() for t in p_tech]

        # Match tokens
        tokens = [t for t in re.split(r"\W+", q) if len(t) > 2]
        for token in tokens:
            if token in p_title:
                score += 4
            if token in p_desc:
                score += 2
            if any(token in t for t in p_tech_lower):
                score += 3

        scored_projects.append((score, proj))

    scored_projects.sort(key=lambda x: x[0], reverse=True)
    top_projects = [p for s, p in scored_projects if s > 0][:3]
    if not top_projects and projects:
        top_projects = projects[:2]

    # Formulate answer based on intent
    answer = ""
    suggested = []

    # 1. Contact / Reach out intent
    if any(k in q for k in ["contact", "email", "phone", "reach", "hire", "talk", "connect", "meeting", "call"]):
        answer = (
            f"You can easily connect with {name} right from this portfolio! "
            f"Click the **'Connect'** button on the page to submit a direct message or collaboration inquiry. "
            f"{'You can also check out their LinkedIn profile directly.' if profile.get('linkedin_url') else ''}"
        )
        suggested = ["What projects has " + name + " worked on?", "What are their top technical skills?"]

    # 2. Skills / Tech Stack intent
    elif any(k in q for k in ["skill", "tech", "stack", "language", "framework", "python", "react", "tool"]):
        skills_str = ", ".join(skills) if skills else "modern web and software engineering frameworks"
        answer = (
            f"{name} specializes in {skills_str}. "
            f"With experience as a {title}{f' at {company}' if company else ''}, "
            f"they leverage these tools to build scalable, high-impact systems."
        )
        if top_projects:
            answer += f" Check out related projects like **{top_projects[0].get('title')}** below!"
        suggested = ["Tell me about their experience", "Show me featured projects"]

    # 3. Experience / Bio / Background intent
    elif any(k in q for k in ["experience", "background", "about", "who is", "work", "role", "company", "career"]):
        exp_phrase = f"over {exp} years of industry experience" if exp else "extensive hands-on experience"
        answer = (
            f"{name} is a {title}{f' currently at {company}' if company else ''} with {exp_phrase}. "
            f"{bio if bio else 'They focus on designing robust architectures and delivering performant solutions.'}"
        )
        suggested = ["What projects have they built?", "How do I get in touch?"]

    # 4. Specific project query or general projects
    else:
        if top_projects:
            proj_names = [f"**{p.get('title')}**" for p in top_projects]
            answer = (
                f"{name} has built several notable projects including {', '.join(proj_names)}. "
                f"For example, {top_projects[0].get('title')} is designed for {top_projects[0].get('description') or 'high-performance execution'}. "
                f"You can explore details, source code, and live demos directly below."
            )
        else:
            answer = (
                f"{name} is a {title}{f' at {company}' if company else ''}. "
                f"Feel free to ask about their technical skills, background, or send a connection request!"
            )
        suggested = ["What technical skills do you have?", "How can I contact you?"]

    formatted_projects = [
        {
            "id": str(p.get("id")),
            "title": p.get("title"),
            "description": p.get("description"),
            "tech_stack": p.get("tech_stack") if isinstance(p.get("tech_stack"), list) else [],
            "live_url": p.get("live_url"),
            "github_url": p.get("github_url"),
        }
        for p in top_projects
    ]

    return {
        "answer": answer,
        "relevant_projects": formatted_projects,
        "suggested_followups": suggested,
    }


async def call_gemini_rag(query: str, profile: dict, projects: list, api_key: str) -> Optional[dict]:
    """Call Gemini API when GEMINI_API_KEY is available."""
    try:
        name = profile.get("name") or profile.get("username")
        context = {
            "name": name,
            "title": profile.get("title"),
            "company": profile.get("company"),
            "experience_years": profile.get("experience_years"),
            "bio": profile.get("bio"),
            "skills": profile.get("skills"),
            "projects": [
                {
                    "title": p.get("title"),
                    "description": p.get("description"),
                    "tech_stack": p.get("tech_stack"),
                    "capabilities": p.get("capabilities"),
                }
                for p in projects
            ],
        }

        system_instruction = (
            f"You are the AI Assistant on {name}'s personal portfolio website. "
            f"Answer questions accurately, professionally, and concisely based strictly on the provided portfolio data. "
            f"If the user wants to connect or reach out, encourage them to use the 'Connect' button on the portfolio. "
            f"Do not disclose private email or phone numbers unless visible in the public profile."
        )

        prompt = f"Portfolio Context:\n{json.dumps(context, indent=2)}\n\nVisitor Question: {query}\n\nProvide a helpful, friendly response in 2-4 sentences."

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": system_instruction + "\n\n" + prompt}]}
            ],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 300},
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                fb = fallback_rag(query, profile, projects)
                return {
                    "answer": text,
                    "relevant_projects": fb["relevant_projects"],
                    "suggested_followups": fb["suggested_followups"],
                }
    except Exception as e:
        print(f"[WARN] Gemini API call error: {e}")
    return None


@router.post("/ask", response_model=AskResponse)
async def ask_assistant(req: AskRequest):
    """Ask questions about the portfolio owner's background, skills, and projects."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    with get_db() as conn:
        with get_cursor(conn) as cur:
            # 1. Fetch Profile
            cur.execute(
                """SELECT p.*, u.email as account_email
                   FROM profiles p
                   JOIN users u ON u.id = p.user_id
                   WHERE p.username = %s""",
                (req.username,)
            )
            profile = cur.fetchone()
            if not profile:
                raise HTTPException(status_code=404, detail=f"User '{req.username}' not found")

            # 2. Fetch Projects
            cur.execute(
                """SELECT id, title, description, tech_stack, capabilities, demo_video_url, github_url, live_url
                   FROM projects
                   WHERE user_id = %s
                   ORDER BY order_index ASC""",
                (profile["user_id"],)
            )
            projects = cur.fetchall() or []

    # Check for Gemini / OpenAI API key
    gemini_key = os.getenv("GEMINI_API_KEY")
    result = None
    if gemini_key:
        result = await call_gemini_rag(req.query, profile, projects, gemini_key)

    if not result:
        result = fallback_rag(req.query, profile, projects)

    return AskResponse(
        answer=result["answer"],
        relevant_projects=result["relevant_projects"],
        suggested_followups=result["suggested_followups"],
    )
