"""Export and import of a whole workspace in one file: people, reference samples, checks, decisions, notes,
attachments and their dates. Import adds to the current data folder and never deletes anything; importing the
same file twice adds nothing the second time."""
from __future__ import annotations

import io
import json
import re
import sqlite3
import tempfile
import zipfile
from collections import Counter
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

from .storage import current_mode, data_dir, db, log, now, relative

router = APIRouter(prefix="/api")

FORMAT = 1
TABLES = ("persons", "samples", "checks", "attachments")
PATHS = {"samples": "path", "checks": "image", "attachments": "path"}
SAFE_FILE = re.compile(r"^(images|profiles)/[A-Za-z0-9_.-]+$")
MAX_BYTES = 1024 * 1024 * 1024        # 1 GB unpacked


@router.get("/export")
def export_workspace():
    """The current data folder as one zip: manifest.json, sigdesk.db, images/ and profiles/."""
    folder, mode = data_dir(), current_mode.get()
    with db() as c:
        counts = {t: c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in ("persons", "checks")}
    buf = io.BytesIO()
    with tempfile.TemporaryDirectory() as tmp, zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        copy = Path(tmp) / "sigdesk.db"
        with db() as c:
            out = sqlite3.connect(copy)
            try: c.backup(out)
            finally: out.close()
        z.writestr("manifest.json", json.dumps(dict(app="4buwan", format=FORMAT, exported=now(), mode=mode, **counts), indent=2))
        z.write(copy, "sigdesk.db")
        for sub in ("images", "profiles"):
            for f in sorted((folder / sub).iterdir()):
                if f.is_file(): z.write(f, f"{sub}/{f.name}")
    name = f"4buwan-{mode}-{datetime.now().strftime('%Y%m%d-%H%M')}.zip"
    return Response(buf.getvalue(), media_type="application/zip", headers={"Content-Disposition": f'attachment; filename="{name}"'})


def _open(data: bytes) -> zipfile.ZipFile:
    try: z = zipfile.ZipFile(io.BytesIO(data))
    except zipfile.BadZipFile: raise HTTPException(400, "This is not a 4buwan export file (it is not a .zip).")
    names = [n for n in z.namelist() if not n.endswith("/")]
    if "manifest.json" not in names or "sigdesk.db" not in names:
        raise HTTPException(400, "This .zip is not a 4buwan export file: manifest.json or sigdesk.db is missing.")
    try: manifest = json.loads(z.read("manifest.json"))
    except ValueError: raise HTTPException(400, "The export file's manifest.json is damaged.")
    if manifest.get("app") != "4buwan" or manifest.get("format") != FORMAT:
        raise HTTPException(400, "This export file comes from a different app or an unsupported version.")
    unsafe = [n for n in names if n not in ("manifest.json", "sigdesk.db") and not SAFE_FILE.match(n)]
    if unsafe: raise HTTPException(400, f"The export file contains an unexpected entry: {unsafe[0]}")
    if sum(i.file_size for i in z.infolist()) > MAX_BYTES: raise HTTPException(400, "The export file is too large.")
    return z


@router.post("/import")
async def import_workspace(file: UploadFile = File(...)):
    """Adds everything from an export file to the current data folder. Rows that already exist are skipped."""
    z = _open(await file.read())
    folder = data_dir()
    for name in z.namelist():                                   # images and profiles first, so every row finds its file
        if SAFE_FILE.match(name) and not (folder / name).exists(): (folder / name).write_bytes(z.read(name))
    added, skipped = Counter(), Counter()
    with tempfile.TemporaryDirectory() as tmp:
        src_path = Path(tmp) / "import.db"; src_path.write_bytes(z.read("sigdesk.db"))
        src = sqlite3.connect(src_path); src.row_factory = sqlite3.Row
        try:
            with db() as c:
                for table in TABLES:
                    cols = [r[1] for r in c.execute(f"PRAGMA table_info({table})")]
                    try: rows = src.execute(f"SELECT {', '.join(cols)} FROM {table}").fetchall()
                    except sqlite3.Error: raise HTTPException(400, f"The export file's database has no usable {table} table.")
                    for r in rows:
                        values = dict(r)
                        if table in PATHS and values[PATHS[table]]: values[PATHS[table]] = relative(values[PATHS[table]])
                        cur = c.execute(f"INSERT OR IGNORE INTO {table}({', '.join(cols)}) VALUES({', '.join('?' * len(cols))})",
                                        [values[k] for k in cols])
                        (added if cur.rowcount else skipped)[table] += 1
                for at, kind, ref, detail in src.execute("SELECT at, kind, ref, detail FROM events ORDER BY id").fetchall():
                    if not c.execute("SELECT 1 FROM events WHERE at=? AND kind=? AND ref=? AND detail IS ?", (at, kind, ref, detail)).fetchone():
                        c.execute("INSERT INTO events(at, kind, ref, detail) VALUES(?,?,?,?)", (at, kind, ref, detail))
                log(c, "import", file.filename or "export file", f"{added['persons']} people, {added['checks']} checks added")
        except sqlite3.DatabaseError:
            raise HTTPException(400, "The export file's database is damaged.")
        finally:
            src.close()
    return dict(ok=True, persons=added["persons"], checks=added["checks"], samples=added["samples"],
                attachments=added["attachments"], skipped=skipped["persons"] + skipped["checks"])
