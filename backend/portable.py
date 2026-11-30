"""Portable 4buwan: one program that runs the verification service and opens the web interface.

Built into 4buwan-R1-WAW-V.exe by tools/build_portable.py. Data is kept in a "<exe name>-data" folder next to the exe
(4buwan-R1-WAW-V-data), so builds of different models can sit in the same folder without sharing records.
"""
import os
import socket
import sys
import threading
import webbrowser
from pathlib import Path

BUNDLE = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))          # files packed into the exe
HOME = Path(sys.executable).resolve().parent if getattr(sys, "frozen", False) else Path(__file__).resolve().parent
EXE = Path(sys.executable).stem if getattr(sys, "frozen", False) else "4buwan"
DATA = HOME / f"{EXE}-data"

os.environ.setdefault("SIGDESK_DATA", str(DATA))
os.environ.setdefault("SIGDESK_STATIC", str(BUNDLE / "web"))


def free_port(start: int = 8765) -> int:
    for port in range(start, start + 50):
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", port)) != 0: return port
    raise SystemExit("No free port between 8765 and 8814.")


if __name__ == "__main__":
    import uvicorn
    from app.main import app

    port = free_port()
    url = f"http://127.0.0.1:{port}"
    print(f"4buwan is running at {url}\nYour data is kept in {DATA}\nClose this window to stop 4buwan.")
    if not os.environ.get("SIGDESK_NO_BROWSER"): threading.Timer(2.0, lambda: webbrowser.open(url)).start()
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")
