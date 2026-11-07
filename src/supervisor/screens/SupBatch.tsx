import { useState } from "react";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import Tag from "../../components/Tag";
import VerdictBadge from "../../components/VerdictBadge";
import { clientName } from "../data";
import type { SupProps } from "../SupervisorApp";
import { simTag } from "../SupTabs";

/** Illustrative batch jobs. "Process next" only moves the simulated progress forward. */
export default function SupBatch({ data, setData, go }: SupProps) {
  const [open, setOpen] = useState(data.batches[0]?.id ?? "");
  const job = data.batches.find(b => b.id === open);
  const step = (id: string) => setData({ ...data, batches: data.batches.map(b => b.id === id ? { ...b, processed: Math.min(b.caseIds.length, b.processed + 1) } : b) });
  return <div className="page"><PageHeader title="Batch Check" description="Illustrative batch jobs with progress and sample results." action={simTag()} />
    <section className="panel table-panel"><div className="panel-head"><div><span>JOBS</span><h2>{data.batches.length} simulated batches</h2></div></div>
      <div className="table-scroll"><table><thead><tr><th>Batch</th><th>Name</th><th>Submitted</th><th>Progress</th><th>Status</th></tr></thead>
        <tbody>{data.batches.map(b => { const done = b.processed === b.caseIds.length; return <tr key={b.id} className={`clickable-row ${open === b.id ? "selected-row" : ""}`} onClick={() => setOpen(b.id)}>
          <td className="num">{b.id}</td><td>{b.name}</td><td className="num">{b.submitted}</td>
          <td><div className="sim-progress" aria-label={`${b.processed} of ${b.caseIds.length}`}><i style={{ width: `${b.processed / b.caseIds.length * 100}%` }} /></div><small className="num">{b.processed} / {b.caseIds.length}</small></td>
          <td><Tag tone={done ? "ready" : b.processed ? "accent" : "neutral"}>{done ? "Complete" : b.processed ? "Running" : "Queued"}</Tag></td></tr>; })}</tbody></table></div>
    </section>
    {job && <section className="panel table-panel"><div className="panel-head"><div><span>{job.id}</span><h2>Results so far</h2></div>{job.processed < job.caseIds.length && <Button secondary icon="scan" onClick={() => step(job.id)}>Process next (simulated)</Button>}</div>
      <div className="table-scroll"><table><thead><tr><th>Case</th><th>Client</th><th>Model classification</th><th>Confidence</th></tr></thead>
        <tbody>{job.caseIds.map((id, i) => { const c = data.cases.find(x => x.id === id)!; return <tr key={id} className={i < job.processed ? "clickable-row" : ""} onClick={i < job.processed ? () => go({ section: "cases", tab: "cases", id }) : undefined}>
          <td className="num">{id}</td><td>{clientName(data, c.clientId)}</td><td>{i < job.processed ? <VerdictBadge verdict={c.verdict} /> : <Tag>Waiting</Tag>}</td><td className="num">{i < job.processed ? c.confidence : "—"}</td></tr>; })}</tbody></table></div>
      <p className="chart-note">Summary: {job.caseIds.slice(0, job.processed).map(id => data.cases.find(c => c.id === id)!).filter(c => c.verdict === "UNCERTAIN").length} uncertain of {job.processed} processed.</p>
    </section>}
  </div>;
}
