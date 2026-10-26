import { useState } from "react";
import { checkImageUrl, getCheck, getCheckImage, getPerson, recordDecision } from "../api/client";
import Button from "../components/Button";
import ExpertEvidence from "../components/ExpertEvidence";
import PageHeader from "../components/PageHeader";
import SignatureViewer from "../components/viewer/SignatureViewer";
import Tag from "../components/Tag";
import VerdictCard from "../components/VerdictCard";
import { ErrorState, Loading } from "../components/States";
import { decisionTone, formatDate } from "../format";
import type { Go } from "../navigation";
import useAsync from "../state/useAsync";
import { useTerms } from "../state/settings";
import type { Decision } from "../types";

type Props = { caseId?: string; expert: boolean; go: Go; notify: (m: string) => void };
type Choice = Exclude<Decision, "Pending">;

export default function CaseDetail({ caseId, expert, go, notify }: Props) {
  const t = useTerms();
  const check = useAsync(() => caseId ? getCheck(caseId) : Promise.reject(new Error("No case selected.")), [caseId]);
  const personId = check.data?.person_id;
  const person = useAsync(() => personId ? getPerson(personId) : Promise.resolve(null), [personId]);
  const image = useAsync(() => caseId && expert ? getCheckImage(caseId) : Promise.resolve(null), [caseId, expert]);
  const [choice, setChoice] = useState<Choice>("Accepted");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (check.loading) return <div className="page"><Loading title="Loading Case" /></div>;
  if (check.error || !check.data) return <div className="page"><PageHeader title="Case" description="" /><ErrorState message={check.error ?? "Not found."} retry={check.reload} /></div>;
  const c = check.data;

  async function save() {
    setSaving(true); setError(null);
    try { await recordDecision(c.id, choice, note); notify(`Decision recorded: ${choice}.`); setNote(""); check.reload(); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  }

  const name = person.data?.name ?? (person.loading ? "…" : "Deleted profile");
  return <div className="page"><PageHeader title={c.case_title || `Case ${c.id}`} description={`${c.id} · ${name} · ${formatDate(c.created, true)}`} action={<div className="header-actions"><Tag tone={decisionTone(c.decision)}>{c.decision.toUpperCase()}</Tag><Button secondary icon="print" onClick={() => go("Evidence Report", { caseId: c.id })}>Evidence Report</Button>{person.data && <Button secondary icon="user" onClick={() => go("Person Profile", { personId: c.person_id, label: person.data?.name })}>Open {t.lower}</Button>}</div>} />
    <div className="case-grid">
      <section className="panel"><div className="panel-head"><div><span>QUESTIONED SIGNATURE</span><h2>As submitted</h2></div></div><SignatureViewer src={checkImageUrl(c.id)} label="Questioned signature" fileName={c.id} quality={c.result.quality} load={() => getCheckImage(c.id)} />{c.notes && <p className="case-notes">{c.notes}</p>}</section>
      <section className={`panel result-card ${c.result.verdict.toLowerCase().replace(" ", "-")}`}><VerdictCard result={c.result} /></section>
      <section className="panel"><div className="panel-head"><div><span>HUMAN DECISION</span><h2>Record decision</h2></div></div>
        <label className="compact-field"><span>DECISION</span><select value={choice} onChange={e => setChoice(e.target.value as Choice)}><option>Accepted</option><option>Rejected</option><option>Needs more evidence</option></select></label>
        <label className="compact-field"><span>NOTE</span><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Why this decision was made" /></label>
        <Button icon="save" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Record decision"}</Button>
        {error && <p className="input-hint error-text">{error}</p>}
        <div className="panel-head timeline-head"><div><span>TIMELINE</span></div></div>
        <ol className="timeline">{c.timeline.map((e, i) => <li key={i}><strong>{e.kind}</strong><span>{formatDate(e.at, true)}</span>{e.detail && <small>{e.detail}</small>}</li>)}</ol>
      </section>
    </div>
    {expert && person.data && <ExpertEvidence result={c.result} person={person.data} questioned={image.data} />}
  </div>;
}
