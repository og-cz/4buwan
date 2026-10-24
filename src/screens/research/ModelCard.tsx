import PageHeader from "../../components/PageHeader";
import { LIMITATIONS } from "../../limitations";
import type { ModelMeta, ResearchResults } from "../../types";

export default function ModelCard({ model, results }: { model: ModelMeta | null; results: ResearchResults }) {
  const dev = results.split.development, held = results.split.reserved;
  const s = model?.settings;
  return <div className="page"><PageHeader title="Model card" description="What the model does, how it was built, and where it can fail." />
    <section className="panel model-card">
      <h2>Writer-adaptive one-class signature verification</h2>
      <p>Enrol 12 genuine signatures; the tool learns how much this person&apos;s signature naturally varies. A questioned signature is compared with each of the 12 using 17 kinds of difference and scored by a model trained only on genuine signatures. A human decides.</p>
      <dl>
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
    <section className="panel limitations"><div><h2>Limitations</h2><p>{LIMITATIONS}</p></div></section>
  </div>;
}
