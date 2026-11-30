"""Proves the app's engine gives the notebooks' numbers. Run:  pytest -q   (from the backend folder)

The app runs R1-WAW-V (thesis Section 3.4.6); the one-class model R1-WAW is kept in the engine and tested here too.

If any test here fails, the app no longer matches the research results. Fix the app, not the test.
"""
import json
from pathlib import Path

import numpy as np
import pytest
from PIL import Image
from sklearn.metrics import roc_auc_score

from sigdesk_engine import engine as E

ART = E.ARTIFACT_DIR
K = E.Constants.load()
REF = json.loads((ART / "reference_check.json").read_text(encoding="utf-8"))


def test_constants_shapes():
    assert K.global_spread.shape == (17,) and K.sigma_pool.shape == (17, 17)
    assert K.pool_eval.shape == (17,) and K.pool_evec.shape == (17, 17)
    assert np.all(np.diff(K.pool_eval) <= 1e-12), "eigenvalues must be sorted descending"


def test_j_closed_form():
    """R1-WAW: W = G + (sigma_eff^-1 - lambda1^-1/2) u1 u1^T with sigma_eff^2 = lambda1 (sigma_w^2 / lambda1)^eta."""
    P = np.array(REF[0]["P"])
    S = E.writer_covariance(P, K); u1 = K.pool_evec[:, 0]; s2 = float(u1 @ S @ u1); lam1 = K.pool_eval[0]
    s_eff2 = lam1 * (s2 / lam1) ** E.R1WAW_ETA
    closed = E.inv_sqrt(K.sigma_pool) + (s_eff2 ** -0.5 - lam1 ** -0.5) * np.outer(u1, u1)
    W = E.metric_matrix(P, K, "J")[1]
    assert np.allclose(closed, W, atol=1e-9 * np.abs(W).max())


def test_final_settings_and_first_form():
    """The app runs the final model (eta = 3, tau = 3); eta = 1 gives back the first form (rank-1 own covariance)."""
    assert E.R1WAW_ETA == 3.0 and E.KERNEL_SHARPNESS == 3.0
    P = np.array(REF[0]["P"]); S = E.writer_covariance(P, K)
    assert np.allclose(E.r1waw_sigma(S, 1.0, K), E.rank_r_sigma(S, 1, K), atol=1e-12)


@pytest.mark.parametrize("ref", REF, ids=lambda r: f"{r['corpus']}-{r['writer']}")
def test_auc_matches_notebook(ref):
    """Same pairs in -> same AUC out as per_writer_results.csv (condition J, the final model)."""
    P, Qg, Qf = (np.array(ref[x]) for x in ("P", "Qg", "Qf"))
    m = E.fit_model(P, K, "J")
    sg = np.array([E.score_pairs(m, q, K).mean() for q in Qg])
    sf = np.array([E.score_pairs(m, q, K).mean() for q in Qf])
    auc = roc_auc_score(np.r_[np.ones(len(sg)), np.zeros(len(sf))], np.r_[sg, sf])
    assert abs(auc - ref["auc_notebook"]) < 1e-9, (auc, ref["auc_notebook"])


@pytest.mark.parametrize("ref", REF, ids=lambda r: f"{r['corpus']}-{r['writer']}")
def test_consistency_ratio(ref):
    assert abs(E.consistency_ratio(np.array(ref["P"]), K) - ref["consistency"]) < 1e-9


def test_descriptor_symmetry_and_zero():
    r = np.random.RandomState(0); a, b = r.rand(2916), r.rand(2916)
    assert np.allclose(E.pair_descriptor(a, b), E.pair_descriptor(b, a))
    assert np.allclose(E.pair_descriptor(a, a), 0, atol=1e-6)
    assert len(E.PAIR_IDX) == 66


def test_preprocess_and_hog_shapes(tmp_path):
    img = np.full((120, 300), 255, np.uint8); img[50:70, 40:260] = 0            # a dark bar on white paper
    p = tmp_path / "s.png"; Image.fromarray(img).save(p)
    s4 = E.preprocess(str(p)); assert s4.shape == (100, 100) and s4.dtype == np.uint8
    assert E.hog_vector(s4).shape == (2916,)
    assert np.array_equal(E.preprocess(p.read_bytes()), s4), "bytes and path input must agree"


FIX = Path(__file__).parent / "fixtures" / "cedar10"
# R1-WAW-V scores of CEDAR writer 10 from the notebook's cached HOG features (the same numbers the images must give)
V_CEDAR10 = {"genuine_score": 0.9572706163527691, "forged_score": -1.905829026280397}
# R1-WAW-V per-writer AUC of the reference writers, from the cached features of the 142 development writers
V_REF_AUC = {"Bengali-002": 0.8194444444444445, "CEDAR-005": 0.8194444444444444, "Hindi-002": 0.9236111111111112}


def test_real_images_match_notebook_scores():
    """CEDAR writer 10 (a development writer): 12 enrolment images -> profile; the scores of one held-out genuine
    and one forgery must equal the scores the notebooks' cached features give, for R1-WAW-V and for the one-class model."""
    exp = json.loads((FIX / "expected.json").read_text())
    prof, details = E.build_profile([str(FIX / f"original_10_{i}.png") for i in range(1, 13)], K)
    g = E.verify(prof, str(FIX / "original_10_13.png"), K)
    f = E.verify(prof, str(FIX / "forgeries_10_1.png"), K)
    assert abs(g["score"] - V_CEDAR10["genuine_score"]) < 1e-9 and abs(f["score"] - V_CEDAR10["forged_score"]) < 1e-9
    m = E.fit_model(E.enrolment_pairs(prof.hogs), K, "J")
    for name, key in (("original_10_13.png", "genuine_score"), ("forgeries_10_1.png", "forged_score")):
        q = E.hog_vector(E.preprocess(str(FIX / name)))
        assert abs(E.score_pairs(m, E.query_pairs(q, prof.hogs), K).mean() - exp[key]) < 1e-9
    assert len(g["comparisons"]) == 12 and len(g["measures"]) == 17 and len(g["similarity_matrix"]) == 13
    assert g["verdict"] in ("LIKELY GENUINE", "LIKELY FORGED", "UNCERTAIN")


def test_profile_roundtrip(tmp_path):
    prof, _ = E.build_profile([str(FIX / f"original_10_{i}.png") for i in range(1, 13)], K)
    prof.save(tmp_path / "p.npz"); back = E.Profile.load(tmp_path / "p.npz")
    q = str(FIX / "original_10_13.png")
    assert E.verify(prof, q, K)["score"] == E.verify(back, q, K)["score"]


def test_quality_check_flags_blank(tmp_path):
    p = tmp_path / "blank.png"; Image.fromarray(np.full((200, 400), 255, np.uint8)).save(p)
    assert not E.quality_check(str(p))["ok"]


def test_profile_from_an_earlier_model_is_refreshed():
    """A profile saved by an earlier model version gets the current model's leave-one-out scores."""
    prof, _ = E.build_profile([str(FIX / f"original_10_{i}.png") for i in range(1, 13)], K)
    fresh = prof.loo_scores.copy()
    prof.loo_scores = np.zeros(12); prof.model_version = "J-rank1-v1"
    assert E.refresh_profile(prof, K) and np.allclose(prof.loo_scores, fresh)
    assert prof.model_version == K.meta["model_version"] and not E.refresh_profile(prof, K)


def test_v_constants():
    """R1-WAW-V Phase A constants reproduce the thesis (Sections 3.4.6 and 4.1.14)."""
    assert len(E.V_IDX) == 12 and E.V_SPREAD.shape == (12,) and E.V_U1.shape == (12,)
    assert abs(np.linalg.norm(E.V_U1) - 1) < 1e-9 and np.all(E.V_U1 > 0), "u1 is a unit vector with all loadings positive"
    assert abs(E.V_SHARE - 0.7736) < 5e-5 and abs(E.V_SIGMA_FLOOR - 1.00) < 5e-3
    lo, hi = E.V_THRESHOLDS[0.05]; assert abs(lo + 0.41) < 5e-3 and abs(hi - 1.03) < 5e-3
    assert K.meta["model_version"] == E.MODEL_VERSION and K.meta["settings"]["model"] == "R1-WAW-V"


@pytest.mark.parametrize("ref", REF, ids=lambda r: f"{r['corpus']}-{r['writer']}")
def test_v_auc_matches_notebook(ref):
    """Same pairs in -> same R1-WAW-V AUC out as the cached features of the development writers."""
    P, Qg, Qf = (np.array(ref[x]) for x in ("P", "Qg", "Qf"))
    t = E.v_levels(P); m, sd = t.mean(), max(t.std(), E.V_SIGMA_FLOOR)
    s = [-(E.v_levels(q).min() - m) / sd for q in list(Qg) + list(Qf)]
    auc = roc_auc_score(np.r_[np.ones(len(Qg)), np.zeros(len(Qf))], s)
    assert abs(auc - V_REF_AUC[ref["writer"]]) < 1e-9, (auc, V_REF_AUC[ref["writer"]])


def test_v_score_is_the_closest_reference_in_the_writers_units():
    prof, _ = E.build_profile([str(FIX / f"original_10_{i}.png") for i in range(1, 13)], K)
    r = E.verify(prof, str(FIX / "forgeries_10_1.png"), K)
    vals = np.array([c["value"] for c in r["comparisons"]])
    assert abs(r["score"] - vals.max()) < 1e-5 and r["matches"] == int((vals > 0).sum())
    m, sd = E.v_writer_stats(prof.hogs)
    assert abs(prof.consistency - sd / np.sqrt(E.V_LAMBDA1)) < 1e-12 and sd >= E.V_SIGMA_FLOOR


def test_v_thresholds_follow_the_settings():
    """Standard = 5% targets; Strict raises the lower threshold, Wide raises the upper one; the zone never inverts."""
    lo, hi = E.v_thresholds("Standard", "Standard"); assert (lo, hi) == E.V_THRESHOLDS[0.05]
    assert E.v_thresholds("Strict", "Standard")[0] > lo > E.v_thresholds("Lenient", "Standard")[0]
    assert E.v_thresholds("Standard", "Wide")[1] > hi > E.v_thresholds("Standard", "Narrow")[1]
    for s in E.V_STRICTNESS:
        for u in E.V_UNCERTAIN:
            a, b = E.v_thresholds(s, u); assert a <= b
    assert E.decide_v(hi + 0.01, np.ones(12))["verdict"] == "LIKELY GENUINE"
    assert E.decide_v(lo - 0.01, np.ones(12))["verdict"] == "LIKELY FORGED"
    assert E.decide_v((lo + hi) / 2, np.ones(12))["verdict"] == "UNCERTAIN"
