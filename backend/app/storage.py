"""Local storage for the Signature Desk API: one SQLite file plus folders of images and profiles under DATA."""
from __future__ import annotations

import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

DATA = Path(os.environ.get("SIGDESK_DATA", Path(__file__).resolve().parents[1] / "data"))
(DATA / "images").mkdir(parents=True, exist_ok=True); (DATA / "profiles").mkdir(exist_ok=True)
DB = DATA / "sigdesk.db"


def db() -> sqlite3.Connection:
    c = sqlite3.connect(DB); c.row_factory = sqlite3.Row
    c.executescript("""
    CREATE TABLE IF NOT EXISTS persons(id TEXT PRIMARY KEY, name TEXT, external_id TEXT, status TEXT,
        consistency REAL, created TEXT, details TEXT);
    CREATE TABLE IF NOT EXISTS samples(id TEXT PRIMARY KEY, person_id TEXT, idx INTEGER, path TEXT);
    CREATE TABLE IF NOT EXISTS checks(id TEXT PRIMARY KEY, person_id TEXT, created TEXT, verdict TEXT,
        confidence REAL, score REAL, image TEXT, case_title TEXT, notes TEXT, decision TEXT, result TEXT);
    CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT, kind TEXT, ref TEXT, detail TEXT);
    CREATE TABLE IF NOT EXISTS attachments(id TEXT PRIMARY KEY, check_id TEXT, created TEXT, name TEXT, path TEXT, note TEXT);
    """)
    if c.execute("PRAGMA user_version").fetchone()[0] < 1:
        migrate_relative_paths(c)
    return c


# Image paths are stored relative to DATA ("images/<file>"), so the data folder can be moved or copied.
PATH_COLUMNS = (("samples", "path"), ("checks", "image"), ("attachments", "path"))


def relative(p: str) -> str:
    """'images/<file>' for any stored path, absolute or relative, old or new (Windows or POSIX separators)."""
    q = Path(str(p).replace("\\", "/"))
    parts = q.parts
    if "images" in parts: return "/".join(parts[parts.index("images"):])
    return q.as_posix()


def resolve(p: str) -> Path:
    """Absolute file path for a stored image path."""
    return DATA / relative(p)


def migrate_relative_paths(c) -> int:
    """One-time rewrite of absolute image paths written by earlier versions. Returns the number of rows changed."""
    changed = 0
    for table, col in PATH_COLUMNS:
        for rowid, value in c.execute(f"SELECT rowid, {col} FROM {table}").fetchall():
            if value and relative(value) != value:
                c.execute(f"UPDATE {table} SET {col}=? WHERE rowid=?", (relative(value), rowid)); changed += 1
    c.execute("PRAGMA user_version=1"); c.commit()
    return changed


def now() -> str: return datetime.now(timezone.utc).isoformat(timespec="seconds")


def log(c, kind, ref, detail=""): c.execute("INSERT INTO events(at,kind,ref,detail) VALUES(?,?,?,?)", (now(), kind, ref, detail))


def save_upload(data: bytes, name: str) -> str:
    rel = f"images/{uuid.uuid4().hex}{Path(name or 'x.png').suffix.lower() or '.png'}"
    (DATA / rel).write_bytes(data); return rel
