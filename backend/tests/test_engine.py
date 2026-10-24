"""Proves the app's engine gives the notebook's numbers. Run:  pytest -q   (from the backend folder)

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
    """J = G + (sigma_w^-1 - lambda1^-1/2) u1 u1^T  (notebook Step 10 check)."""
    P = np.array(REF[0]["P"])
    S = E.writer_covariance(P, K); u1 = K.pool_evec[:, 0]; s2 = float(u1 @ S @ u1)
    closed = E.inv_sqrt(K.sigma_pool) + (s2 ** -0.5 - K.pool_eval[0] ** -0.5) * np.outer(u1, u1)
    assert np.allclose(closed, E.metric_matrix(P, K, "J")[1], atol=1e-6)


@pytest.mark.parametrize("ref", REF, ids=lambda r: f"{r['corpus']}-{r['writer']}")
def test_auc_matches_notebook(ref):
    """Same pairs in -> same AUC out as per_writer_results.csv (condition J)."""
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


def test_real_images_match_notebook_scores():
    """CEDAR writer 10 (a development writer): 12 enrolment images -> profile; the scores of one held-out genuine
    and one forgery must equal the scores the notebook's cached features give."""
    exp = json.loads((FIX / "expected.json").read_text())
    prof, details = E.build_profile([str(FIX / f"original_10_{i}.png") for i in range(1, 13)], K)
    g = E.verify(prof, str(FIX / "original_10_13.png"), K)
    f = E.verify(prof, str(FIX / "forgeries_10_1.png"), K)
    assert abs(g["score"] - exp["genuine_score"]) < 1e-9 and abs(f["score"] - exp["forged_score"]) < 1e-9
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
