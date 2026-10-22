# Signature Desk — back end

```
sigdesk_engine/engine.py         the verification model, copied from 4buwan_master_notebook.ipynb (FROZEN)
sigdesk_engine/artifacts/
  engine_constants.npz           shared yardstick from the 142 development writers (GLOBAL_SPREAD, pooled covariance, eigenbasis)
  engine_meta.json               model version, settings, population consistency percentiles
  reference_check.json           three writers' pairs + notebook AUC, used by the tests
  research/                      notebook outputs shown in the Research Lab
app/main.py                      FastAPI server (SQLite + files in ./data, local only)
tools/export_constants.py        re-creates artifacts from the notebook cache (only if the notebook is re-run)
tools/seed_demo.py               enrols demo people from CEDAR development writers
tests/                           pytest: engine == notebook, API end to end
```

Run: `pip install -r requirements.txt`, `pytest -q`, `uvicorn app.main:app --reload --port 8000`.

**What is frozen and why.** Engine sections 1–7 (preprocessing, HOG, 17-measure pair descriptor, metric J,
one-class SVM settings) and the artifacts reproduce the notebook exactly: all 142 development writers give the
same AUC (B 0.7723, G 0.8309, J 0.8368) and real images give identical HOG features.

**What is provisional.** Section 6, the decision policy: the person's line is the mean of their 12
leave-one-out genuine scores minus 1 spread, with an uncertain zone of ±1 spread. On development writers this
called 8.5% of genuine signatures forged, 15.8% of forgeries genuine, and left ~30% uncertain. It was chosen
by looking at development forgeries, so it must be validated in the notebook before it is reported as a result.
