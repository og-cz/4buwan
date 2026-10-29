"""Case extras: notes, attachments from Compare, and the Evidence Report log."""
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

FIX = Path(__file__).parent / "fixtures" / "cedar10"
client = TestClient(app)


def _png(name): return (FIX / name).read_bytes()


def _case():
    files = [("files", (f"original_10_{i}.png", _png(f"original_10_{i}.png"), "image/png")) for i in range(1, 13)]
    pid = client.post("/api/persons", data={"name": "Case Extras"}, files=files).json()["id"]
    v = client.post("/api/verify", data={"person_id": pid}, files={"file": ("q.png", _png("original_10_13.png"), "image/png")})
    assert v.status_code == 200, v.text
    return v.json()["case_id"]


def test_note_goes_to_timeline():
    cid = _case()
    assert client.post(f"/api/checks/{cid}/notes", data={"text": "Pen pressure looks even."}).json()["ok"]
    timeline = client.get(f"/api/checks/{cid}").json()["timeline"]
    assert any(e["kind"] == "note" and e["detail"] == "Pen pressure looks even." for e in timeline)
    assert client.post(f"/api/checks/{cid}/notes", data={"text": "  "}).status_code == 400
    assert client.post("/api/checks/C-NOPE/notes", data={"text": "x"}).status_code == 404


def test_attachments_saved_and_served():
    cid = _case()
    files = [("files", ("a.png", _png("original_10_1.png"), "image/png")), ("files", ("b.png", _png("forgeries_10_1.png"), "image/png"))]
    r = client.post(f"/api/checks/{cid}/attachments", data={"note": "Pin 1: hooked t-bar"}, files=files)
    assert r.status_code == 200, r.text
    listed = client.get(f"/api/checks/{cid}/attachments").json()
    assert [a["name"] for a in listed] == ["a.png", "b.png"] and listed[0]["note"] == "Pin 1: hooked t-bar"
    assert client.get(listed[1]["url"]).content == _png("forgeries_10_1.png")
    assert any(e["kind"] == "attachment" for e in client.get(f"/api/checks/{cid}").json()["timeline"])
    assert client.post("/api/checks/C-NOPE/attachments", files=files).status_code == 404


def test_report_log_lists_exports():
    cid = _case()
    assert client.post(f"/api/checks/{cid}/report").json()["ok"]
    assert any(r["case_id"] == cid for r in client.get("/api/reports").json())
