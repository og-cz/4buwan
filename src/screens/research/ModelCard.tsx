import PageHeader from "../../components/PageHeader";
import { LIMITATIONS } from "../../limitations";
import { OUR_METHOD_LONG } from "../../methods";
import type { ModelMeta, ResearchResults } from "../../types";

export default function ModelCard({ model, results }: { model: ModelMeta | null; results: ResearchResults }) {
  const dev = results.split.development, held = results.split.reserved;
  const s = model?.settings;
  const hb = results.heldback;
  return <div className="page"><PageHeader title="Model card" description="What the model does, how it was built, and where it can fail." />
    <section className="panel model-card">
      <h2>{OUR_METHOD_LONG}</h2>
      <p>Enrol 12 genuine signatures; the tool learns how much this person&apos;s signature naturally varies. A questioned signature is compared with each of the 12, and its closest match is scored in this person&apos;s own units, using only genuine signatures. A human decides.</p>
      <dl>
        <div><dt>Method</dt><dd>Our method · R1-WAW-V: the 12 measures that compare the two HOG vectors are combined along R1-WAW&apos;s main direction u₁, learned from genuine pairs only; a questioned signature is scored one-sidedly at its closest reference, in the person&apos;s own mean and spread along u₁</dd></div>
        <div><dt>Model version</dt><dd>{model?.model_version ?? "Service not running"}</dd></div>
        <div><dt>Built from</dt><dd>{dev.TOTAL} development writers (CEDAR {dev.CEDAR}, Bengali {dev.Bengali}, Hindi {dev.Hindi}){model ? ` · ${model.built_from}` : ""}</dd></div>
        <div><dt>Held-back writers</dt><dd>{hb ? <>{held.TOTAL} kept out of development. {hb.writers} never evaluated before were scored once ({hb.date}) with an earlier form of the model: {hb.confirmation.first_form.toFixed(3)} vs {hb.confirmation.shared.toFixed(3)} for the shared yardstick, not a significant gain. The final model, whose settings were chosen afterwards, scored {hb.posthoc.final.toFixed(3)} on the same writers (post-hoc).</> : <>{held.TOTAL}, kept for one final check</>}</dd></div>
        {s && <>
          <div><dt>Image</dt><dd>{s.image}, HOG {s.hog} ({s.hog_dim} numbers)</dd></div>
          <div><dt>Reference Samples</dt><dd>{s.n_enrol} per person · {s.pairs} reference pairs · {s.model === "R1-WAW-V" ? `17 Difference Measures, ${s.measures} of them in the score` : `${s.measures} Difference Measures`}</dd></div>
          {s.model === "R1-WAW-V" ? <>
            <div><dt>R1-WAW-V settings</dt><dd>{s.score} · u₁ carries {((s.u1_share ?? 0) * 100).toFixed(1)}% of the pooled within-writer variance · η {s.eta} (strict whitening, not tuned) · spread floor {s.sigma_floor}</dd></div>
            <div><dt>Decision rule</dt><dd>global thresholds fixed once on the development writers: Likely forged below {s.threshold_low?.toFixed(2)}, Likely genuine above {s.threshold_high?.toFixed(2)} (5% targets); no forgery of an enrolled person is used</dd></div>
          </> : <>
            <div><dt>One-class SVM</dt><dd>nu {s.nu} · gamma {s.gamma} · metric rank {s.rank}</dd></div>
            {s.eta !== undefined && <div><dt>R1-WAW settings</dt><dd>adaptation strength η {s.eta} · kernel sharpness τ {s.tau} · chosen on the development writers</dd></div>}
          </>}
        </>}
        {model && <div><dt>Exported</dt><dd>{model.exported} · constants {model.constants_sha1}</dd></div>}
      </dl>
    </section>
    <section className="panel limitations"><div><h2>Limitations</h2><p>{LIMITATIONS}</p></div></section>
  </div>;
}
