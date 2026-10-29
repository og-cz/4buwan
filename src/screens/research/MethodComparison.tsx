import { useState } from "react";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import Tag from "../../components/Tag";
import { percent } from "../../format";
import { METHOD_NAME, OUR_METHOD } from "../../methods";
import type { PerformanceRow } from "../../types";
import { CONDITIONS, corpora, find, type Corpus } from "./corpora";
import R1WawExplainer from "./R1WawExplainer";

const methods: [string, string, string][] = [
  [CONDITIONS.ours, OUR_METHOD, "Adapts the shared yardstick to each person"],
  [CONDITIONS.shared, METHOD_NAME.G, "One yardstick learned from many writers"],
  [CONDITIONS.standard, METHOD_NAME.B, "The conventional approach"],
];

export default function MethodComparison({ rows }: { rows: PerformanceRow[] }) {
  const [corpus, setCorpus] = useState<Corpus>("ALL");
  const ours = find(rows, CONDITIONS.ours, "ALL"), shared = find(rows, CONDITIONS.shared, "ALL"), standard = find(rows, CONDITIONS.standard, "ALL");
  const gain = ours && shared ? ours.AUC - shared.AUC : null;
  const fromShared = ours && shared && standard && ours.AUC !== standard.AUC ? (shared.AUC - standard.AUC) / (ours.AUC - standard.AUC) : null;
  const tested = [CONDITIONS.perWriter, CONDITIONS.cohort].map(c => find(rows, c, corpus)).filter((r): r is PerformanceRow => !!r);
  return <div className="page"><PageHeader title="Method comparison" description="How well each method separates genuine and forged signatures on the development writers." />
    <div className="dataset-tabs" role="group" aria-label="Corpus">{corpora.map(([k, label]) => <button className={corpus === k ? "active" : ""} aria-pressed={corpus === k} onClick={() => setCorpus(k)} key={k}>{label}</button>)}</div>
    <div className="method-grid">{methods.map(([condition, name, about], i) => {
      const r = find(rows, condition, corpus);
      return <section className={`panel method-card ${i === 0 ? "ours" : ""}`} key={condition}>
        <div className="method-title"><span>{String(i + 1).padStart(2, "0")}</span><div><h2>{name}</h2><p>{about}</p></div>{i === 0 && <Tag tone="accent">Proposed</Tag>}</div>
        {r ? <div className="method-values"><div><span>Separation (AUC)</span><strong>{r.AUC.toFixed(3)}</strong><small>1.0 perfect · 0.5 guessing</small></div><div><span>Equal error rate</span><strong>{percent(r.EER)}</strong></div></div> : <p className="input-hint">No result for this corpus.</p>}
        {r && <p className="chart-note">{r.writers} development writers</p>}
      </section>;
    })}</div>
    {gain !== null && ours && <section className="reliability panel"><Icon name="help" /><div><span>Is the improvement reliable?</span><h2>Our method&apos;s gain over the shared yardstick is small ({gain >= 0 ? "+" : ""}{gain.toFixed(3)}) but statistically reliable on the {ours.writers} development writers.</h2><p>Paired over writers (Wilcoxon test, Holm correction).{fromShared !== null && <> {Math.round(fromShared * 100)}% of the improvement over the standard method comes from the shared yardstick, an existing technique; R1-WAW adds the rest.</>}</p></div></section>}
    <R1WawExplainer />
    {tested.length > 0 && <section className="tested panel"><span>Tested — did not help</span><div>{tested.map(r => <Tag key={r.condition}>{r.condition} · AUC {r.AUC.toFixed(3)}</Tag>)}</div></section>}
  </div>;
}
