import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("SIGDESK_DATA", tempfile.mkdtemp(prefix="sigdesk_test_"))   # tests never touch backend/data
