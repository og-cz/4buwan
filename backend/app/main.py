"""Signature Desk API (reference skeleton). Run:  uvicorn app.main:app --reload --port 8000   (from backend/)

This file is the bridge between the React UI and the engine. It may be extended (cases, batch, reports,
settings). It must never re-implement the model: always call sigdesk_engine.engine.build_profile / verify.
Storage: one SQLite file + one folder of images and profiles under backend/data/ (local only).
"""
from __future__ import annotations

import base64
import csv
import io
import json
import uuid
from collections import Counter
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image

from sigdesk_engine import engine as E

from .storage import DATA, db, log, now, save_upload

K = E.Constants.load()

app = FastAPI(title="Signature Desk API", version="0.1")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:8443", "http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])


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
    with db() as c:
        p = c.execute("SELECT status FROM persons WHERE id=?", (person_id,)).fetchone()
    if not p or p["status"] != "Ready" or not pf.exists(): raise HTTPException(404, "This person has no ready Signature Profile.")
    blob = await file.read()
    qc = E.quality_check(blob)
    if not qc["ok"]: raise HTTPException(400, qc["issues"][0]["message"])
    res = E.verify(E.Profile.load(pf), blob, K, strictness, uncertain)
    cid = "C-" + uuid.uuid4().hex[:8].upper()
    out = dict(case_id=cid, quality=qc, **res)
    with db() as c:
        c.execute("INSERT INTO checks VALUES(?,?,?,?,?,?,?,?,?,?,?)", (cid, person_id, now(), res["verdict"], res["confidence"],
                  res["score"], save_upload(blob, file.filename), case_title, notes, "Pending", json.dumps(out)))
        log(c, "verify", cid, res["verdict"])
    return out


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
                decision=r["decision"], timeline=[dict(e) for e in ev], result={"case_id": r["id"], **json.loads(r["result"])})


@app.post("/api/checks/{cid}/decision")
def decide(cid: str, decision: str = Form(...), note: str = Form("")):
    if decision not in ("Accepted", "Rejected", "Needs more evidence"): raise HTTPException(400, "Unknown decision.")
    with db() as c:
        if not c.execute("SELECT 1 FROM checks WHERE id=?", (cid,)).fetchone(): raise HTTPException(404, "Case not found.")
        c.execute("UPDATE checks SET decision=? WHERE id=?", (decision, cid)); log(c, "decision", cid, f"{decision}: {note}")
    return dict(ok=True)


@app.get("/api/research/results")
def research():
    """Numbers for the Research Lab, read from the notebook's outputs (copied into sigdesk_engine/artifacts/research/)."""
    p = E.ARTIFACT_DIR / "research" / "results.json"
    if not p.exists(): raise HTTPException(404, "Copy the notebook's outputs/results.json into sigdesk_engine/artifacts/research/.")
    return json.loads(p.read_text(encoding="utf-8"))


def data_url(a) -> str:
    buf = io.BytesIO(); Image.fromarray(a).save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


@app.get("/api/checks/{cid}/image")
def check_image(cid: str):
    with db() as c:
        r = c.execute("SELECT image FROM checks WHERE id=?", (cid,)).fetchone()
    if not r or not Path(r["image"]).exists(): raise HTTPException(404, "Image not found.")
    return FileResponse(r["image"])


@app.post("/api/preprocess")
async def preprocess(file: UploadFile = File(...)):
    st = E.stages(await file.read())
    return dict(stages={k: data_url(v) for k, v in st.items()}, hog=data_url(E.hog_picture(st["S4"])))


@app.get("/api/research/performance")
def performance():
    """Rows of the notebook's table_performance.csv (numbers converted, labels unchanged)."""
    p = E.ARTIFACT_DIR / "research" / "table_performance.csv"
    if not p.exists(): raise HTTPException(404, "Copy the notebook's table_performance.csv into sigdesk_engine/artifacts/research/.")
    with p.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    return [{k: (v if k in ("condition", "scope") else int(v) if k == "writers" else float(v)) for k, v in r.items()} for r in rows]


AGREES = {"Accepted": "LIKELY GENUINE", "Rejected": "LIKELY FORGED"}


@app.get("/api/stats")
def stats(date_from: str = Query("", alias="from"), date_to: str = Query("", alias="to")):
    """Counts for the Dashboard and Reports, computed from the checks table. Dates are YYYY-MM-DD (inclusive)."""
    sql, args = "SELECT created, verdict, confidence, decision FROM checks WHERE 1=1", []
    if date_from: sql += " AND substr(created,1,10)>=?"; args.append(date_from)
    if date_to: sql += " AND substr(created,1,10)<=?"; args.append(date_to)
    with db() as c:
        rows = c.execute(sql, args).fetchall()
        people = Counter(r["status"] for r in c.execute("SELECT status FROM persons").fetchall())
    per_day = Counter(r["created"][:10] for r in rows)
    verdicts = Counter(r["verdict"] for r in rows)
    # Agreement is only defined for clear verdicts: an Uncertain verdict has nothing to agree with.
    decided = [r for r in rows if r["decision"] in AGREES and r["verdict"] != "UNCERTAIN"]
    n = len(rows)
    return dict(checks=n, per_day=[dict(date=d, checks=per_day[d]) for d in sorted(per_day)],
                verdicts={v: verdicts.get(v, 0) for v in ("LIKELY GENUINE", "LIKELY FORGED", "UNCERTAIN")},
                uncertain_rate=(verdicts.get("UNCERTAIN", 0) / n) if n else None,
                pending=sum(1 for r in rows if r["decision"] == "Pending"),
                decided=len(decided),
                human_agreement=(sum(AGREES[r["decision"]] == r["verdict"] for r in decided) / len(decided)) if decided else None,
                average_confidence=(sum(r["confidence"] for r in rows) / n) if n else None,
                persons=dict(people))


@app.post("/api/persons/{pid}/archive")
def archive(pid: str):
    with db() as c:
        if not c.execute("SELECT 1 FROM persons WHERE id=?", (pid,)).fetchone(): raise HTTPException(404, "Person not found.")
        c.execute("UPDATE persons SET status='Archived' WHERE id=?", (pid,)); log(c, "archive", pid)
    return dict(ok=True)


@app.delete("/api/persons/{pid}")
def delete_person(pid: str):
    with db() as c:
        if not c.execute("SELECT 1 FROM persons WHERE id=?", (pid,)).fetchone(): raise HTTPException(404, "Person not found.")
        for r in c.execute("SELECT path FROM samples WHERE person_id=?", (pid,)).fetchall():
            Path(r["path"]).unlink(missing_ok=True)
        (DATA / "profiles" / f"{pid}.npz").unlink(missing_ok=True)
        c.execute("DELETE FROM samples WHERE person_id=?", (pid,)); c.execute("DELETE FROM persons WHERE id=?", (pid,))
        log(c, "delete", pid)
    return dict(ok=True)


from .cases import router as cases_router  # noqa: E402  (routes for notes, attachments and evidence reports)

app.include_router(cases_router)
