import { useState } from "react";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import Tag from "../../components/Tag";
import type { PerformanceRow } from "../../types";
import { CONDITIONS, corpora, find, type Corpus } from "./corpora";

/** The paired-test reading of our method against the shortcut, per corpus (from the notebook; do not reword). */
const reading: Record<Corpus, { title: string; tone: "ready" | "warn" | "bad" | "neutral" }> = {
  ALL: { title: "No difference overall.", tone: "neutral" },
  Hindi: { title: "Our method is better than the shortcut.", tone: "ready" },
  CEDAR: { title: "No reliable difference.", tone: "warn" },
  Bengali: { title: "The shortcut is better.", tone: "bad" },
};

export default function DatasetCheck({ rows }: { rows: PerformanceRow[] }) {
  const [corpus, setCorpus] = useState<Corpus>("ALL");
  const ours = find(rows, CONDITIONS.ours, corpus), shortcut = find(rows, CONDITIONS.shortcut, corpus);
  const read = reading[corpus];
  const meter = (auc: number) => `${Math.max(0, (auc - 0.5) * 200)}%`;
  return <div className="page"><PageHeader title="Dataset check" description="Can this dataset be solved without reading the handwriting at all?" />
    <div className="dataset-tabs">{corpora.map(([k, label]) => <button className={corpus === k ? "active" : ""} onClick={() => setCorpus(k)} key={k}>{label}</button>)}</div>
    {ours && shortcut ? <>
      <div className="facts-grid">
        <section className="panel fact-card"><span>Our method · R1-WAW</span><h2>Reads the handwriting</h2><strong>{ours.AUC.toFixed(3)}</strong><small>Separation (AUC)</small><div className="fact-meter"><i /><em className="ours-meter" style={{ width: meter(ours.AUC) }} /></div><div><span>0.50 guessing</span><span>1.00 perfect</span></div></section>
        <section className="panel fact-card"><span>Shortcut control</span><h2>Simple image facts only (no handwriting)</h2><strong>{shortcut.AUC.toFixed(3)}</strong><small>Separation (AUC)</small><div className="fact-meter"><i /><em style={{ width: meter(shortcut.AUC) }} /></div><div><span>0.50 guessing</span><span>1.00 perfect</span></div></section>
        <section className="panel fact-card"><span>Reading</span><h2>{corpora.find(c => c[0] === corpus)?.[1]} · {ours.writers} writers</h2><strong>{shortcut.AUC > ours.AUC ? "+" : ""}{(shortcut.AUC - ours.AUC).toFixed(3)}</strong><small>Shortcut minus our method</small><div className="fact-reading"><Tag tone={read.tone}>{read.title.replace(".", "").toUpperCase()}</Tag></div></section>
      </div>
      <section className="panel plain-verdict"><div><Icon name="audit" size={24} /></div><section><span>Plain verdict</span><h2>{read.title}</h2><p>These public datasets contain cues unrelated to handwriting. Bengali results should not be read as signature verification.</p></section><div><span>Our method · R1-WAW</span><strong>{ours.AUC.toFixed(3)}</strong><small>vs simple facts {shortcut.AUC.toFixed(3)}</small></div></section>
    </> : <p className="input-hint">No result for this corpus.</p>}
  </div>;
}
