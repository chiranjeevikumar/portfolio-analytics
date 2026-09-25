import os
from typing import Optional
import psycopg2
import psycopg2.extras
from psycopg2.pool import ThreadedConnectionPool
from contextlib import contextmanager
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env", override=True)

DATABASE_URL = os.getenv("DATABASE_URL")

# Lazy pool — initialized on first use
_pool: Optional[ThreadedConnectionPool] = None


def get_pool() -> ThreadedConnectionPool:
    global _pool
    if _pool is None:
        _pool = ThreadedConnectionPool(minconn=1, maxconn=10, dsn=DATABASE_URL)
    return _pool


def get_live_connection():
    """Get a valid, alive connection from the pool, replacing dead ones."""
    pool = get_pool()
    conn = pool.getconn()
    try:
        if conn.closed:
            raise psycopg2.OperationalError("Connection already closed")
        try:
            conn.rollback()
        except Exception:
            pass
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
        conn.rollback()
        return conn
    except Exception:
        try:
            pool.putconn(conn, close=True)
        except Exception:
            pass
        return pool.getconn()


@contextmanager
def get_db():
    """Context manager for database connections from the pool with auto-reconnect."""
    pool = get_pool()
    conn = get_live_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        try:
            if not conn.closed:
                conn.rollback()
        except Exception:
            pass
        raise
    finally:
        try:
            if not conn.closed:
                pool.putconn(conn)
            else:
                pool.putconn(conn, close=True)
        except Exception:
            pass


def get_cursor(conn):
    """Return a DictCursor for dict-like row access."""
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def init_db():
    """Initialize database by running schema.sql."""
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, "r") as f:
        schema_sql = f.read()
    with get_db() as conn:
        with get_cursor(conn) as cur:
            cur.execute(schema_sql)
    print("[OK] Database initialized successfully")
