# Testing Signature Desk

You need **Python 3.10+** and **Node.js 20+**. Use two terminals, both opened in the repository root.

## 1. Verification service (terminal 1)

```
cd backend
python -m venv .venv
.venv\Scripts\activate            (Windows)
source .venv/bin/activate         (macOS / Linux)
pip install -r requirements.txt
pytest -q
```

Expected: **35 passed**. The tests check that:
- the service gives the **same AUC as the research notebook** for the reference writers (B, G, J match exactly);
- real CEDAR images turn into the same features and scores as the notebook (difference = 0);
- enrol → verify → record decision works through the API, plus the preprocessing, stats, performance,
  archive, delete, notes, attachments and report-log endpoints;
- stored image paths are relative to the data folder, and older absolute paths are migrated once;
- Real data and Sample data are separate folders, a fresh Real folder is empty, and the sample seed only uses CEDAR development writers.

The engine constants (`backend/sigdesk_engine/artifacts/`) and the test images (`backend/tests/fixtures/`)
are distributed separately and must be in place before the tests or the service can run.

Fill **Sample data** with the 25 CEDAR development writers and 50 example checks (Real data stays empty), then start the service:

```
python tools/seed_sample.py --cedar "<path to cedar-dataset>/signatures"
uvicorn app.main:app --reload --port 8000
```

http://localhost:8000/docs lists every endpoint. Try `GET /api/persons`.

## 2. Web interface (terminal 2)

```
pnpm install
pnpm dev
```

Open http://localhost:8443. The dev server forwards `/api` to port 8000.

Layout check (no sideways scrolling at 360–1440 px; uses the installed Microsoft Edge):

```
pnpm test:ui
```

The same run also checks that the Examiner sidebar has 8 items, the Supervisor sidebar 6, and that the Supervisor demo makes no request to the analysis service.

## 3. Manual test script

| # | Do this | You should see |
|---|---|---|
| 1 | Sign in with **Demo role: Verifier** | The working system: Dashboard, Verify, Enrol, History, Research Lab, Settings, Help |
| 2 | Log out → sign in as **Supervisor** or **Researcher** | Yellow DEMO bar; example content only (Staff Accounts, Review Queue, Method Comparison…); no model or stored data is used |
| 3 | Verifier → Enrol | Enrol a person with 12 genuine signatures (for example `demo_data/Person_A_053/enrol`) |
| 4 | Verifier → Verify → Demo Person 05 → upload `full_org/original_5_14.png` | A verdict for a genuine sample *not* used for enrolment |
| 5 | Same person → upload `full_forg/forgeries_5_3.png` | A verdict for a forgery |
| 6 | Scroll down the Verify page | Reference samples and panels A–H with real numbers; the policy line says *provisional* |
| 7 | Upload a blank white image | "Blank or almost blank" message, Run verification is disabled |
| 8 | Enrol a new person with only 11 images | Create profile is blocked with the reason |
| 9 | Cases → open the check from step 4 → Record decision "Accepted" | Decision and timeline saved |
| 10 | Stop uvicorn (Ctrl+C) and wait a few seconds | "The analysis service is not running" banner |
| 11 | Examiner → Research Lab → Method comparison → All | Our method · R1-WAW 0.837, shared yardstick 0.831, standard 0.772 |
| 12 | Examiner → Research Lab → Dataset check → Bengali | Shortcut 0.936 is higher than our method, with the warning text |

Use images numbered **13–24** and the forgeries for testing: images 1–12 are the enrolment samples.
Expect some wrong verdicts: the model's equal error rate is about 21%. That is the honest behaviour of the
research model, not an app bug.

## If something fails

- `pytest` fails in `test_engine.py` → the engine copy or its constants changed. Restore `backend/sigdesk_engine/`.
- `ModuleNotFoundError` → the virtual environment is not active.
- The page loads but shows no data → the service is not running on port 8000.
