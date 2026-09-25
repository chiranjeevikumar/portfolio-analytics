from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from database import get_db, get_cursor
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    username: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register(req: RegisterRequest):
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if len(req.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")

    with get_db() as conn:
        with get_cursor(conn) as cur:
            # Check existing email/username
            cur.execute("SELECT id FROM users WHERE email=%s OR username=%s", (req.email, req.username))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Email or username already taken")

            # Create user
            cur.execute(
                "INSERT INTO users (email, password_hash, username) VALUES (%s, %s, %s) RETURNING id, username",
                (req.email, hash_password(req.password), req.username)
            )
            user = cur.fetchone()

            # Create default profile
            cur.execute(
                """INSERT INTO profiles (user_id, username, name, notify_email)
                   VALUES (%s, %s, %s, %s)""",
                (str(user["id"]), req.username, req.name, req.email)
            )

    token = create_access_token({"sub": str(user["id"]), "username": req.username})
    return {"access_token": token, "token_type": "bearer", "username": req.username}


@router.post("/login")
def login(req: LoginRequest):
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute("SELECT id, username, password_hash FROM users WHERE email=%s", (req.email,))
            user = cur.fetchone()

    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["id"]), "username": user["username"]})
    return {"access_token": token, "token_type": "bearer", "username": user["username"]}


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(
                "SELECT u.id, u.email, u.username, u.created_at FROM users u WHERE u.id=%s",
                (current_user["sub"],)
            )
            user = cur.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(user)
