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

### Staff Sign-in and Roles

Staff sign in with their own office account. Each role gets its own set of modules: Verifiers check signatures, Supervisors review decisions and manage staff, and Researchers study how well the method performs.

</td>
<td width="50%">
  <img src="docs/image/feature-signin.png" alt="Staff Sign-in and Roles on desktop" width="74%" valign="top" />
  <img src="docs/image/feature-signin-phone.png" alt="Staff Sign-in and Roles on a phone" width="22%" valign="top" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Dashboard

Ready profiles, recorded checks, the uncertain rate and checks waiting for a decision, with the latest verifications and the review queue at a glance.

</td>
<td width="50%">
  <img src="docs/image/feature-dashboard.png" alt="Dashboard on desktop" width="74%" valign="top" />
  <img src="docs/image/feature-dashboard-phone.png" alt="Dashboard on a phone" width="22%" valign="top" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Verify and Evidence

Choose an enrolled person, add the questioned signature and get an advisory verdict with a confidence marker and the uncertain zone. The full analysis evidence sits on the same scrollable page, and a manual Compare tool sits beside it.

</td>
<td width="50%">
  <img src="docs/image/feature-verify.png" alt="Verify and Evidence on desktop" width="74%" valign="top" />
  <img src="docs/image/feature-verify-phone.png" alt="Verify and Evidence on a phone" width="22%" valign="top" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Enrol a Person

A four-step wizard: person details, 12 genuine signatures with an instant quality check on each, a preview of the image cleaning, then the signature profile. Forged samples are never needed.

</td>
<td width="50%">
  <img src="docs/image/feature-enrol.png" alt="Enrol a Person on desktop" width="74%" valign="top" />
  <img src="docs/image/feature-enrol-phone.png" alt="Enrol a Person on a phone" width="22%" valign="top" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### History and Review Queue

Every saved check with filters, search and CSV export. Uncertain and undecided checks wait in the review queue for a human decision, a reason and timestamped notes. Batch Check runs many signatures at once.

</td>
<td width="50%">
  <img src="docs/image/feature-history.png" alt="History and Review Queue on desktop" width="74%" valign="top" />
  <img src="docs/image/feature-history-phone.png" alt="History and Review Queue on a phone" width="22%" valign="top" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Evidence Reports

A printable report rebuilt from the saved case: the questioned signature, the 12 references, the verdict, the score against the decision line and the recorded decision. Save it as a PDF from the print dialog.

</td>
<td width="50%">
  <img src="docs/image/feature-report.png" alt="Evidence Reports on desktop" width="74%" valign="top" />
  <img src="docs/image/feature-report-phone.png" alt="Evidence Reports on a phone" width="22%" valign="top" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Research Lab

R1-WAW compared with the shared yardstick and the standard method on CEDAR, Bengali and Hindi, with a plain-language reliability verdict, a dataset shortcut check and the model card.

</td>
<td width="50%">
  <img src="docs/image/feature-research.png" alt="Research Lab on desktop" width="74%" valign="top" />
  <img src="docs/image/feature-research-phone.png" alt="Research Lab on a phone" width="22%" valign="top" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Settings and Themes

Organisation name and logo, the words used for people and IDs, checking strictness, the uncertain zone and backups. Light and dark themes; the sign-in page always stays dark.

</td>
<td width="50%">
  <img src="docs/image/feature-settings.png" alt="Settings and Themes on desktop" width="74%" valign="top" />
  <img src="docs/image/feature-settings-phone.png" alt="Settings and Themes on a phone" width="22%" valign="top" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Staff Accounts

Supervisors add staff, assign the Verifier, Supervisor or Researcher role, see each last login, and deactivate or reactivate accounts.

</td>
<td width="50%">
  <img src="docs/image/feature-staff.png" alt="Staff Accounts on desktop" width="74%" valign="top" />
  <img src="docs/image/feature-staff-phone.png" alt="Staff Accounts on a phone" width="22%" valign="top" />
</td>
</tr>
</table>

---

## Model Features

Writer-dependent offline signature verification. Each writer is enrolled with **12 genuine signatures and no forgeries**.

### Pipeline

| Stage | Method | Detail |
|---|---|---|
| Preprocessing | Invert → Otsu background removal → crop → pad → resize | 100 × 100 px |
| Descriptor | HOG | 2,916 dimensions per signature |
| Representation | Pairwise dissimilarity | 17 difference measures per pair; 66 genuine pairs per writer |
| Normalisation | Per-measure scale | Typical size across development writers |
| Metric | Rank-1 writer-adaptive covariance (J) | Shared whitening (G) adapted along its principal direction |
| Classifier | One-class SVM | Trained on genuine pairs only; identical settings for every writer |
| Scoring | Mean SVM output | Test signature paired with all 12 references |

### Metric

The shared metric `W_G` whitens the 17 measures with the pooled within-writer covariance. J replaces the pooled spread along the principal direction `u₁` with the writer's own spread `σ`; every other direction stays shared.

```math
W_J = W_G + \left(\sigma^{-1} - \lambda_1^{-1/2}\right) u_1 u_1^{\top}
```

One parameter per writer, so 12 references are enough to estimate it.

| Code | Metric | Per-writer parameters |
|---|---|---|
| B | Global diagonal | 0 |
| G | Pooled full covariance | 0 |
| **J** | **Rank-1 writer-adaptive** | **1** |

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

## Installation and Running

The app has two parts that run at the same time: the **verification service** (Python, in `backend/`) and the **web interface** (React, in the project root). Open two terminals.

### 1. Get the code

```bash
git clone https://github.com/og-cz/4buwan.git
cd 4buwan
```

### 2. Start the verification service (terminal 1)

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
| The Verifier | Type your username and password, then **Sign in** |
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

---

## License

4buwan is free and open source under the [MIT License](LICENSE).

![4buwan footer](docs/image/footer.png)
