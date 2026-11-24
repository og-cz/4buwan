"""Export and import of a whole workspace (run in the demo data folder so other tests are not affected)."""
import io
import json
import zipfile
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

FIX = Path(__file__).parent / "fixtures" / "cedar10"
client = TestClient(app)
DEMO = {"X-Data-Mode": "demo"}


def _enrol_and_check():
    files = [("files", (f"original_10_{i}.png", (FIX / f"original_10_{i}.png").read_bytes(), "image/png")) for i in range(1, 13)]
    pid = client.post("/api/persons", headers=DEMO, data={"name": "Export Person", "external_id": "CEDAR-010"}, files=files).json()["id"]
    q = {"file": ("q.png", (FIX / "original_10_13.png").read_bytes(), "image/png")}
    case = client.post("/api/verify", headers=DEMO, data={"person_id": pid}, files=q).json()["case_id"]
    client.post(f"/api/checks/{case}/decision", headers=DEMO, data={"decision": "Accepted", "note": "matches"})
    client.post(f"/api/checks/{case}/notes", headers=DEMO, data={"text": "examined"})
    return pid, case


def test_export_then_import_restores_people_checks_decisions_and_files():
    client.post("/api/demo/start")
    pid, case = _enrol_and_check()
    exported = client.get("/api/export", headers=DEMO)
    assert exported.status_code == 200 and exported.headers["content-type"] == "application/zip"
    manifest = json.loads(zipfile.ZipFile(io.BytesIO(exported.content)).read("manifest.json"))
    assert manifest["app"] == "4buwan" and manifest["persons"] == 1 and manifest["checks"] == 1

    client.post("/api/demo/start")                                     # empty again
    r = client.post("/api/import", headers=DEMO, files={"file": ("demo.zip", exported.content, "application/zip")})
    assert r.status_code == 200, r.text
    assert r.json()["persons"] == 1 and r.json()["checks"] == 1
    detail = client.get(f"/api/checks/{case}", headers=DEMO).json()
    assert detail["decision"] == "Accepted" and any(e["kind"] == "note" for e in detail["timeline"])
    assert client.get(f"/api/checks/{case}/image", headers=DEMO).status_code == 200
    assert client.get(f"/api/persons/{pid}/samples/1", headers=DEMO).status_code == 200
    q = {"file": ("q.png", (FIX / "forgeries_10_1.png").read_bytes(), "image/png")}
    assert client.post("/api/verify", headers=DEMO, data={"person_id": pid}, files=q).status_code == 200   # imported profile works

    again = client.post("/api/import", headers=DEMO, files={"file": ("demo.zip", exported.content, "application/zip")}).json()
    assert again["persons"] == 0 and again["checks"] == 0 and again["skipped"] >= 2                    # no duplicates
    client.post("/api/demo/start")


def test_import_refuses_files_that_are_not_safe_exports():
    assert client.post("/api/import", headers=DEMO, files={"file": ("x.zip", b"not a zip", "application/zip")}).status_code == 400
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("manifest.json", json.dumps({"app": "4buwan", "format": 1}))
        z.writestr("sigdesk.db", b"")
        z.writestr("../outside.txt", b"x")
    r = client.post("/api/import", headers=DEMO, files={"file": ("evil.zip", buf.getvalue(), "application/zip")})
    assert r.status_code == 400 and "unexpected entry" in r.json()["detail"]
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z: z.writestr("readme.txt", b"hello")
    assert client.post("/api/import", headers=DEMO, files={"file": ("other.zip", buf.getvalue(), "application/zip")}).status_code == 400
