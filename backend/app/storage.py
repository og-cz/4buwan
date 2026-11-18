"""Local storage for the 4buwan Signature Verification API.

Separate data folders under ROOT, one per data mode:
    real/    the office's own enrolled people and checks (starts empty)
    sample/  example people and checks seeded from the public CEDAR development writers
    demo/    a throwaway copy of sample/ for one demo session; rebuilt by POST /api/demo/start and
             cleared when the service starts, so nothing done in a demo is kept
Each holds its own sigdesk.db, images/ and profiles/. The mode of a request comes from the
X-Data-Mode header (or ?mode= on image links) and is kept in a context variable for that request.
"""
from __future__ import annotations

import os
import shutil
import sqlite3
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(os.environ.get("SIGDESK_DATA", Path(__file__).resolve().parents[1] / "data"))
MODES = ("real", "sample", "demo")
current_mode: ContextVar[str] = ContextVar("data_mode", default="real")


def migrate_flat_layout(root: Path = ROOT) -> bool:
    """One-time move of the old single-folder layout (ROOT/sigdesk.db, images/, profiles/) into ROOT/real/."""
    old = [root / n for n in ("sigdesk.db", "images", "profiles") if (root / n).exists()]
    if not old or (root / "real" / "sigdesk.db").exists(): return False
    (root / "real").mkdir(parents=True, exist_ok=True)
    for p in old: shutil.move(str(p), str(root / "real" / p.name))
    return True


def data_dir(mode: str | None = None) -> Path:
    """Folder of the given (or the current request's) data mode, created on first use."""
    m = mode or current_mode.get()
    if m not in MODES: m = "real"
    d = ROOT / m
    (d / "images").mkdir(parents=True, exist_ok=True); (d / "profiles").mkdir(exist_ok=True)
    return d


migrate_flat_layout()
shutil.rmtree(ROOT / "demo", ignore_errors=True)   # a demo never outlives the service run


class Connection(sqlite3.Connection):
    """`with db() as c:` commits (or rolls back) and then closes, so no file stays locked on Windows."""
    def __exit__(self, *exc):
        try:
            return super().__exit__(*exc)
        finally:
            self.close()


def db() -> sqlite3.Connection:
    c = sqlite3.connect(data_dir() / "sigdesk.db", factory=Connection); c.row_factory = sqlite3.Row
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


# Image paths are stored relative to the mode folder ("images/<file>"), so the data folder can be moved or copied.
PATH_COLUMNS = (("samples", "path"), ("checks", "image"), ("attachments", "path"))


def relative(p: str) -> str:
    """'images/<file>' for any stored path, absolute or relative, old or new (Windows or POSIX separators)."""
    q = Path(str(p).replace("\\", "/"))
    parts = q.parts
    if "images" in parts: return "/".join(parts[parts.index("images"):])
    return q.as_posix()


def resolve(p: str) -> Path:
    """Absolute file path for a stored image path."""
    return data_dir() / relative(p)


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
    (data_dir() / rel).write_bytes(data); return rel
