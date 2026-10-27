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
    return c


def now() -> str: return datetime.now(timezone.utc).isoformat(timespec="seconds")


def log(c, kind, ref, detail=""): c.execute("INSERT INTO events(at,kind,ref,detail) VALUES(?,?,?,?)", (now(), kind, ref, detail))


def save_upload(data: bytes, name: str) -> str:
    p = DATA / "images" / f"{uuid.uuid4().hex}{Path(name or 'x.png').suffix.lower() or '.png'}"
    p.write_bytes(data); return str(p)
