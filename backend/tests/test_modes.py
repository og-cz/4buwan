"""Real and Sample data are separate folders, chosen per request by X-Data-Mode (or ?mode= on image links)."""
import shutil
from pathlib import Path

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app import sample, storage
from app.main import app

FIX = Path(__file__).parent / "fixtures" / "cedar10"
client = TestClient(app)
SAMPLE = {"X-Data-Mode": "sample"}


def _cedar(tmp_path):
    """A CEDAR-shaped folder for writer 10 (a development writer) built from the test fixtures."""
    org, forg = tmp_path / "full_org", tmp_path / "full_forg"
    org.mkdir(); forg.mkdir()
    for f in FIX.glob("original_10_*.png"): shutil.copy(f, org / f.name)
    shutil.copy(FIX / "forgeries_10_1.png", forg / "forgeries_10_1.png")
    return tmp_path


def test_health_reports_mode_and_counts():
    real = client.get("/api/health").json()
    assert real["mode"] == "real" and isinstance(real["persons"], int) and isinstance(real["checks"], int)
    assert client.get("/api/health", headers=SAMPLE).json()["mode"] == "sample"
    assert client.get("/api/health", headers={"X-Data-Mode": "nonsense"}).json()["mode"] == "real"


def test_seed_fills_sample_only(tmp_path):
    before_real = client.get("/api/health").json()
    out = sample.seed(_cedar(tmp_path), writers=[10])
    assert out == {"ok": True, "persons": 1, "checks": 2}
    h = client.get("/api/health", headers=SAMPLE).json()
    assert (h["persons"], h["checks"]) == (1, 2)
    assert client.get("/api/health").json()["persons"] == before_real["persons"]   # real untouched
    people = client.get("/api/persons", headers=SAMPLE).json()
    assert people[0]["name"] == "Sample Person 10" and people[0]["external_id"] == "CEDAR-010"
    assert all(p["name"] != "Sample Person 10" for p in client.get("/api/persons").json())
    checks = client.get("/api/checks", headers=SAMPLE).json()
    assert {c["case_title"] for c in checks} == {"Sample · original_10_13", "Sample · forgeries_10_1"}


def test_image_links_work_in_sample_mode(tmp_path):
    sample.seed(_cedar(tmp_path), writers=[10])
    pid = client.get("/api/persons", headers=SAMPLE).json()[0]["id"]
    detail = client.get(f"/api/persons/{pid}", headers=SAMPLE).json()
    assert detail["samples"][0].endswith("?mode=sample")
    assert client.get(detail["samples"][0]).content == (FIX / "original_10_1.png").read_bytes()
    assert client.get(f"/api/persons/{pid}/samples/1").status_code == 404   # not in real


def test_seed_refuses_held_back_writers(tmp_path):
    with pytest.raises(HTTPException):
        sample.seed(_cedar(tmp_path), writers=[1])   # writer 1 is not a development writer


def test_reset_reuses_saved_cedar_folder(tmp_path):
    sample.seed(_cedar(tmp_path), writers=[10])
    r = client.post("/api/sample/reset", headers=SAMPLE)
    assert r.status_code == 400 or r.json()["ok"]   # saved folder has only writer 10, so a full reset reports missing images


def test_flat_layout_moves_into_real(tmp_path):
    (tmp_path / "images").mkdir(); (tmp_path / "images" / "a.png").write_bytes(b"x")
    (tmp_path / "sigdesk.db").write_bytes(b"")
    assert storage.migrate_flat_layout(tmp_path)
    assert (tmp_path / "real" / "images" / "a.png").exists() and not (tmp_path / "sigdesk.db").exists()
    assert not storage.migrate_flat_layout(tmp_path)


def test_fresh_real_folder_is_empty(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "ROOT", tmp_path)
    with storage.db() as c:
        assert c.execute("SELECT COUNT(*) FROM persons").fetchone()[0] == 0
    assert (tmp_path / "real" / "sigdesk.db").exists()


def test_demo_session_is_a_throwaway_copy(tmp_path):
    files = [(FIX / f"original_10_{i}.png") for i in range(1, 13)]
    real_before = client.get("/api/health").json()
    started = client.post("/api/demo/start").json()
    demo = {"X-Data-Mode": "demo"}
    assert client.get("/api/health", headers=demo).json()["persons"] == started["persons"]
    r = client.post("/api/persons", headers=demo, data={"name": "Demo Only"},
                    files=[("files", (f.name, f.read_bytes(), "image/png")) for f in files])
    assert r.status_code == 200, r.text
    assert client.get("/api/health", headers=demo).json()["persons"] == started["persons"] + 1
    assert client.get("/api/health").json()["persons"] == real_before["persons"]          # real data untouched
    client.post("/api/demo/start")                                                       # next demo starts fresh
    assert client.get("/api/health", headers=demo).json()["persons"] == started["persons"]
