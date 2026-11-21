<h1 align="center">
  <img src="docs/image/icon.png" alt="4buwan" width="64" valign="middle" /> 4buwan
</h1>

<p align="center">
  <a href="https://github.com/og-cz/4buwan"><img src="https://img.shields.io/github/stars/og-cz/4buwan?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <a href="https://github.com/og-cz/4buwan/releases"><img src="https://img.shields.io/github/downloads/og-cz/4buwan/total?style=flat&amp;color=08C" alt="Total downloads across all releases" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
</p>

<p align="center">
  <sub><a href="docs/readme/README.zh-CN.md">中文</a> · <a href="docs/readme/README.ja.md">日本語</a> · <a href="docs/readme/README.ko.md">한국어</a> · <a href="docs/readme/README.es.md">Español</a> · <a href="docs/readme/README.fr.md">Français</a> · <a href="docs/readme/README.pt.md">Português</a> · <a href="docs/readme/README.tl.md">Tagalog</a></sub>
</p>

<p align="center">
  <strong>Signature verification from genuine samples only.</strong><br/>
  An examination workspace for clear decisions and inspectable evidence.
</p>

<p align="center">
  <img src="docs/image/readme-hero.png" alt="4buwan" width="960" />
</p>

## System Features

<table>
<tr>
<td width="50%" valign="middle">

### Genuine-Only Enrolment

Twelve genuine signatures build a profile, each quality-checked as it arrives. No forgeries needed, ever.

</td>
<td width="50%">
  <img src="docs/image/feature-profile.png" alt="Genuine-Only Enrolment" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Writer-Adaptive Verification

R1-WAW tunes one shared yardstick to each person's own variation, then gives an advisory verdict with an uncertain zone.

</td>
<td width="50%">
  <img src="docs/image/feature-verify.png" alt="Writer-Adaptive Verification" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Inspectable Evidence

Every verdict shows its working: the score against the decision line, all 12 comparisons, the 17 measures and the similarity matrix.

</td>
<td width="50%">
  <img src="docs/image/feature-evidence.png" alt="Inspectable Evidence" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Printable Evidence Reports

One click turns a case into a report ready to file: the questioned signature, all 12 references, the verdict and the scoring. Print it or save it as PDF.

</td>
<td width="50%">
  <img src="docs/image/feature-report.png" alt="Printable Evidence Reports" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Human Decision Review

The tool advises, a person decides. Uncertain checks wait in a review queue, and every decision needs a reason.

</td>
<td width="50%">
  <img src="docs/image/feature-review.png" alt="Human Decision Review" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Research Lab

The thesis inside the app: method comparison, a dataset shortcut check and the model card.

</td>
<td width="50%">
  <img src="docs/image/feature-research.png" alt="Research Lab" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Shortcut Check

Proves the method reads the handwriting, not the scanner. Each result is tested against a control that only sees simple image facts.

</td>
<td width="50%">
  <img src="docs/image/feature-shortcut.png" alt="Shortcut Check" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Roles and Staff Accounts

Verifiers check, Supervisors decide and manage staff, Researchers study the method. Each role gets only the modules it needs.

</td>
<td width="50%">
  <img src="docs/image/feature-staff.png" alt="Roles and Staff Accounts" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Office Dashboard

Profiles, checks, the uncertain rate and pending decisions at a glance.

</td>
<td width="50%">
  <img src="docs/image/feature-dashboard.png" alt="Office Dashboard" width="100%" />
</td>
</tr>
</table>

**Also in the box:**

- **Compare** — Examine two to six signatures side by side.
- **Batch Check** — Verify many signatures in one run.
- **History and CSV export** — Every check, decision and note, searchable.
- **Light and dark themes** — With a layout that works from phone to desktop.
- **Private by design** — Signatures stay on this computer.

---

## Model Features

Writer-dependent offline signature verification. Each writer is enrolled with **12 genuine signatures and no forgeries**.

### Method (abstract)

Signatures are compared in pairs. A model learned only from the writer's genuine pairs scores a questioned signature against all 12 references. The core of the method, **R1-WAW** (rank-one writer-adaptive whitening), adapts a yardstick shared across many writers to each writer with a single parameter, so 12 references are enough to fit it.

The implementation is not published: the verification engine ships in compiled form (`backend/sigdesk_engine/engine.pyc`, Python 3.14).

### Datasets

| Dataset | Script | Development writers |
|---|---|---|
| CEDAR | Latin | 25 |
| BHSig260 Bengali | Bengali | 45 |
| BHSig260 Hindi | Devanagari | 72 |

Enrolment: genuine 1–12. Test: genuine 13–24 and forgeries 1–12. 172 writers are held back for a single final evaluation.

### Results (development set, 142 writers)

| Metric | AUC | EER |
|---|---|---|
| B — global diagonal | 0.772 | 25.8% |
| G — pooled full covariance | 0.831 | 22.0% |
| **J — rank-1 writer-adaptive** | **0.837** | **21.3%** |

| Dataset | J AUC | J EER |
|---|---|---|
| CEDAR | 0.839 | 21.3% |
| BHSig260 Bengali | 0.801 | 25.4% |
| BHSig260 Hindi | 0.858 | 18.8% |

Paired over writers with Wilcoxon tests, Holm correction and bootstrap intervals. J over G: +0.006 AUC (53 writers improved, 13 worse, 76 unchanged).

> **Status:** draft. Results are on development writers only; the held-back evaluation has not been run. An image-statistics control matches the model on Bengali, so Bengali results are not reported as signature verification.

### Sample data

The service keeps two separate data folders: **Real data** (your own enrolled people and checks, empty on a fresh install) and **Sample data** (example people and checks). The Verifier always works on Real data; the Sample data folder is read only when a request asks for it with the `X-Data-Mode: sample` header, and the screenshots above were taken from it. Sample data uses only the CEDAR subset of the 142 development writers: the 25 CEDAR development writers, each enrolled with `original_<n>_1..12` as in the notebook, plus one held-out genuine and one forged example check, all scored by the engine. The 172 held-back writers are reserved for the one-time confirmation of the research results and must not be loaded into the app.

---

## Architecture

| Part | Where | What it does |
|---|---|---|
| Web interface | `src/` (React, Vite) | Sign-in, the Verifier modules (`src/screens`), the Supervisor and Researcher views (`src/decoy`). All requests go through `src/api/client.ts`. |
| Verification service | `backend/app/` (FastAPI) | Enrolment, verification, cases, decisions, notes, attachments, reports and statistics. Calls the engine; never re-implements it. |
| Engine | `backend/sigdesk_engine/engine.pyc` | The verification model, shipped compiled for Python 3.14. The source is kept private. |
| Model constants | `backend/sigdesk_engine/artifacts/` | Private, distributed separately: the shared yardstick from the 142 development writers and the Research Lab results. |
| Local data | `backend/data/real/`, `backend/data/sample/`, `backend/data/demo/` | One SQLite database plus image and profile folders per data mode. `demo/` holds a session started with **Continue to demo**; it starts empty each time and is cleared when the service restarts. Nothing leaves the computer. |
| Research | `notebook/`, `result/` | The notebooks and their outputs behind the model and the numbers above. |

Signed in with a username and password, the Verifier works on **Real data**; entered with **Continue to demo**, it starts empty and nothing done in a demo is kept. The service has no accounts of its own: it runs on localhost and trusts the local user.

---

## Installation and Running

The app has two parts that run at the same time: the **verification service** (Python, in `backend/`) and the **web interface** (React, in the project root). Open two terminals.

### 1. Get the code

```bash
git clone https://github.com/og-cz/4buwan.git
cd 4buwan
```

### 2. Start the verification service (terminal 1)

The engine is compiled for **Python 3.14**, so the virtual environment must be made with Python 3.14.

**First time only** (creates the Python environment and installs the packages):

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

**Every time** (from the `4buwan` folder):

```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --port 8000
```

On macOS / Linux, activate with `source .venv/bin/activate` instead.

Leave this terminal open. The service is ready when it prints `Uvicorn running on http://127.0.0.1:8000`.

### 3. Start the web interface (terminal 2)

The project uses **pnpm** to install its packages. Plain `npm install` does not work here and stops with `Unsupported URL Type "workspace:"`.

**First time only** (from the `4buwan` folder):

```bash
npx pnpm install
```

**Every time** (from the `4buwan` folder):

```bash
npm run dev
```

Open **http://localhost:8443** in your browser.

### 4. Sign in

| To open | Do this |
|---|---|
| The Verifier on your real data | Type your username and password, then **Sign in** |
| A Verifier demo that starts empty and keeps nothing | Choose **Verifier** in the role list, then continue |
| Another role (Supervisor or Researcher) | Choose it in the role list below the sign-in form, then continue |

### Troubleshooting

| Message | What it means | What to do |
|---|---|---|
| `The analysis service is not running` (in the app) | Terminal 1 is closed or stopped | Run the "every time" commands of step 2 again |
| `Port 8443 is already in use`, or `[Errno 10048]` for port 8000 | The app is already running in another window | Use that window, or stop it there (Ctrl+C) and start again |
| `Unsupported URL Type "workspace:"` | `npm install` was used | Use `npx pnpm install` instead |
| `Unable to copy ... venvlauncher.exe` | The Python environment already exists | Skip it: `python -m venv .venv` is only for the first time |

### Optional

| Task | Command |
|---|---|
| Fill the separate sample-data folder with the 25 CEDAR development writers | `python tools/seed_sample.py --cedar "<path to cedar-dataset>/signatures"` (in `backend`, venv active) |
| Run the service tests | `pytest -q` (in `backend`, venv active) |
| Check the layout at phone to desktop widths | `npm run test:ui` (uses the installed Microsoft Edge) |
| Build the web interface for production | `npm run build` |

See [TESTING.md](TESTING.md) for a step-by-step manual test.

### Portable app (no installation)

`4buwan.exe` runs the whole system on any Windows 10 or 11 computer without Python, Node or npm. Double-click it: a small window opens, and the app opens in the browser a few seconds later. Close that window to stop it. Data is kept in a `4buwan-data` folder next to the exe.

To build it (in `backend`, venv active, after `pip install pyinstaller`):

```bash
python tools/build_portable.py
```

The result is `release/4buwan.exe`. It contains the private model constants, so share it privately and never attach it to a public release.

---

## License

4buwan is free and open source under the [MIT License](LICENSE).

![4buwan footer](docs/image/footer.png)
