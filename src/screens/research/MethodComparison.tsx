import { useState } from "react";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import Tag from "../../components/Tag";
import { percent } from "../../format";
import type { PerformanceRow } from "../../types";
import { CONDITIONS, corpora, find, type Corpus } from "./corpora";

const methods: [string, string, string][] = [
  [CONDITIONS.standard, "Standard method", "The conventional approach"],
  [CONDITIONS.shared, "Shared yardstick", "One measure for everyone"],
  [CONDITIONS.ours, "Our method", "Adapts to each person"],
];

export default function MethodComparison({ rows }: { rows: PerformanceRow[] }) {
  const [corpus, setCorpus] = useState<Corpus>("ALL");
  const ours = find(rows, CONDITIONS.ours, "ALL"), shared = find(rows, CONDITIONS.shared, "ALL");
  const gain = ours && shared ? ours.AUC - shared.AUC : null;
  const tested = [CONDITIONS.perWriter, CONDITIONS.cohort].map(c => find(rows, c, corpus)).filter((r): r is PerformanceRow => !!r);
  return <div className="page"><PageHeader title="Method comparison" description="How well each method separates genuine and forged signatures on the development writers." />
    <div className="dataset-tabs">{corpora.map(([k, label]) => <button className={corpus === k ? "active" : ""} onClick={() => setCorpus(k)} key={k}>{label}</button>)}</div>
    <div className="method-grid">{methods.map(([condition, name, about], i) => {
      const r = find(rows, condition, corpus);
      return <section className={`panel method-card ${i === 2 ? "ours" : ""}`} key={condition}>
        <div className="method-title"><span>{String(i + 1).padStart(2, "0")}</span><div><h2>{name}</h2><p>{about}</p></div>{i === 2 && <Tag tone="accent">CURRENT</Tag>}</div>
        {r ? <div className="method-values"><div><span>SEPARATION SCORE (AUC)</span><strong>{r.AUC.toFixed(3)}</strong><small>1.0 perfect · 0.5 guessing</small></div><div><span>EQUAL ERROR RATE</span><strong>{percent(r.EER)}</strong></div></div> : <p className="input-hint">No result for this corpus.</p>}
        {r && <p className="chart-note">{r.writers} development writers</p>}
      </section>;
    })}</div>
    {gain !== null && ours && <section className="reliability panel"><Icon name="help" /><div><span>IS THE IMPROVEMENT RELIABLE?</span><h2>Our method&apos;s gain over the shared yardstick is small ({gain >= 0 ? "+" : ""}{gain.toFixed(3)}) but statistically reliable on the {ours.writers} development writers.</h2><p>Paired over writers (Wilcoxon test, Holm correction). Most of the improvement over the standard method comes from the shared yardstick, an existing technique.</p></div></section>}
    {tested.length > 0 && <section className="tested panel"><span>TESTED — DID NOT HELP</span><div>{tested.map(r => <Tag key={r.condition}>{r.condition} · AUC {r.AUC.toFixed(3)}</Tag>)}</div></section>}
  </div>;
}
