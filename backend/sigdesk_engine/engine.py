"""Signature Desk engine: the verification model from 4buwan_master_notebook.ipynb, packaged for the app.

DO NOT CHANGE the numbered functions below (preprocessing, HOG, pair descriptor, metric, SVM settings).
They are copied from the notebook and are tested against its results in tests/test_engine.py. Changing
them breaks the link between the app and the reported research results.

Pipeline for one person
    12 genuine images -> preprocess (S0..S4) -> HOG (2,916 numbers each)
    -> 66 pair descriptors (17 numbers each) -> writer metric J -> one-class SVM  = Signature Profile
Verification
    questioned image -> HOG -> 12 pair descriptors against the references -> same metric -> SVM
    -> mean decision value = score -> verdict by the decision policy.
"""
from __future__ import annotations

import io
import itertools
import json
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from PIL import Image
from skimage.feature import hog as sk_hog
from sklearn.svm import OneClassSVM

# ============================================================================================
# 1. FROZEN SETTINGS (identical to the notebook; never tune these in the app)
# ============================================================================================
N_ENROL = 12
TARGET_SIZE = (100, 100)
MAX_ASPECT = 2.5
DENSITY_KEEP = 0.02
HOG_KW = dict(orientations=9, pixels_per_cell=(10, 10), cells_per_block=(2, 2), block_norm="L2-Hys", feature_vector=True)
EPS = 1e-9
NU, GAMMA = 0.10, "scale"
EV_FLOOR = 1e-8
J_RANK = 1
MEASURES = ["L1", "L2", "Linf", "cosine", "correlation", "canberra", "braycurtis", "absdiff_std", "absdiff_median",
            "absdiff_p90", "d_mean", "d_std", "d_max", "d_energy", "chi2", "hist_inter", "d_sum"]
NDIM = len(MEASURES)
PAIR_IDX = np.array(list(itertools.combinations(range(N_ENROL), 2)))          # the 66 enrolment pairs
ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"


# ============================================================================================
# 2. PREPROCESSING (notebook Step 5)
# ============================================================================================
def otsu_threshold(a: np.ndarray) -> int:
    hist = np.bincount(a.ravel(), minlength=256).astype(np.float64); total = hist.sum()
    if total == 0: return 127
    omega = np.cumsum(hist) / total; mu = np.cumsum(hist * np.arange(256)) / total; mu_t = mu[-1]
    denom = omega * (1 - omega); denom[denom == 0] = 1e-12
    return int(np.argmax((mu_t * omega - mu) ** 2 / denom))


def load_gray(source) -> np.ndarray:
    """source: a file path or raw image bytes. Returns 8-bit grey (ink dark, paper light)."""
    im = Image.open(io.BytesIO(source)) if isinstance(source, (bytes, bytearray)) else Image.open(source)
    with im:
        if im.mode not in ("L", "I;16", "I"): im = im.convert("L")
        a = np.asarray(im)
    if a.dtype != np.uint8:
        a = (255.0 * (a.astype(np.float64) - a.min()) / max(1e-9, (a.max() - a.min()))).astype(np.uint8)
    return a


def s1_invert(a): return (255 - a).astype(np.uint8)


def s2_ink(a):
    t = otsu_threshold(a); return np.where(a > t, a, 0).astype(np.uint8)


def s3_crop_pad(a):
    rows = a.sum(axis=1).astype(float); cols = a.sum(axis=0).astype(float)
    rmax = rows.max() if rows.max() > 0 else 1.0; cmax = cols.max() if cols.max() > 0 else 1.0
    r = np.where(rows >= DENSITY_KEEP * rmax)[0]; c = np.where(cols >= DENSITY_KEEP * cmax)[0]
    b = a if (len(r) == 0 or len(c) == 0) else a[r.min():r.max() + 1, c.min():c.max() + 1]
    h, w = b.shape[:2]
    if h == 0 or w == 0: return a
    if w / h > MAX_ASPECT:
        new_h = int(np.ceil(w / MAX_ASPECT)); pad = new_h - h; b = np.pad(b, ((pad // 2, pad - pad // 2), (0, 0)))
    elif h / w > MAX_ASPECT:
        new_w = int(np.ceil(h / MAX_ASPECT)); pad = new_w - w; b = np.pad(b, ((0, 0), (pad // 2, pad - pad // 2)))
    return b.astype(np.uint8)


def s4_resize(a): return np.asarray(Image.fromarray(a).resize(TARGET_SIZE, Image.BILINEAR)).astype(np.uint8)


def stages(source) -> dict[str, np.ndarray]:
    """All five stages, for the 'Preprocessing trace' panel."""
    a0 = load_gray(source); a1 = s1_invert(a0); a2 = s2_ink(a1); a3 = s3_crop_pad(a2); a4 = s4_resize(a3)
    return {"S0": a0, "S1": a1, "S2": a2, "S3": a3, "S4": a4}


def preprocess(source) -> np.ndarray:
    return stages(source)["S4"]


# ============================================================================================
# 3. FEATURES AND PAIR DESCRIPTOR (notebook Steps 6-7)
# ============================================================================================
def hog_vector(img100: np.ndarray) -> np.ndarray:
    return sk_hog(img100, **HOG_KW).astype(np.float32)


def hog_picture(img100: np.ndarray) -> np.ndarray:
    """Stroke-direction picture for the Expert 'HOG map' panel (display only)."""
    _, vis = sk_hog(img100, visualize=True, **{k: v for k, v in HOG_KW.items() if k != "feature_vector"})
    vis = vis / (vis.max() or 1.0)
    return (255 * vis).astype(np.uint8)


def pair_descriptor(a, b) -> np.ndarray:
    """Symmetric 17-number difference between two HOG vectors (identical to the notebook)."""
    a = np.asarray(a, float); b = np.asarray(b, float); d = np.abs(a - b)
    na, nb = np.linalg.norm(a), np.linalg.norm(b)
    cos = 1 - float(a @ b) / (na * nb + EPS)
    ac, bc = a - a.mean(), b - b.mean()
    cor = 1 - float(ac @ bc) / (np.linalg.norm(ac) * np.linalg.norm(bc) + EPS)
    return np.array([
        d.mean(), np.sqrt((d ** 2).sum()), d.max(), cos, cor,
        float(np.sum(d / (np.abs(a) + np.abs(b) + EPS))),
        float(d.sum() / (np.abs(a + b).sum() + EPS)),
        d.std(), np.median(d), np.percentile(d, 90),
        abs(a.mean() - b.mean()), abs(a.std() - b.std()),
        abs(a.max() - b.max()), abs((a ** 2).sum() - (b ** 2).sum()),
        float(np.sum(d ** 2 / (np.abs(a) + np.abs(b) + EPS))),
        1 - float(np.minimum(np.abs(a), np.abs(b)).sum()) / (max(np.abs(a).sum(), np.abs(b).sum()) + EPS),
        abs(a.sum() - b.sum())], float)


def enrolment_pairs(hogs: np.ndarray) -> np.ndarray:
    return np.array([pair_descriptor(hogs[i], hogs[j]) for i, j in PAIR_IDX])


def query_pairs(q_hog: np.ndarray, hogs: np.ndarray) -> np.ndarray:
    return np.array([pair_descriptor(q_hog, v) for v in hogs])


# ============================================================================================
# 4. FROZEN SHARED YARDSTICK (computed once from the 142 development writers by the notebook)
# ============================================================================================
@dataclass
class Constants:
    global_spread: np.ndarray        # (17,)  P4 standardisation
    sigma_pool: np.ndarray           # (17,17) pooled within-writer covariance
    pool_eval: np.ndarray            # (17,)  eigenvalues, descending
    pool_evec: np.ndarray            # (17,17) eigenvectors as columns
    consistency_percentiles: dict    # population distribution of J's number, for the gauge
    meta: dict = field(default_factory=dict)

    @classmethod
    def load(cls, directory: Path = ARTIFACT_DIR) -> "Constants":
        z = np.load(directory / "engine_constants.npz")
        meta = json.loads((directory / "engine_meta.json").read_text(encoding="utf-8"))
        return cls(z["global_spread"], z["sigma_pool"], z["pool_eval"], z["pool_evec"],
                   meta["consistency_percentiles"], meta)


def inv_sqrt(S: np.ndarray) -> np.ndarray:
    ev, V = np.linalg.eigh(S); ev = np.maximum(ev, EV_FLOOR)
    return V @ np.diag(ev ** -0.5) @ V.T


def writer_covariance(P: np.ndarray, K: Constants) -> np.ndarray:
    Z = (P - P.mean(0)) / K.global_spread
    return np.cov(Z.T, bias=True)


def rank_r_sigma(sigma_w: np.ndarray, r: int, K: Constants) -> np.ndarray:
    U = K.pool_evec
    A = U.T @ sigma_w @ U; M = (U.T @ K.sigma_pool @ U).copy(); M[:r, :r] = A[:r, :r]
    return U @ M @ U.T


def metric_matrix(P: np.ndarray, K: Constants, method: str = "J"):
    """Returns ('diag', scale_vector) for B, or ('full', W) for G and J. J is our algorithm."""
    if method == "B": return "diag", K.global_spread
    if method == "G": return "full", inv_sqrt(K.sigma_pool)
    if method == "J": return "full", inv_sqrt(rank_r_sigma(writer_covariance(P, K), J_RANK, K))
    raise ValueError(method)


def transform(X: np.ndarray, kind: str, M: np.ndarray, K: Constants) -> np.ndarray:
    return X / M if kind == "diag" else (X / K.global_spread) @ M


def consistency_ratio(P: np.ndarray, K: Constants) -> float:
    """J's one number: the person's spread along the main direction / the population's spread."""
    u1 = K.pool_evec[:, 0]
    return float(np.sqrt(u1 @ writer_covariance(P, K) @ u1) / np.sqrt(K.pool_eval[0]))


# ============================================================================================
# 5. PROFILE AND SCORING (notebook Steps 10-11)
# ============================================================================================
@dataclass
class Model:
    method: str
    mu: np.ndarray
    kind: str
    M: np.ndarray
    svm: OneClassSVM

    def decision(self, X: np.ndarray, K: Constants) -> np.ndarray:
        return self.svm.decision_function(transform(X - self.mu, self.kind, self.M, K))


def fit_model(P: np.ndarray, K: Constants, method: str = "J") -> Model:
    mu = P.mean(0); kind, M = metric_matrix(P, K, method)
    svm = OneClassSVM(kernel="rbf", nu=NU, gamma=GAMMA).fit(transform(P - mu, kind, M, K))
    return Model(method, mu, kind, M, svm)


def score_pairs(model: Model, Q: np.ndarray, K: Constants) -> np.ndarray:
    """Q: (12, 17) query-to-reference descriptors -> the 12 decision values."""
    return model.decision(Q, K)


def leave_one_out_scores(hogs: np.ndarray, K: Constants, method: str = "J") -> np.ndarray:
    """Genuine-only reference distribution for the 'Score vs decision line' panel and the uncertain zone:
    each enrolled signature is scored by a model built from the other 11 (55 pairs)."""
    out = []
    for i in range(N_ENROL):
        keep = [j for j in range(N_ENROL) if j != i]
        sub = hogs[keep]
        P = np.array([pair_descriptor(sub[a], sub[b]) for a, b in itertools.combinations(range(len(sub)), 2)])
        m = fit_model(P, K, method)
        out.append(float(m.decision(query_pairs(hogs[i], sub), K).mean()))
    return np.array(out)


# ============================================================================================
# 6. DECISION POLICY (PROVISIONAL - see the note; this is the only part meant to be calibrated)
# ============================================================================================
# Decision line = mean(LOO genuine scores) - C * sd(LOO genuine scores); uncertain zone = line +/- H * sd.
# Chosen on the 142 development writers (genuine->forged 8.5%, forged->genuine 15.8%, ~30% uncertain at Standard).
# This used development forgeries to pick C and H, so it is NOT an independent result: validate in the notebook first.
STRICTNESS = {"Lenient": 1.5, "Standard": 1.0, "Strict": 0.5}        # C: larger = line lower = fewer genuine rejected
UNCERTAIN = {"Narrow": 0.5, "Standard": 1.0, "Wide": 1.5}           # H: half-width of the uncertain zone


def decide(score: float, loo_scores: np.ndarray, strictness: str = "Standard", uncertain: str = "Standard",
           pair_values: np.ndarray | None = None) -> dict:
    """PROVISIONAL policy (genuine-only per person: uses only the person's own 12 reference samples).
    The line sits below the person's typical genuine score by C spreads, so it adapts to each person."""
    s = float(np.std(loo_scores)) or 1e-6
    line = float(np.mean(loo_scores)) - STRICTNESS[strictness] * s
    half = UNCERTAIN[uncertain] * s
    z = (score - line) / s
    position = float(100 / (1 + np.exp(-2 * z)))                      # 0 = different, 100 = similar (display only)
    if abs(score - line) <= half: verdict = "UNCERTAIN"
    elif score > line: verdict = "LIKELY GENUINE"
    else: verdict = "LIKELY FORGED"
    n_match = int((np.asarray(pair_values) > 0).sum()) if pair_values is not None else None
    return dict(verdict=verdict, score=float(score), decision_line=float(line), uncertain_low=float(line - half),
                uncertain_high=float(line + half), position=round(position, 1),
                confidence=int(min(95, round(max(position, 100 - position)))),   # distance from the line, not a probability
                matches=n_match,
                majority_rule_accept=(n_match is not None and n_match >= 7),   # notebook rule T0, shown in Expert view
                policy="provisional-v1 (dev-chosen, not yet validated)")


# ============================================================================================
# 8. HIGH-LEVEL API (the back end calls only these two functions)
# ============================================================================================
@dataclass
class Profile:
    """What is stored for one person. Small (12 x 2,916 floats). The SVM is refitted on load (deterministic, ~10 ms)."""
    hogs: np.ndarray            # (12, 2916) HOG vectors of the reference samples, in enrolment order
    loo_scores: np.ndarray      # (12,) leave-one-out genuine scores
    consistency: float          # J's one number
    model_version: str

    def save(self, path: Path) -> None:
        np.savez_compressed(path, hogs=self.hogs, loo_scores=self.loo_scores,
                            consistency=self.consistency, model_version=self.model_version)

    @classmethod
    def load(cls, path: Path) -> "Profile":
        z = np.load(path, allow_pickle=False)
        return cls(z["hogs"], z["loo_scores"], float(z["consistency"]), str(z["model_version"]))


def consistency_band(value: float, K: Constants) -> dict:
    p = K.consistency_percentiles
    if value < p["p25"]: label, text = "Very consistent", "This person signs very consistently, so checks will be stricter."
    elif value > p["p75"]: label, text = "Variable", "This person's signature varies more than most, so checks are more tolerant."
    else: label, text = "Typical", "This person's signature varies about as much as most people's."
    return dict(value=round(value, 4), label=label, text=text, population=p)


def build_profile(images: list, K: Constants) -> tuple[Profile, dict]:
    """images: 12 file paths or byte strings, in enrolment order. Returns the profile and display details."""
    if len(images) != N_ENROL: raise ValueError(f"exactly {N_ENROL} reference samples are needed, got {len(images)}")
    hogs = np.array([hog_vector(preprocess(x)) for x in images])
    P = enrolment_pairs(hogs)
    loo = leave_one_out_scores(hogs, K)
    c = consistency_ratio(P, K)
    prof = Profile(hogs, loo, c, K.meta.get("model_version", "unknown"))
    Z = (P - P.mean(0)) / K.global_spread
    details = dict(consistency=consistency_band(c, K), pairs=len(P), loo_scores=loo.round(5).tolist(),
                   pair_stats={m: dict(min=float(Z[:, i].min()), q25=float(np.percentile(Z[:, i], 25)),
                                       median=float(np.median(Z[:, i])), q75=float(np.percentile(Z[:, i], 75)),
                                       max=float(Z[:, i].max())) for i, m in enumerate(MEASURES)},
                   reference_similarity=np.round(_hog_distances(hogs), 4).tolist())
    return prof, details


def _hog_distances(H: np.ndarray) -> np.ndarray:
    return np.linalg.norm(H[:, None, :] - H[None, :, :], axis=-1)


def verify(profile: Profile, image, K: Constants, strictness: str = "Standard", uncertain: str = "Standard",
           expert: bool = True) -> dict:
    """Score one questioned signature against a stored profile. Everything the Verify screen shows."""
    q = hog_vector(preprocess(image))
    P = enrolment_pairs(profile.hogs); Q = query_pairs(q, profile.hogs)
    model = fit_model(P, K, "J")
    vals = score_pairs(model, Q, K)
    out = decide(float(vals.mean()), profile.loo_scores, strictness, uncertain, vals)
    out["comparisons"] = [dict(reference=i + 1, value=round(float(v), 5)) for i, v in enumerate(vals)]
    out["reason"] = {"LIKELY GENUINE": "Scores within this person's normal range of genuine signatures.",
                     "LIKELY FORGED": "Scores well below this person's normal range of genuine signatures.",
                     "UNCERTAIN": "Scores at the edge of this person's normal range - ask for another sample."}[out["verdict"]]
    if expert:
        mu = P.mean(0)
        out["measures"] = [dict(name=m, questioned=[round(float(x), 4) for x in (Q[:, i] - mu[i]) / K.global_spread[i]])
                           for i, m in enumerate(MEASURES)]
        out["similarity_matrix"] = np.round(_hog_distances(np.vstack([profile.hogs, q])), 4).tolist()  # 13 x 13, last = questioned
        out["loo_scores"] = profile.loo_scores.round(5).tolist()
        out["method_comparison"] = {}
        for name, meth in (("Standard method", "B"), ("Shared yardstick", "G"), ("Our method", "J")):
            v = score_pairs(fit_model(P, K, meth), Q, K)
            out["method_comparison"][name] = dict(code=meth, score=round(float(v.mean()), 5), matches=int((v > 0).sum()))
        out["consistency"] = consistency_band(profile.consistency, K)
        out["settings"] = dict(nu=NU, gamma=GAMMA, rank=J_RANK, pairs=len(P), model_version=profile.model_version)
    return out


# ============================================================================================
# 7. IMAGE QUALITY CHECK (app feature; does not affect the model)
# ============================================================================================
def quality_check(source) -> dict:
    a = load_gray(source)
    issues = []
    if min(a.shape) < 40: issues.append(("too_small", "Too small - scan at a higher resolution."))
    ink = s2_ink(s1_invert(a)) > 0
    frac = float(ink.mean())
    if frac < 0.002: issues.append(("blank", "Blank or almost blank - check the image."))
    elif frac < 0.005: issues.append(("too_faint", "Too faint - scan again with darker ink."))
    if frac > 0.4: issues.append(("too_dark", "Too much dark area - crop to the signature only."))
    return dict(ok=not issues, ink_fraction=round(frac, 4), issues=[{"code": c, "message": m} for c, m in issues])
