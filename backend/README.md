# 4buwan Signature Verification — back end

```
sigdesk_engine/engine.pyc        the verification model, compiled for Python 3.14 (source kept private)
sigdesk_engine/artifacts/        private, not in the repository (distributed separately):
  engine_constants.npz           shared yardstick from the 142 development writers (GLOBAL_SPREAD, pooled covariance, eigenbasis)
  engine_meta.json               model version, settings, population consistency percentiles
  reference_check.json           three writers' pairs + notebook AUC, used by the tests
  research/                      notebook outputs shown in the Research Lab
app/main.py                      FastAPI server: health, quality, persons, verify, checks, decisions, stats, research
app/cases.py                     case notes, Compare attachments, Evidence Report log
app/sample.py                    sample-data seed and reset (CEDAR development writers only), empty demo sessions
app/transfer.py                  export and import of a whole workspace as one .zip (import only adds, never deletes)
app/storage.py                   SQLite + image folders per data mode: data/real, data/sample and data/demo (local only)
tools/seed_sample.py             fills data/sample with the 25 CEDAR development writers and 50 example checks
tools/seed_demo.py               enrols up to 25 CEDAR development writers as "Demo Person" into data/real
tools/build_demo_export.py       builds the ready-made demo import file from the demo kit
tools/build_portable.py          builds release/4buwan.exe
tests/                           pytest: engine == notebook, API end to end, data modes, storage
```

Run (with the virtual environment active): `pip install -r requirements.txt`, `pytest -q`, `uvicorn app.main:app --port 8000`.

**Data modes.** Every request names its data folder with the `X-Data-Mode` header (`real`, `sample` or `demo`,
default `real`), or `?mode=` on image links. Any other value falls back to `real`. `POST /api/demo/start` empties
`data/demo`, and the service clears it every time it starts, so a demo starts empty and nothing done in it is kept. The web interface's Verifier uses `real` when signed in and `demo` when entered with
Continue to demo; the Supervisor and Researcher views send no requests at all.

**Access.** The service has no accounts or passwords of its own. It listens on localhost only and trusts the
local user; the sign-in page is part of the web interface.

**What is frozen and why.** The engine reproduces the research notebook exactly (same AUC on all 142
development writers and identical features on real images); `tests/test_engine.py` checks this.

**What is provisional.** The decision policy that turns a score into a verdict was chosen on development
writers, so it must be validated before it is reported as a result.
