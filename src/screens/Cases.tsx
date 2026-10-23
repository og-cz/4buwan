import { useState } from "react";
import { listChecks } from "../api/client";
import Button from "../components/Button";
import DataTable from "../components/DataTable";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Tag from "../components/Tag";
import VerdictBadge from "../components/VerdictBadge";
import { EmptyState, ErrorState, Loading } from "../components/States";
import { decisionTone, downloadCsv, formatDate } from "../format";
import type { Go } from "../navigation";
import useAsync from "../state/useAsync";
import { useTerms } from "../state/settings";
import type { CheckSummary, Decision, Verdict } from "../types";

const verdicts: Verdict[] = ["LIKELY GENUINE", "LIKELY FORGED", "UNCERTAIN"];
const decisions: Decision[] = ["Pending", "Accepted", "Rejected", "Needs more evidence"];

export default function Cases({ queue = false, go }: { queue?: boolean; go: Go }) {
  const t = useTerms();
  const checks = useAsync(() => listChecks(), []);
  const [verdict, setVerdict] = useState<Verdict | "">("");
  const [decision, setDecision] = useState<Decision | "">("");
  const [search, setSearch] = useState("");

  let rows: CheckSummary[] = checks.data ?? [];
  if (queue) rows = rows.filter(r => r.verdict === "UNCERTAIN" || r.decision === "Pending").sort((a, b) => a.created.localeCompare(b.created));
  rows = rows.filter(r => (!verdict || r.verdict === verdict) && (!decision || r.decision === decision)
    && `${r.name ?? ""} ${r.case_title} ${r.id}`.toLowerCase().includes(search.toLowerCase()));

  function exportCsv() {
    downloadCsv(queue ? "review-queue.csv" : "cases.csv", ["case_id", "created", "person", "case_title", "verdict", "confidence", "decision"],
      rows.map(r => [r.id, r.created, r.name ?? "", r.case_title, r.verdict, r.confidence, r.decision]));
  }

  return <div className="page"><PageHeader title={queue ? "Review Queue" : "Cases"} description={queue ? "Uncertain Checks and Checks still waiting for a recorded decision, oldest first." : "Saved Checks, evidence, final human decisions, notes, and action history."} action={<div className="header-actions">{queue && <Tag tone="warn">{rows.length} WAITING</Tag>}<Button secondary icon="save" disabled={!rows.length} onClick={exportCsv}>Export CSV</Button></div>} />
    <div className="filters">
      <label><span>VERDICT</span><select value={verdict} onChange={e => setVerdict(e.target.value as Verdict | "")}><option value="">All verdicts</option>{verdicts.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
      <label><span>DECISION</span><select value={decision} onChange={e => setDecision(e.target.value as Decision | "")}><option value="">All decisions</option>{decisions.map(d => <option key={d}>{d}</option>)}</select></label>
      <div><Icon name="search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${t.lower} or case`} /></div>
    </div>
    {checks.loading ? <Loading title="Loading Cases" />
      : checks.error ? <ErrorState message={checks.error} retry={checks.reload} />
      : rows.length === 0 ? <EmptyState title={queue ? "Nothing waiting for review" : "No checks yet"} text={queue ? "Uncertain Checks and Checks without a decision appear here." : "Every verification is saved here as a Case."} />
      : <section className="panel table-panel"><DataTable rows={rows} rowKey={r => r.id} onOpen={r => go("CaseDetail", { caseId: r.id })} columns={[
        { header: "DATE & TIME", cell: r => formatDate(r.created, true) },
        { header: t.person.toUpperCase(), cell: r => r.name ?? "Deleted profile" },
        { header: "CASE", cell: r => r.case_title || r.id },
        { header: "VERDICT", cell: r => <VerdictBadge verdict={r.verdict} /> },
        { header: "CONFIDENCE", cell: r => r.confidence },
        { header: "FINAL DECISION", cell: r => <Tag tone={decisionTone(r.decision)}>{r.decision.toUpperCase()}</Tag> },
      ]} /></section>}
  </div>;
}
