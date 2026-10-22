"""Signature Desk API (reference skeleton). Run:  uvicorn app.main:app --reload --port 8000   (from backend/)

This file is the bridge between the React UI and the engine. It may be extended (cases, batch, reports,
settings). It must never re-implement the model: always call sigdesk_engine.engine.build_profile / verify.
Storage: one SQLite file + one folder of images and profiles under backend/data/ (local only).
"""
from __future__ import annotations

import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from sigdesk_engine import engine as E

DATA = Path(os.environ.get("SIGDESK_DATA", Path(__file__).resolve().parents[1] / "data"))
(DATA / "images").mkdir(parents=True, exist_ok=True); (DATA / "profiles").mkdir(exist_ok=True)
DB = DATA / "sigdesk.db"
K = E.Constants.load()

app = FastAPI(title="Signature Desk API", version="0.1")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:8443", "http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])


def db() -> sqlite3.Connection:
    c = sqlite3.connect(DB); c.row_factory = sqlite3.Row
    c.executescript("""
    CREATE TABLE IF NOT EXISTS persons(id TEXT PRIMARY KEY, name TEXT, external_id TEXT, status TEXT,
        consistency REAL, created TEXT, details TEXT);
    CREATE TABLE IF NOT EXISTS samples(id TEXT PRIMARY KEY, person_id TEXT, idx INTEGER, path TEXT);
    CREATE TABLE IF NOT EXISTS checks(id TEXT PRIMARY KEY, person_id TEXT, created TEXT, verdict TEXT,
        confidence REAL, score REAL, image TEXT, case_title TEXT, notes TEXT, decision TEXT, result TEXT);
    CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT, kind TEXT, ref TEXT, detail TEXT);
    """)
    return c


def now() -> str: return datetime.now(timezone.utc).isoformat(timespec="seconds")


def log(c, kind, ref, detail=""): c.execute("INSERT INTO events(at,kind,ref,detail) VALUES(?,?,?,?)", (now(), kind, ref, detail))


def save_upload(data: bytes, name: str) -> str:
    p = DATA / "images" / f"{uuid.uuid4().hex}{Path(name or 'x.png').suffix.lower() or '.png'}"
    p.write_bytes(data); return str(p)


@app.get("/api/health")
def health():
    return dict(ok=True, model=K.meta)


@app.post("/api/quality")
async def quality(file: UploadFile = File(...)):
    return E.quality_check(await file.read())


@app.post("/api/persons")
async def enrol(name: str = Form(...), external_id: str = Form(""), files: list[UploadFile] = File(...)):
    blobs = [await f.read() for f in files]
    bad = [i + 1 for i, b in enumerate(blobs) if not E.quality_check(b)["ok"]]
    if len(blobs) != E.N_ENROL: raise HTTPException(400, f"Exactly {E.N_ENROL} reference samples are needed, got {len(blobs)}.")
    if bad: raise HTTPException(400, f"Samples {bad} failed the quality check.")
    prof, details = E.build_profile(blobs, K)
    pid = uuid.uuid4().hex[:12]; prof.save(DATA / "profiles" / f"{pid}.npz")
    with db() as c:
        c.execute("INSERT INTO persons VALUES(?,?,?,?,?,?,?)", (pid, name, external_id, "Ready", prof.consistency, now(), json.dumps(details)))
        for i, (b, f) in enumerate(zip(blobs, files)):
            c.execute("INSERT INTO samples VALUES(?,?,?,?)", (uuid.uuid4().hex, pid, i + 1, save_upload(b, f.filename)))
        log(c, "enrol", pid, name)
    return dict(id=pid, name=name, external_id=external_id, status="Ready", **details)


@app.get("/api/persons")
def persons(q: str = ""):
    with db() as c:
        rows = c.execute("SELECT p.*, (SELECT COUNT(*) FROM checks k WHERE k.person_id=p.id) AS n_checks FROM persons p "
                         "WHERE name LIKE ? OR external_id LIKE ? ORDER BY created DESC", (f"%{q}%", f"%{q}%")).fetchall()
    return [dict(id=r["id"], name=r["name"], external_id=r["external_id"], status=r["status"], created=r["created"],
                 consistency=E.consistency_band(r["consistency"], K), n_checks=r["n_checks"]) for r in rows]


@app.get("/api/persons/{pid}")
def person(pid: str):
    with db() as c:
        r = c.execute("SELECT * FROM persons WHERE id=?", (pid,)).fetchone()
        if not r: raise HTTPException(404, "Person not found.")
        samples = c.execute("SELECT idx FROM samples WHERE person_id=? ORDER BY idx", (pid,)).fetchall()
    return dict(id=r["id"], name=r["name"], external_id=r["external_id"], status=r["status"], created=r["created"],
                samples=[f"/api/persons/{pid}/samples/{s['idx']}" for s in samples], **json.loads(r["details"]))


@app.get("/api/persons/{pid}/samples/{idx}")
def sample(pid: str, idx: int):
    with db() as c:
        r = c.execute("SELECT path FROM samples WHERE person_id=? AND idx=?", (pid, idx)).fetchone()
    if not r: raise HTTPException(404, "Sample not found.")
    return FileResponse(r["path"])


@app.post("/api/verify")
async def verify(person_id: str = Form(...), file: UploadFile = File(...), strictness: str = Form("Standard"),
                 uncertain: str = Form("Standard"), case_title: str = Form(""), notes: str = Form("")):
    pf = DATA / "profiles" / f"{person_id}.npz"
    if not pf.exists(): raise HTTPException(404, "This person has no ready Signature Profile.")
    blob = await file.read()
    qc = E.quality_check(blob)
    if not qc["ok"]: raise HTTPException(400, qc["issues"][0]["message"])
    res = E.verify(E.Profile.load(pf), blob, K, strictness, uncertain)
    cid = "C-" + uuid.uuid4().hex[:8].upper()
    with db() as c:
        c.execute("INSERT INTO checks VALUES(?,?,?,?,?,?,?,?,?,?,?)", (cid, person_id, now(), res["verdict"], res["confidence"],
                  res["score"], save_upload(blob, file.filename), case_title, notes, "Pending", json.dumps(res)))
        log(c, "verify", cid, res["verdict"])
    return dict(case_id=cid, quality=qc, **res)


@app.get("/api/checks")
def checks(person_id: str = "", verdict: str = ""):
    sql, args = "SELECT k.id,k.person_id,p.name,k.created,k.verdict,k.confidence,k.decision,k.case_title FROM checks k " \
                "LEFT JOIN persons p ON p.id=k.person_id WHERE 1=1", []
    if person_id: sql += " AND k.person_id=?"; args.append(person_id)
    if verdict: sql += " AND k.verdict=?"; args.append(verdict)
    with db() as c:
        return [dict(r) for r in c.execute(sql + " ORDER BY k.created DESC", args).fetchall()]


@app.get("/api/checks/{cid}")
def check(cid: str):
    with db() as c:
        r = c.execute("SELECT * FROM checks WHERE id=?", (cid,)).fetchone()
        ev = c.execute("SELECT at,kind,detail FROM events WHERE ref=? ORDER BY id", (cid,)).fetchall()
    if not r: raise HTTPException(404, "Case not found.")
    return dict(id=r["id"], person_id=r["person_id"], created=r["created"], case_title=r["case_title"], notes=r["notes"],
                decision=r["decision"], timeline=[dict(e) for e in ev], result=json.loads(r["result"]))


@app.post("/api/checks/{cid}/decision")
def decide(cid: str, decision: str = Form(...), note: str = Form("")):
    if decision not in ("Accepted", "Rejected", "Needs more evidence"): raise HTTPException(400, "Unknown decision.")
    with db() as c:
        c.execute("UPDATE checks SET decision=? WHERE id=?", (decision, cid)); log(c, "decision", cid, f"{decision}: {note}")
    return dict(ok=True)


@app.get("/api/research/results")
def research():
    """Numbers for the Research Lab, read from the notebook's outputs (copied into sigdesk_engine/artifacts/research/)."""
    p = E.ARTIFACT_DIR / "research" / "results.json"
    if not p.exists(): raise HTTPException(404, "Copy the notebook's outputs/results.json into sigdesk_engine/artifacts/research/.")
    return json.loads(p.read_text(encoding="utf-8"))
