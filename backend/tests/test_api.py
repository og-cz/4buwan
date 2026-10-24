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


def _enrol(name="Second Person"):
    r = client.post("/api/persons", data={"name": name, "external_id": "T-11"},
                    files=[_f(f"original_10_{i}.png") for i in range(1, 13)])
    assert r.status_code == 200, r.text
    return r.json()["id"]


def _verify(pid, name="original_10_13.png"):
    v = client.post("/api/verify", data={"person_id": pid}, files={"file": ("q.png", (FIX / name).read_bytes(), "image/png")})
    assert v.status_code == 200, v.text
    return v.json()


def test_check_image():
    case = _verify(_enrol())["case_id"]
    r = client.get(f"/api/checks/{case}/image")
    assert r.status_code == 200 and r.content == (FIX / "original_10_13.png").read_bytes()
    assert client.get("/api/checks/C-NOPE/image").status_code == 404


def test_preprocess():
    r = client.post("/api/preprocess", files={"file": ("q.png", (FIX / "original_10_1.png").read_bytes(), "image/png")})
    assert r.status_code == 200, r.text
    body = r.json()
    assert sorted(body["stages"]) == ["S0", "S1", "S2", "S3", "S4"]
    assert all(v.startswith("data:image/png;base64,") for v in [*body["stages"].values(), body["hog"]])


def test_research_performance():
    rows = client.get("/api/research/performance").json()
    j = next(r for r in rows if r["condition"] == "J rank-1 writer-adaptive (proposed)" and r["scope"] == "ALL")
    assert round(j["AUC"], 3) == 0.837 and j["writers"] == 142


def test_stats_counts_checks():
    before = client.get("/api/stats").json()["checks"]
    case = _verify(_enrol())["case_id"]
    client.post(f"/api/checks/{case}/decision", data={"decision": "Needs more evidence"})
    s = client.get("/api/stats").json()
    assert s["checks"] == before + 1
    assert sum(s["verdicts"].values()) == s["checks"]
    assert client.get("/api/stats", params={"from": "1999-01-01", "to": "1999-12-31"}).json()["checks"] == 0


def test_archive_blocks_verify_and_delete_removes():
    pid = _enrol("To Archive")
    assert client.post(f"/api/persons/{pid}/archive").json()["ok"]
    assert client.get(f"/api/persons/{pid}").json()["status"] == "Archived"
    v = client.post("/api/verify", data={"person_id": pid},
                    files={"file": ("q.png", (FIX / "original_10_13.png").read_bytes(), "image/png")})
    assert v.status_code == 404
    assert client.delete(f"/api/persons/{pid}").json()["ok"]
    assert client.get(f"/api/persons/{pid}").status_code == 404
    assert client.delete(f"/api/persons/{pid}").status_code == 404
