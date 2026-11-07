import { useState } from "react";
import Button from "../../components/Button";
import Tag from "../../components/Tag";
import VerdictBadge from "../../components/VerdictBadge";
import { decisionTone } from "../../format";
import MockSignature from "../MockSignature";
import { REVIEWERS, type SimCase, type SimClient, type SimDecision } from "../data";
import { simTag } from "../SupTabs";

/** Simulated per-reference outputs as a small bar strip (positive = genuine-like). */
export function SimBars({ values }: { values: number[] }) {
  const peak = Math.max(...values.map(Math.abs), 1e-6);
  return <div className="sim-bars">{values.map((v, i) => <div key={i} title={`R${String(i + 1).padStart(2, "0")}: ${v.toFixed(3)}`}><i className={v >= 0 ? "pos" : "neg"} style={{ height: `${Math.max(4, Math.abs(v) / peak * 100)}%` }} /><span>R{String(i + 1).padStart(2, "0")}</span></div>)}</div>;
}

type Props = { c: SimCase; client: SimClient | undefined; onDecide: (d: Exclude<SimDecision, "Pending">, note: string) => void; back: () => void };

export default function SupCaseDetail({ c, client, onDecide, back }: Props) {
  const [choice, setChoice] = useState<Exclude<SimDecision, "Pending">>("Accepted");
  const [note, setNote] = useState("");
  const above = c.comparisons.filter(v => v > 0).length;
  return <div className="sim-case">
    <div className="header-actions"><Button secondary onClick={back}>Back to list</Button>{simTag()}</div>
    <div className="case-grid">
      <section className="panel"><div className="panel-head"><div><span>{c.id}</span><h2>{c.title}</h2></div></div>
        <p className="input-hint">{client?.name ?? c.clientId} · {c.date}</p>
        <figure className="sim-figure"><MockSignature seed={client?.seed ?? 1} variant={c.verdict === "LIKELY FORGED" ? 31 : 3} /><figcaption>Questioned signature (simulated)</figcaption></figure>
        <figure className="sim-figure"><MockSignature seed={client?.seed ?? 1} variant={0} /><figcaption>Reference sample 01 (simulated)</figcaption></figure>
      </section>
      <section className="panel"><div className="panel-head"><div><span>MODEL CLASSIFICATION</span><h2>Simulated verification details</h2></div></div>
        <VerdictBadge verdict={c.verdict} />
        <dl className="sim-facts"><div><dt>Score</dt><dd>{c.score.toFixed(3)}</dd></div><div><dt>Confidence</dt><dd>{c.confidence} / 100</dd></div><div><dt>References above zero</dt><dd>{above} of 12</dd></div></dl>
        <SimBars values={c.comparisons} />
        <p className="chart-note">These values are generated for the demo. They are not produced by the verification model.</p>
      </section>
      <section className="panel"><div className="panel-head"><div><span>HUMAN REVIEW</span><h2>Decision</h2></div><Tag tone={decisionTone(c.decision)}>{c.decision}</Tag></div>
        {c.reviewer && <p className="input-hint">Last decided by {c.reviewer}.</p>}{c.note && <p className="input-hint">Note: {c.note}</p>}
        <label className="compact-field"><span>Decision</span><select value={choice} onChange={e => setChoice(e.target.value as Exclude<SimDecision, "Pending">)}><option>Accepted</option><option>Rejected</option><option>Needs more evidence</option></select></label>
        <label className="compact-field"><span>Note</span><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Why this decision was made" /></label>
        <Button icon="save" onClick={() => { onDecide(choice, note); setNote(""); }}>Record simulated decision</Button>
        <p className="chart-note">Recorded only in this demo's memory as {REVIEWERS[0]}. It is not saved.</p>
      </section>
    </div>
  </div>;
}
