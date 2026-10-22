"""Fill the app with demo people from CEDAR (DEVELOPMENT writers only - never the held-back writers).

    python tools/seed_demo.py --cedar "C:/Users/ogrla/Downloads/cedar-dataset/signatures" --n 8

Each demo person is enrolled with original_<n>_1..12 (the same 12 the notebook used). original_<n>_13..24 and
forgeries_<n>_1..24 are left for you to try in the Verify screen. The API server does not need to be running.
"""
import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient  # noqa: E402

# The 25 CEDAR writers in the notebook's development split (SPLIT_SEED 20261014). Do not add others.
CEDAR_DEV = [5, 10, 12, 16, 17, 18, 20, 21, 22, 23, 24, 26, 27, 29, 34, 35, 36, 40, 42, 45, 46, 47, 49, 53, 54]

ap = argparse.ArgumentParser()
ap.add_argument("--cedar", required=True, help="folder that contains full_org/ and full_forg/")
ap.add_argument("--n", type=int, default=8)
a = ap.parse_args()
root = Path(a.cedar)
os.environ.setdefault("SIGDESK_DATA", str(Path(__file__).resolve().parents[1] / "data"))
from app.main import app  # noqa: E402

client = TestClient(app)
for n in CEDAR_DEV[: a.n]:
    files = [("files", (f"original_{n}_{i}.png", (root / "full_org" / f"original_{n}_{i}.png").read_bytes(), "image/png"))
             for i in range(1, 13)]
    r = client.post("/api/persons", data={"name": f"Demo Person {n:02d}", "external_id": f"CEDAR-{n:03d}"}, files=files)
    print(n, r.status_code, r.json().get("consistency", r.json()))
print("Try in Verify:", root / "full_org" / "original_<n>_13.png", "(genuine) and", root / "full_forg" / "forgeries_<n>_1.png", "(forged)")
