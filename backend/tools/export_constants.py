"""Freeze the shared yardstick from the notebook cache into backend/sigdesk_engine/artifacts/.

Run once, after the notebook has run (it reads the notebook's cache, it does not re-run anything):
    python tools/export_constants.py --cache "C:/Users/ogrla/Downloads/4buwan_master/final_master/cache" \
                                     --outputs "C:/Users/ogrla/Downloads/4buwan_master/final_master/outputs"
Writes engine_constants.npz, engine_meta.json and reference_check.json (used by the tests).
The arithmetic is the notebook's Step 8 / Step 10, line for line.
"""
import argparse
import datetime as dt
import hashlib
import json
import pickle
from pathlib import Path

import numpy as np
import pandas as pd

EPS = 1e-9
HERE = Path(__file__).resolve().parents[1] / "sigdesk_engine" / "artifacts"

ap = argparse.ArgumentParser()
ap.add_argument("--cache", required=True)
ap.add_argument("--outputs", required=True)
ap.add_argument("--out", default=str(HERE))
a = ap.parse_args()
cache, outputs, out = Path(a.cache), Path(a.outputs), Path(a.out)
out.mkdir(parents=True, exist_ok=True)

desc_file = next(cache.glob("cache_descriptors_dev_*.pkl"))
cfg_hash = desc_file.stem.split("_")[-1]
DESC = pickle.load(open(desc_file, "rb"))
WKEYS = sorted(DESC["HOG"])

# ---- notebook Step 8 ----
P_ALL = np.vstack([DESC["HOG"][k][0] for k in WKEYS])
GLOBAL_SPREAD = P_ALL.std(0) + EPS
Z_W = {k: (DESC["HOG"][k][0] - DESC["HOG"][k][0].mean(0)) / GLOBAL_SPREAD for k in WKEYS}
SIGMA_W = {k: np.cov(Z_W[k].T, bias=True) for k in WKEYS}
SIGMA_POOLED = sum(SIGMA_W.values()) / len(WKEYS)
_ev, _V = np.linalg.eigh(SIGMA_POOLED); _o = np.argsort(_ev)[::-1]
POOL_EVAL, POOL_EVEC = _ev[_o], _V[:, _o]

# ---- J's one number for every development writer (notebook Step 10) -> gauge band ----
u1 = POOL_EVEC[:, 0]
J_RATIO = np.array([np.sqrt(u1 @ SIGMA_W[k] @ u1) / np.sqrt(POOL_EVAL[0]) for k in WKEYS])
pct = {f"p{q}": float(np.percentile(J_RATIO, q)) for q in (5, 10, 25, 50, 75, 90, 95)}

np.savez(out / "engine_constants.npz", global_spread=GLOBAL_SPREAD, sigma_pool=SIGMA_POOLED,
         pool_eval=POOL_EVAL, pool_evec=POOL_EVEC)
blob = b"".join(x.tobytes() for x in (GLOBAL_SPREAD, SIGMA_POOLED, POOL_EVAL, POOL_EVEC))
meta = dict(
    model_version="J-rank1-v1",
    built_from=f"{len(WKEYS)} development writers x 66 enrolment pairs = {len(P_ALL)} pairs",
    corpora={c: sum(1 for k in WKEYS if k[0] == c) for c in sorted({k[0] for k in WKEYS})},
    feature_config_hash=cfg_hash,
    constants_sha1=hashlib.sha1(blob).hexdigest()[:16],
    exported=dt.date.today().isoformat(),
    settings=dict(nu=0.10, gamma="scale", rank=1, n_enrol=12, pairs=66, measures=17, hog_dim=2916,
                  image="100x100", hog="9 orientations, 10x10 cells, 2x2 blocks, L2-Hys"),
    consistency_percentiles=pct,
)
(out / "engine_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")

# ---- reference values for the tests: three writers (one per corpus) with the notebook's J AUC ----
pw = pd.read_csv(outputs / "per_writer_results.csv", dtype={"writer": str})
pw = pw[pw.condition == "J"].set_index(["corpus", "writer"])
picks = []
for c in sorted({k[0] for k in WKEYS}):
    k = [x for x in WKEYS if x[0] == c][0]
    P, Qg, Qf = DESC["HOG"][k]
    picks.append(dict(corpus=k[0], writer=str(k[1]), auc_notebook=float(pw.loc[(k[0], str(k[1])), "AUC"]),
                      consistency=float(J_RATIO[WKEYS.index(k)]),
                      P=P.tolist(), Qg=Qg.tolist(), Qf=Qf.tolist()))
(out / "reference_check.json").write_text(json.dumps(picks), encoding="utf-8")
print(f"exported constants from {len(WKEYS)} writers (sha1 {meta['constants_sha1']}) to {out}")
print("consistency percentiles:", {k: round(v, 3) for k, v in pct.items()})
