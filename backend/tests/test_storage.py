"""Image paths are stored relative to the data folder; older absolute paths are migrated once."""
import sqlite3

from fastapi.testclient import TestClient

from app import storage
from app.main import app

client = TestClient(app)


def test_relative_handles_old_windows_and_posix_paths():
    assert storage.relative(r"C:\Users\someone\4buwan\backend\data\images\abc.png") == "images/abc.png"
    assert storage.relative("/home/someone/backend/data/images/abc.png") == "images/abc.png"
    assert storage.relative("images/abc.png") == "images/abc.png"
    assert storage.resolve("images/abc.png") == storage.DATA / "images" / "abc.png"


def test_new_uploads_are_relative():
    rel = storage.save_upload(b"x", "q.png")
    assert rel.startswith("images/") and (storage.DATA / rel).read_bytes() == b"x"


def test_migration_rewrites_absolute_rows(tmp_path):
    db = sqlite3.connect(tmp_path / "old.db")
    db.executescript(r"""
    CREATE TABLE samples(id TEXT, person_id TEXT, idx INTEGER, path TEXT);
    CREATE TABLE checks(id TEXT, image TEXT);
    CREATE TABLE attachments(id TEXT, path TEXT);
    INSERT INTO samples VALUES('s1','p1',1,'C:\old\place\data\images\a.png');
    INSERT INTO checks VALUES('c1','/moved/data/images/b.png');
    INSERT INTO attachments VALUES('a1','images/c.png');
    """)
    assert storage.migrate_relative_paths(db) == 2
    assert db.execute("SELECT path FROM samples").fetchone()[0] == "images/a.png"
    assert db.execute("SELECT image FROM checks").fetchone()[0] == "images/b.png"
    assert db.execute("PRAGMA user_version").fetchone()[0] == 1


def test_images_still_served_after_migration():
    with storage.db() as c:
        row = c.execute("SELECT person_id, idx, path FROM samples LIMIT 1").fetchone()
    if row:
        assert not row["path"].startswith(("/", "C:")) and client.get(f"/api/persons/{row['person_id']}/samples/{row['idx']}").status_code == 200
