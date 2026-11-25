"""Case extras: examination notes, attachments from the Compare tool, and the Evidence Report log."""
from __future__ import annotations

import io
import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from PIL import Image

from .storage import current_mode, db, log, now, resolve, save_upload

router = APIRouter(prefix="/api")


def _require_case(c, cid: str):
    if not c.execute("SELECT 1 FROM checks WHERE id=?", (cid,)).fetchone(): raise HTTPException(404, "Case not found.")


@router.post("/checks/{cid}/notes")
def add_note(cid: str, text: str = Form(...)):
    """A timestamped examination note, kept in the case timeline."""
    if not text.strip(): raise HTTPException(400, "The note is empty.")
    with db() as c:
        _require_case(c, cid); log(c, "note", cid, text.strip())
    return dict(ok=True)


@router.post("/checks/{cid}/attachments")
async def add_attachments(cid: str, files: list[UploadFile] = File(...), note: str = Form("")):
    """Images and notes from a manual comparison, attached to an existing case."""
    if not files: raise HTTPException(400, "Attach at least one image.")
    blobs = [await f.read() for f in files]
    for f, b in zip(files, blobs):
        try:
            with Image.open(io.BytesIO(b)) as im: im.verify()
        except Exception:
            raise HTTPException(400, f"{f.filename or 'A file'} is not a readable image.")
    with db() as c:
        _require_case(c, cid)
        out = []
        for f, b in zip(files, blobs):
            aid = uuid.uuid4().hex[:12]
            c.execute("INSERT INTO attachments VALUES(?,?,?,?,?,?)", (aid, cid, now(), f.filename or "image", save_upload(b, f.filename), note))
            out.append(dict(id=aid, name=f.filename, url=f"/api/attachments/{aid}/image?mode={current_mode.get()}"))
        log(c, "attachment", cid, f"{len(out)} image(s) from Compare" + (f": {note}" if note else ""))
    return dict(ok=True, attachments=out)


@router.get("/checks/{cid}/attachments")
def list_attachments(cid: str):
    with db() as c:
        _require_case(c, cid)
        rows = c.execute("SELECT id,created,name,note FROM attachments WHERE check_id=? ORDER BY created", (cid,)).fetchall()
    return [dict(r, url=f"/api/attachments/{r['id']}/image?mode={current_mode.get()}") for r in rows]


@router.get("/attachments/{aid}/image")
def attachment_image(aid: str):
    with db() as c:
        r = c.execute("SELECT path FROM attachments WHERE id=?", (aid,)).fetchone()
    if not r or not resolve(r["path"]).exists(): raise HTTPException(404, "Attachment not found.")
    return FileResponse(resolve(r["path"]))


@router.post("/checks/{cid}/report")
def log_report(cid: str):
    """Records that an Evidence Report was exported (printed or saved as PDF)."""
    with db() as c:
        _require_case(c, cid); log(c, "report", cid, "Evidence Report exported")
    return dict(ok=True)


@router.get("/reports")
def reports():
    """Every exported Evidence Report, newest first, with its case."""
    with db() as c:
        rows = c.execute("SELECT e.at, k.id AS case_id, k.case_title, k.verdict, k.decision, p.name FROM events e "
                         "JOIN checks k ON k.id=e.ref LEFT JOIN persons p ON p.id=k.person_id "
                         "WHERE e.kind='report' ORDER BY e.at DESC, e.id DESC").fetchall()
    return [dict(r) for r in rows]
