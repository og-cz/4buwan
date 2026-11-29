"""Re-scores the Sample data folder with the current model, from the images it already holds.

    python tools/rescore_sample.py

Every sample profile gets the current model's leave-one-out scores and every example check is scored again from its
stored image (verdict, score and evidence replaced; case id, date, notes and decisions kept). Use it after a model
update when the CEDAR images are not at hand for tools/seed_sample.py. Real data is never touched.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.main import K, E                      # noqa: E402
from app.storage import current_mode, data_dir, db, resolve   # noqa: E402

token = current_mode.set("sample")
try:
    prof_dir = data_dir() / "profiles"
    people = checks = changed = 0
    with db() as c:
        persons = c.execute("SELECT id, details FROM persons").fetchall()
        for p in persons:
            pf = prof_dir / f"{p['id']}.npz"
            if not pf.exists(): continue
            prof = E.Profile.load(pf)
            if E.refresh_profile(prof, K): prof.save(pf)
            details = json.loads(p["details"])
            details["loo_scores"] = prof.loo_scores.round(5).tolist()
            details["consistency"] = E.consistency_band(prof.consistency, K)
            c.execute("UPDATE persons SET consistency=?, details=? WHERE id=?", (prof.consistency, json.dumps(details), p["id"]))
            people += 1
            for k in c.execute("SELECT id, image, result FROM checks WHERE person_id=?", (p["id"],)).fetchall():
                old = json.loads(k["result"])
                res = E.verify(prof, resolve(k["image"]).read_bytes(), K)
                new = dict(case_id=k["id"], quality=old.get("quality"), **res)
                changed += new["verdict"] != old["verdict"]
                c.execute("UPDATE checks SET verdict=?, confidence=?, score=?, result=? WHERE id=?",
                          (res["verdict"], res["confidence"], res["score"], json.dumps(new), k["id"]))
                checks += 1
    print(f"sample data re-scored: {people} profiles, {checks} checks ({changed} verdicts changed)")
finally:
    current_mode.reset(token)
