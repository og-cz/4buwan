"""Sample data: example people and checks from the public CEDAR development writers, and the throwaway demo copy.

Only the 25 CEDAR writers of the notebook's development split are used. The held-back writers are reserved for
the one-time confirmation of the research results and must never be loaded into the app.
Every profile and every verdict is computed by the engine; nothing is typed in.
"""
from __future__ import annotations

import json
import os
import shutil
from pathlib import Path

from fastapi import APIRouter, Form, HTTPException

from .storage import ROOT, current_mode, data_dir, db

# The 25 CEDAR writers in the notebook's development split (SPLIT_SEED 20261014). Do not add others.
CEDAR_DEV = [5, 10, 12, 16, 17, 18, 20, 21, 22, 23, 24, 26, 27, 29, 34, 35, 36, 40, 42, 45, 46, 47, 49, 53, 54]
SEED_FILE = "seed.json"

router = APIRouter(prefix="/api")


def cedar_files(root: Path, n: int) -> tuple[list[Path], Path, Path]:
    """Enrolment images original_<n>_1..12 (as in the notebook), one held-out genuine and one forgery."""
    org, forg = root / "full_org", root / "full_forg"
    return [org / f"original_{n}_{i}.png" for i in range(1, 13)], org / f"original_{n}_13.png", forg / f"forgeries_{n}_1.png"


def seed(cedar: Path, writers: list[int] = CEDAR_DEV) -> dict:
    """Rebuilds the sample folder from scratch: one profile per writer, a genuine and a forged example check each."""
    from .main import enrol_person, run_check   # late import: main includes this router

    if any(n not in CEDAR_DEV for n in writers): raise HTTPException(400, "Only CEDAR development writers may be used.")
    missing = [str(p) for n in writers for p in [*cedar_files(cedar, n)[0], *cedar_files(cedar, n)[1:]] if not p.exists()]
    if missing: raise HTTPException(400, f"CEDAR images not found, for example {missing[0]}.")
    token = current_mode.set("sample")
    try:
        shutil.rmtree(ROOT / "sample", ignore_errors=True)
        data_dir("sample")
        people = checks = 0
        for n in writers:
            enrol, genuine, forgery = cedar_files(cedar, n)
            p = enrol_person(f"Sample Person {n:02d}", f"CEDAR-{n:03d}", [f.read_bytes() for f in enrol], [f.name for f in enrol])
            people += 1
            for f, kind in ((genuine, "held-out genuine"), (forgery, "forgery")):
                run_check(p["id"], f.read_bytes(), f.name, case_title=f"Sample · {f.stem}",
                          notes=f"Example check from the CEDAR dataset ({kind} of writer {n}).")
                checks += 1
        (ROOT / "sample" / SEED_FILE).write_text(json.dumps({"cedar": str(cedar), "writers": writers}), encoding="utf-8")
        return dict(ok=True, persons=people, checks=checks)
    finally:
        current_mode.reset(token)


@router.post("/demo/start")
def start_demo():
    """Starts a fresh demo session: the demo folder becomes a new copy of the sample data (or empty if none).
    Everything enrolled, verified or decided in the demo stays in that copy and is discarded at the next start."""
    demo, src = ROOT / "demo", ROOT / "sample"
    shutil.rmtree(demo, ignore_errors=True)
    if (src / "sigdesk.db").exists(): shutil.copytree(src, demo, ignore=shutil.ignore_patterns(SEED_FILE))
    token = current_mode.set("demo")
    try:
        with db() as c:
            persons, checks = (c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in ("persons", "checks"))
    finally:
        current_mode.reset(token)
    return dict(ok=True, persons=persons, checks=checks)


@router.post("/sample/reset")
def reset_sample(cedar: str = Form("")):
    """Re-runs the sample seed with the CEDAR folder used last time (or the one given, or SIGDESK_CEDAR)."""
    saved = ROOT / "sample" / SEED_FILE
    path = cedar or (json.loads(saved.read_text(encoding="utf-8"))["cedar"] if saved.exists() else os.environ.get("SIGDESK_CEDAR", ""))
    if not path: raise HTTPException(400, "No CEDAR folder known. Run tools/seed_sample.py --cedar <path> once.")
    return seed(Path(path))
