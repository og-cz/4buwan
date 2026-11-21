"""Builds release/4buwan.exe: the web interface, the verification service, the engine and its constants in one file.

    python tools/build_portable.py        (from backend/, with the virtual environment active and PyInstaller installed)

The exe needs no Python, Node or npm on the other computer. It includes the private model constants; it never includes any
stored records (backend/data).
"""
import subprocess
import sys
from pathlib import Path

from PIL import Image

BACKEND = Path(__file__).resolve().parents[1]
ROOT = BACKEND.parent
WORK = BACKEND / "build" / "portable"
SEP = ";" if sys.platform == "win32" else ":"

subprocess.run("npm run build", cwd=ROOT, shell=True, check=True)
WORK.mkdir(parents=True, exist_ok=True)
icon = WORK / "4buwan.ico"
Image.open(ROOT / "docs" / "image" / "icon.png").save(icon, sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])

data = [(ROOT / "dist", "web"), (BACKEND / "sigdesk_engine" / "artifacts", "sigdesk_engine/artifacts")]

args = [sys.executable, "-m", "PyInstaller", "--noconfirm", "--clean", "--onefile", "--console", "--name", "4buwan",
        "--icon", str(icon), "--distpath", str(ROOT / "release"), "--workpath", str(WORK), "--specpath", str(WORK),
        "--paths", str(BACKEND), "--collect-submodules", "uvicorn", "--collect-submodules", "app",
        "--hidden-import", "sigdesk_engine.engine"]
for src, dest in data: args += ["--add-data", f"{src}{SEP}{dest}"]
subprocess.run(args + [str(BACKEND / "portable.py")], cwd=BACKEND, check=True)
print("Built", ROOT / "release" / "4buwan.exe")
