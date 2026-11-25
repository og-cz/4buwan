"""Builds the ready-made demo import file from the demo kit (CEDAR development writers 53 and 45 only).

    python tools/build_demo_export.py --kit "<path>/demo_data" --out "<path>/release/4buwan-demo-import.zip"

Enrols Person A (CEDAR-053) and Person B (CEDAR-045) with their 12 enrolment signatures, checks all 48 files of the
kit with the real engine, records the decisions an examiner would make (Uncertain checks are left for the Review
Queue) with examination notes, exports Evidence Reports for some decided cases, spreads the dates over the last
14 days, and saves everything as one export file. Uses a temporary data
folder: no stored records are read or changed.
"""
import argparse
import os
import re
import sqlite3
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("--kit", required=True, help="the demo_data folder (Person_A_053, Person_B_045)")
ap.add_argument("--out", required=True)
a = ap.parse_args()
kit, out = Path(a.kit), Path(a.out)
os.environ["SIGDESK_DATA"] = tempfile.mkdtemp(prefix="4buwan_demo_export_")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.storage import ROOT  # noqa: E402

client = TestClient(app)
H = {"X-Data-Mode": "demo"}
client.post("/api/demo/start")
num = lambda p: int(re.search(r"_(\d+)\.png$", p.name)[1])
for folder, pid, name in (("Person_A_053", "CEDAR-053", "Person A"), ("Person_B_045", "CEDAR-045", "Person B")):
    enrol = sorted((kit / folder / "enrol").glob("*.png"), key=num)
    r = client.post("/api/persons", headers=H, data={"name": name, "external_id": pid},
                    files=[("files", (f.name, f.read_bytes(), "image/png")) for f in enrol])
    r.raise_for_status(); person = r.json()["id"]
    for f in sorted((kit / folder / "check").glob("*.png"), key=lambda p: (p.name.startswith("forg"), num(p))):
        v = client.post("/api/verify", headers=H, data={"person_id": person, "case_title": f"{name} · {f.stem}"},
                        files={"file": (f.name, f.read_bytes(), "image/png")})
        v.raise_for_status(); res = v.json()
        cid = res["case_id"]
        if res["verdict"] == "UNCERTAIN":
            client.post(f"/api/checks/{cid}/notes", headers=H, data={"text": "Score is near the decision line. Asked the client for a second sample."})
            continue
        decision = "Accepted" if res["verdict"] == "LIKELY GENUINE" else "Rejected"
        client.post(f"/api/checks/{cid}/decision", headers=H, data={"decision": decision, "note": "Agrees with the evidence."})
        if num(f) % 4 == 1:            # a quarter of the decided cases get a note and an exported Evidence Report
            client.post(f"/api/checks/{cid}/notes", headers=H, data={"text": "Stroke order and pen pressure checked against the references."})
            client.post(f"/api/checks/{cid}/report", headers=H)

# Spread the activity over the last 14 days so the dashboard and statistics have something to show.
db = sqlite3.connect(ROOT / "demo" / "sigdesk.db")
end = datetime.now(timezone.utc).replace(microsecond=0)
ids = [r[0] for r in db.execute("SELECT id FROM checks ORDER BY created, id")]
for i, cid in enumerate(ids):
    when = (end - timedelta(days=13) + timedelta(hours=i * 13 * 24 / max(1, len(ids) - 1))).isoformat()
    db.execute("UPDATE checks SET created=? WHERE id=?", (when, cid))
    db.execute("UPDATE events SET at=? WHERE ref=? AND kind='verify'", (when, cid))
    for kind, minutes in (("note", 20), ("decision", 35), ("report", 50)):   # the examiner's later steps on that case
        db.execute("UPDATE events SET at=? WHERE ref=? AND kind=?", ((datetime.fromisoformat(when) + timedelta(minutes=minutes)).isoformat(), cid, kind))
db.execute("UPDATE persons SET created=?", ((end - timedelta(days=14)).isoformat(),))
db.commit(); db.close()

r = client.get("/api/export", headers=H); r.raise_for_status()
out.parent.mkdir(parents=True, exist_ok=True); out.write_bytes(r.content)
health = client.get("/api/health", headers=H).json()
print(f"{out}: {health['persons']} people, {health['checks']} checks, {len(r.content) // 1024} KB")
