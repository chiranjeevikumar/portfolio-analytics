import os
import sys
from pathlib import Path

# Load .env from the backend directory regardless of where uvicorn is launched from
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env", override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add backend dir to path for sibling imports
sys.path.insert(0, os.path.dirname(__file__))

from database import init_db
from routes.auth import router as auth_router
from routes.profile import router as profile_router
from routes.projects import router as projects_router
from routes.visitors import router as visitors_router
from routes.analytics import router as analytics_router
from routes.connections import router as connections_router
from routes.ai import router as ai_router

app = FastAPI(
    title="Portfolio Analytics API",
    description="Backend API for personal portfolio analytics and lead generation",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(projects_router)
app.include_router(visitors_router)
app.include_router(analytics_router)
app.include_router(connections_router)
app.include_router(ai_router)


@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    try:
        init_db()
        print("[OK] Database initialized")
    except Exception as e:
        print(f"[WARN] DB init skipped (already initialized): {str(e)[:100]}")


@app.get("/")
def root():
    return {
        "name": "Portfolio Analytics API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "status": "running"
    }


@app.get("/health")
def health():
    return {"status": "ok"}
