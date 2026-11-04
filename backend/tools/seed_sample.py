"""Fill the Sample data folder with the 25 CEDAR development writers and two example checks each.

    python tools/seed_sample.py --cedar "C:/path/to/cedar-dataset/signatures"

The folder must contain full_org/ and full_forg/. Real data is not touched. The held-back writers are never used.
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.sample import seed  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--cedar", required=True, help="folder that contains full_org/ and full_forg/")
a = ap.parse_args()
print(seed(Path(a.cedar)))
