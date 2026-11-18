import PageHeader from "../../components/PageHeader";
import { LIMITATIONS } from "../../limitations";
import { OUR_METHOD_LONG } from "../../methods";
import { percent } from "../../format";
import type { ModelMeta, PerformanceRow, ResearchResults } from "../../types";
import { CONDITIONS, corpora, find } from "./corpora";

export default function ModelCard({ model, results, rows }: { model: ModelMeta | null; results: ResearchResults; rows: PerformanceRow[] }) {
  const dev = results.split.development, held = results.split.reserved;
  const s = model?.settings;
  return <div className="page"><PageHeader title="Model card" description="What the model does, how it was built, and where it can fail." />
    <div className="model-card-layout"><section className="panel model-card">
      <h2>{OUR_METHOD_LONG}</h2>
      <p>Enrol 12 genuine signatures; the tool learns how much this person&apos;s signature naturally varies. A questioned signature is compared with each of the 12 using 17 kinds of difference and scored by a model trained only on genuine signatures. A human decides.</p>
      <dl>
        <div><dt>Method</dt><dd>Our method · R1-WAW: shared whitening of the 17 Difference Measures, adapted to the person along its main direction, then a one-class SVM trained on genuine pairs only</dd></div>
        <div><dt>Model version</dt><dd>{model?.model_version ?? "Service not running"}</dd></div>
        <div><dt>Built from</dt><dd>{dev.TOTAL} development writers (CEDAR {dev.CEDAR}, Bengali {dev.Bengali}, Hindi {dev.Hindi}){model ? ` · ${model.built_from}` : ""}</dd></div>
        <div><dt>Held-back writers</dt><dd>{held.TOTAL}, kept for one final check that has not been run</dd></div>
        {s && <>
          <div><dt>Image</dt><dd>{s.image}, HOG {s.hog} ({s.hog_dim} numbers)</dd></div>
          <div><dt>Reference Samples</dt><dd>{s.n_enrol} per person · {s.pairs} reference pairs · {s.measures} Difference Measures</dd></div>
          <div><dt>One-class SVM</dt><dd>nu {s.nu} · gamma {s.gamma} · metric rank {s.rank}</dd></div>
        </>}
        {model && <div><dt>Exported</dt><dd>{model.exported} · constants {model.constants_sha1}</dd></div>}
      </dl>
    </section>
    <aside className="model-card-side">
      <section className="panel side-facts"><span>Results · development writers</span><h2>Our method, by dataset</h2>
        <table className="mini-table"><thead><tr><th>Dataset</th><th>Writers</th><th>AUC</th><th>EER</th></tr></thead><tbody>
          {corpora.map(([k, label]) => { const r = find(rows, CONDITIONS.ours, k); return r && <tr key={k}><td>{label}</td><td>{r.writers}</td><td>{r.AUC.toFixed(3)}</td><td>{percent(r.EER)}</td></tr>; })}
        </tbody></table>
        <p className="chart-note">AUC: 1.0 perfect, 0.5 guessing. EER: the error rate where false accepts equal false rejects.</p>
      </section>
      <section className="panel side-facts"><span>Decision rule · provisional</span><h2>How a score becomes a verdict</h2>
        <p>The Decision Line sits one spread below the mean of the person&apos;s 12 leave-one-out genuine scores; scores within one spread of it are Uncertain. Strictness and the Uncertain Zone in Settings move the line; they never retrain the model.</p>
      </section>
    </aside></div>
    <section className="panel limitations"><div><h2>Limitations</h2><p>{LIMITATIONS}</p></div></section>
  </div>;
}
