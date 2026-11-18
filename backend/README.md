# 4buwan Signature Verification — back end

```
sigdesk_engine/engine.py         the verification model, copied from the research notebook (FROZEN)
sigdesk_engine/artifacts/        private, not in the repository (distributed separately):
  engine_constants.npz           shared yardstick from the 142 development writers (GLOBAL_SPREAD, pooled covariance, eigenbasis)
  engine_meta.json               model version, settings, population consistency percentiles
  reference_check.json           three writers' pairs + notebook AUC, used by the tests
  research/                      notebook outputs shown in the Research Lab
app/main.py                      FastAPI server: health, quality, persons, verify, checks, decisions, stats, research
app/cases.py                     case notes, Compare attachments, Evidence Report log
app/sample.py                    sample-data seed and reset (CEDAR development writers only)
app/storage.py                   SQLite + image folders per data mode: data/real and data/sample (local only)
tools/export_constants.py        re-creates the artifacts from the notebook cache (only if the notebook is re-run)
tools/seed_sample.py             fills data/sample with the 25 CEDAR development writers and 50 example checks
tools/seed_demo.py               enrols up to 25 CEDAR development writers as "Demo Person" into data/real
tests/                           pytest: engine == notebook, API end to end, data modes, storage
```

Run (with the virtual environment active): `pip install -r requirements.txt`, `pytest -q`, `uvicorn app.main:app --port 8000`.

**Data modes.** Every request names its data folder with the `X-Data-Mode` header (`real`, `sample` or `demo`,
default `real`), or `?mode=` on image links. Any other value falls back to `real`. `POST /api/demo/start` rebuilds
`data/demo` as a fresh copy of `data/sample`, and the service clears `data/demo` every time it starts, so nothing
done in a demo is kept. The web interface's Verifier uses `real` when signed in and `demo` when entered with
Continue to demo; the Supervisor and Researcher views send no requests at all.

**Access.** The service has no accounts or passwords of its own. It listens on localhost only and trusts the
local user; the sign-in page is part of the web interface.

**What is frozen and why.** Engine sections 1–7 (preprocessing, HOG, 17-measure pair descriptor, metric J,
one-class SVM settings) and the artifacts reproduce the notebook exactly: all 142 development writers give the
same AUC (B 0.7723, G 0.8309, J 0.8368) and real images give identical HOG features.

**What is provisional.** Section 6, the decision policy: the person's line is the mean of their 12
leave-one-out genuine scores minus 1 spread, with an uncertain zone of ±1 spread. On development writers this
called 8.5% of genuine signatures forged, 15.8% of forgeries genuine, and left ~30% uncertain. It was chosen
by looking at development forgeries, so it must be validated in the notebook before it is reported as a result.
