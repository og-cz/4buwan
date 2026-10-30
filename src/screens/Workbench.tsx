import { listChecks } from "../api/client";
import Button from "../components/Button";
import DataTable from "../components/DataTable";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Tag from "../components/Tag";
import VerdictBadge from "../components/VerdictBadge";
import { ErrorState, SkeletonPanel } from "../components/States";
import { decisionTone, shortDate } from "../format";
import type { Go } from "../navigation";
import useAsync from "../state/useAsync";
import type { CheckSummary } from "../types";

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

function CaseList({ title, eyebrow, rows, empty, go, decision = true }: { title: string; eyebrow: string; rows: CheckSummary[]; empty: string; go: Go; decision?: boolean }) {
  return <section className="panel table-panel"><div className="panel-head"><div><span>{eyebrow}</span><h2>{title}</h2></div><Tag tone={rows.length ? "accent" : "neutral"}>{rows.length}</Tag></div>
    {rows.length === 0 ? <p className="input-hint panel-empty">{empty}</p> : <DataTable rows={rows.slice(0, 8)} rowKey={r => r.id} onOpen={r => go("CaseDetail", { caseId: r.id })} columns={[
      { header: "Time", cell: r => <span className="num">{shortDate(r.created)}</span> },
      { header: "Person", cell: r => r.name ?? "Deleted profile" },
      { header: "Verdict", cell: r => <VerdictBadge verdict={r.verdict} /> },
      ...(decision ? [{ header: "Decision", cell: (r: CheckSummary) => <Tag tone={decisionTone(r.decision)}>{r.decision}</Tag> }] : []),
    ]} />}
  </section>;
}

/** Examiner landing page: what was checked today, what is still open, and what needs a second look. */
export default function Workbench({ go }: { go: Go }) {
  const checks = useAsync(() => listChecks(), []);
  const rows = checks.data ?? [];
  const today = rows.filter(r => isToday(r.created));
  const open = rows.filter(r => r.decision === "Pending").sort((a, b) => a.created.localeCompare(b.created));
  const recheck = rows.filter(r => r.verdict === "UNCERTAIN" && r.decision !== "Accepted" && r.decision !== "Rejected");
  return <div className="page"><PageHeader title="Workbench" description="Today's checks, open cases and uncertain results to look at again." action={<div className="header-actions"><Button secondary icon="layers" onClick={() => go("Compare")}>Compare images</Button><Button icon="verify" onClick={() => go("Verify")}>Verify a signature</Button></div>} />
    <section className="panel workbench-hero"><span className="workbench-icon"><Icon name="verify" size={22} /></span><div><h2>Start a check</h2><p>Find the person, add the questioned signature and get an advisory Verdict with its evidence. Shortcuts in Verify: V run, 1–9 reference, O overlay.</p></div><Button icon="verify" onClick={() => go("Verify")}>Verify a signature</Button></section>
    {checks.loading ? <div className="workbench-grid"><SkeletonPanel /><SkeletonPanel /></div>
      : checks.error ? <ErrorState message={checks.error} retry={checks.reload} />
      : <div className="workbench-grid">
        <CaseList eyebrow="Today" title="Today's checks" rows={today} empty="No checks yet today." go={go} />
        <CaseList eyebrow="Open" title="Cases waiting for a decision" rows={open} empty="Every case has a recorded decision." go={go} decision={false} />
        <CaseList eyebrow="Re-check" title="Uncertain cases to look at again" rows={recheck} empty="No uncertain cases are waiting." go={go} />
      </div>}
  </div>;
}
