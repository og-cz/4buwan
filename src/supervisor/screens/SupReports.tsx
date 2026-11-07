import { useState } from "react";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import Tag from "../../components/Tag";
import VerdictBadge from "../../components/VerdictBadge";
import { decisionTone } from "../../format";
import { OUR_METHOD, OUR_METHOD_LONG } from "../../methods";
import MockSignature from "../MockSignature";
import { clientName, pct, stats } from "../data";
import type { SupProps } from "../SupervisorApp";
import SupTabs, { simTag } from "../SupTabs";

/** Illustrative only. The real research results are in the Examiner demo → Research Lab. */
const ILLUSTRATIVE: [string, string, number][] = [[OUR_METHOD, "Adapts the shared yardstick to each person", 0.85], ["Shared yardstick", "One yardstick learned from many writers", 0.83], ["Standard method", "The conventional approach", 0.78]];

export default function SupReports({ data, route, go }: SupProps) {
  const tab = route.tab ?? "reports";
  const decided = data.cases.filter(c => c.decision !== "Pending");
  const [open, setOpen] = useState(decided[0]?.id ?? "");
  const r = decided.find(c => c.id === open);
  const s = stats(data);
  const notice = <p className="plain-explanation sim-notice">Illustrative values for the demonstration. The real, measured research results are in the Examiner demo under Research Lab.</p>;
  return <div className="page"><PageHeader title="Reports & Research" description="Example evidence reports, an illustrative method comparison, illustrative benchmarks and a research summary." action={simTag()} />
    <SupTabs route={route} go={go} label="Reports & Research" tabs={[["reports", "Example reports"], ["methods", "Method comparison"], ["benchmarks", "Benchmarks"], ["summary", "Research summary"]]} />
    {tab === "reports" && <div className="sim-report-layout">
      <section className="panel table-panel"><div className="panel-head"><div><span>EXAMPLE REPORTS</span><h2>{decided.length} decided cases</h2></div></div>
        <div className="table-scroll"><table><thead><tr><th>Case</th><th>Client</th><th>Decision</th></tr></thead><tbody>{decided.map(c => <tr key={c.id} className={`clickable-row ${open === c.id ? "selected-row" : ""}`} onClick={() => setOpen(c.id)}><td className="num">{c.id}</td><td>{clientName(data, c.clientId)}</td><td><Tag tone={decisionTone(c.decision)}>{c.decision}</Tag></td></tr>)}</tbody></table></div></section>
      {r && <section className="panel sim-report"><div className="panel-head"><div><span>EXAMPLE EVIDENCE REPORT · SIMULATED</span><h2>{r.title}</h2></div><Button secondary icon="print" onClick={() => window.print()}>Print example</Button></div>
        <dl className="sim-facts"><div><dt>Case</dt><dd>{r.id}</dd></div><div><dt>Client</dt><dd>{clientName(data, r.clientId)}</dd></div><div><dt>Date</dt><dd>{r.date}</dd></div><div><dt>Reviewer</dt><dd>{r.reviewer ?? "—"}</dd></div></dl>
        <MockSignature seed={data.clients.find(c => c.id === r.clientId)?.seed ?? 1} variant={3} />
        <p><strong>Model classification:</strong> <VerdictBadge verdict={r.verdict} /> (confidence {r.confidence})</p>
        <p><strong>Human decision:</strong> <Tag tone={decisionTone(r.decision)}>{r.decision}</Tag> {r.note}</p>
        <p className="chart-note">Example layout only. Not a real report and not produced by the model.</p></section>}
    </div>}
    {tab === "methods" && <>{notice}<div className="method-grid">{ILLUSTRATIVE.map(([name, about, v], i) => <section key={name} className={`panel method-card ${i === 0 ? "ours" : ""}`}><div className="method-title"><span>0{i + 1}</span><div><h2>{name}</h2><p>{about}</p></div>{i === 0 && <Tag tone="accent">Proposed</Tag>}</div>
      <div className="method-values"><div><span>Separation (illustrative)</span><strong>{v.toFixed(2)}</strong></div></div></section>)}</div></>}
    {tab === "benchmarks" && <>{notice}<section className="panel"><div className="panel-head"><div><span>ILLUSTRATIVE BENCHMARKS</span><h2>What a dataset check looks like</h2></div></div>
      <p>The research checks whether simple image facts, which ignore the handwriting, can already tell genuine from forged signatures. If they can, the dataset contains shortcuts and its results must be read with care. This panel shows the idea with made-up bars.</p>
      <div className="sim-bench">{[["Reads the handwriting", 82], ["Simple image facts only", 64]].map(([label, v]) => <div key={label}><span>{label}</span><i><em style={{ width: `${v}%` }} /></i></div>)}</div></section></>}
    {tab === "summary" && <section className="panel model-card"><h2>{OUR_METHOD_LONG}</h2>
      <p>The method enrols 12 genuine signatures, learns how much that person&apos;s signature naturally varies, and scores a questioned signature against all 12. It adapts a yardstick shared by many writers to the person along one direction only, so 12 samples are enough.</p>
      <p>In this simulated office, the model and the reviewers agreed on {pct(s.agreement)} of the {s.agreementBase} cases with a clear classification and a final decision. That figure comes from the fictional records, not from the research.</p></section>}
  </div>;
}
