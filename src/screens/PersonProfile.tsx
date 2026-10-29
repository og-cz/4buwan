import { useState } from "react";
import { archivePerson, deletePerson, getPerson, listChecks, sampleUrl } from "../api/client";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import ConsistencyGauge from "../components/ConsistencyGauge";
import DataTable from "../components/DataTable";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import SignatureImage from "../components/SignatureImage";
import SimilarityHeatmap from "../components/charts/SimilarityHeatmap";
import Tag from "../components/Tag";
import VerdictBadge from "../components/VerdictBadge";
import { ErrorState, SkeletonPanel } from "../components/States";
import { decisionTone, formatDate, pad2, statusTone } from "../format";
import type { Go } from "../navigation";
import useAsync from "../state/useAsync";
import { useTerms } from "../state/settings";

type Props = { personId?: string; expert: boolean; go: Go; notify: (m: string) => void };

export default function PersonProfile({ personId, expert, go, notify }: Props) {
  const t = useTerms();
  const person = useAsync(() => personId ? getPerson(personId) : Promise.reject(new Error(`No ${t.lower} selected.`)), [personId]);
  const checks = useAsync(() => personId ? listChecks(personId) : Promise.resolve([]), [personId]);
  const [confirm, setConfirm] = useState<"archive" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (person.loading) return <div className="page"><SkeletonPanel /></div>;
  if (person.error || !person.data) return <div className="page"><PageHeader title="Signature Profile" description="" /><ErrorState message={person.error ?? "Not found."} retry={person.reload} /></div>;
  const p = person.data;

  async function act(kind: "archive" | "delete") {
    setBusy(true); setError(null);
    try {
      if (kind === "archive") { await archivePerson(p.id); notify(`${p.name} archived.`); person.reload(); }
      else { await deletePerson(p.id); notify(`${p.name} deleted.`); go("Reference Library"); }
      setConfirm(null);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }

  const rows = checks.data ?? [];
  return <div className="page"><PageHeader title={p.name} description={`${t.person} ${p.external_id || "—"} · Signature Profile ${p.status.toLowerCase()}`} action={<div className="header-actions">{p.status !== "Archived" && <Button secondary onClick={() => setConfirm("archive")}>Archive</Button>}<Button danger onClick={() => setConfirm("delete")}>Delete</Button><Button icon="verify" disabled={p.status !== "Ready"} onClick={() => go("Verify", { personId: p.id })}>Verify a signature</Button></div>} />
    {error && <ErrorState message={error} />}
    <div className="profile-layout"><section className="panel"><div className="panel-head"><div><span>REFERENCE SIGNATURES</span><h2>{p.samples?.length ?? 0} genuine samples</h2></div><Tag tone={statusTone(p.status)}>PROFILE {p.status.toUpperCase()}</Tag></div><div className="reference-grid">{(p.samples ?? []).map((src, i) => <div key={src}><SignatureImage src={src || sampleUrl(p.id, i + 1)} alt={`Reference ${i + 1}`} /><span>Reference {pad2(i + 1)}</span></div>)}</div></section>
      <section className="panel profile-summary"><div className="panel-head"><div><span>SIGNATURE CONSISTENCY</span><h2>How much {p.name}&apos;s signature naturally changes</h2></div></div><ConsistencyGauge consistency={p.consistency} name={p.name} /><div className="plain-explanation"><Icon name="help" /><p>{p.consistency.text}</p></div><dl><div><dt>Enrolled</dt><dd>{formatDate(p.created)}</dd></div><div><dt>Reference Samples</dt><dd>{p.samples?.length ?? 0}</dd></div><div><dt>Checks</dt><dd>{checks.data ? rows.length : "…"}</dd></div><div><dt>Profile status</dt><dd><Tag tone={statusTone(p.status)}>{p.status.toUpperCase()}</Tag></dd></div>{expert && <><div><dt>Reference pairs</dt><dd>{p.pairs}</dd></div><div><dt>Consistency value</dt><dd>{p.consistency.value.toFixed(4)}</dd></div><div><dt>Population middle half</dt><dd>{p.consistency.population.p25.toFixed(3)} – {p.consistency.population.p75.toFixed(3)}</dd></div></>}</dl></section></div>
    {expert && <section className="expert-section"><div className="expert-heading"><div><span>EXPERT VIEW</span><h2>Profile evidence</h2></div><p>Measured on this {t.lower}&apos;s 12 Reference Samples and their 66 pairs.</p></div><div className="expert-grid">
      <article className="panel analysis-card"><div className="panel-head"><div><span>SIMILARITY MATRIX</span><h2>12 Reference Samples</h2></div></div><SimilarityHeatmap matrix={p.reference_similarity} /></article>
      <article className="panel analysis-card table-panel"><div className="panel-head"><div><span>17 DIFFERENCE MEASURES</span><h2>Spread across the 66 genuine pairs (standardised units)</h2></div></div><div className="table-scroll"><table><thead><tr><th>MEASURE</th><th>MIN</th><th>Q25</th><th>MEDIAN</th><th>Q75</th><th>MAX</th></tr></thead><tbody>{Object.entries(p.pair_stats).map(([m, s]) => <tr key={m}><td>{m}</td><td>{s.min.toFixed(2)}</td><td>{s.q25.toFixed(2)}</td><td>{s.median.toFixed(2)}</td><td>{s.q75.toFixed(2)}</td><td>{s.max.toFixed(2)}</td></tr>)}</tbody></table></div></article>
    </div></section>}
    <section className="panel table-panel"><div className="panel-head"><div><span>CHECKS</span><h2>Checks for this {t.lower}</h2></div></div>{rows.length === 0 ? <p className="input-hint">No checks yet.</p> : <DataTable rows={rows} rowKey={r => r.id} onOpen={r => go("CaseDetail", { caseId: r.id })} columns={[{ header: "DATE & TIME", cell: r => formatDate(r.created, true) }, { header: "CASE", cell: r => r.case_title || r.id }, { header: "VERDICT", cell: r => <VerdictBadge verdict={r.verdict} /> }, { header: "CONFIDENCE", cell: r => r.confidence }, { header: "DECISION", cell: r => <Tag tone={decisionTone(r.decision)}>{r.decision.toUpperCase()}</Tag> }]} />}</section>
    {confirm && <ConfirmDialog title={confirm === "archive" ? `Archive ${p.name}?` : `Delete ${p.name}?`} text={confirm === "archive" ? "The profile is kept for existing Cases but cannot be used for new checks." : "This removes the Signature Profile and its 12 Reference Samples from this computer. Saved Cases stay in the log. This cannot be undone."} confirm={confirm === "archive" ? "Archive" : "Delete"} danger={confirm === "delete"} busy={busy} onConfirm={() => void act(confirm)} onCancel={() => setConfirm(null)} />}
  </div>;
}
