"""End-to-end API test with real CEDAR images. Run: pytest -q"""
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

FIX = Path(__file__).parent / "fixtures" / "cedar10"
client = TestClient(app)


def _f(name): return ("files", (name, (FIX / name).read_bytes(), "image/png"))


def test_health():
    assert client.get("/api/health").json()["ok"]


def test_enrol_verify_decide():
    files = [_f(f"original_10_{i}.png") for i in range(1, 13)]
    r = client.post("/api/persons", data={"name": "Test Person", "external_id": "T-10"}, files=files)
    assert r.status_code == 200, r.text
    pid = r.json()["id"]; assert r.json()["consistency"]["label"]
    q = {"file": ("q.png", (FIX / "original_10_13.png").read_bytes(), "image/png")}
    v = client.post("/api/verify", data={"person_id": pid}, files=q)
    assert v.status_code == 200, v.text
    body = v.json(); assert body["verdict"] in ("LIKELY GENUINE", "LIKELY FORGED", "UNCERTAIN")
    assert client.post(f"/api/checks/{body['case_id']}/decision", data={"decision": "Accepted"}).json()["ok"]
    assert client.get(f"/api/checks/{body['case_id']}").json()["decision"] == "Accepted"


def test_enrol_needs_12():
    r = client.post("/api/persons", data={"name": "x"}, files=[_f("original_10_1.png")])
    assert r.status_code == 400
