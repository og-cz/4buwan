import { listChecks } from "../api/client";
import Button from "../components/Button";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Tag from "../components/Tag";
import VerdictBadge from "../components/VerdictBadge";
import { ErrorState, SkeletonPanel } from "../components/States";
import { decisionTone, shortDate } from "../format";
import type { Go, Screen } from "../navigation";
import useAsync from "../state/useAsync";
import type { CheckSummary } from "../types";

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

type ListProps = { title: string; eyebrow: string; rows: CheckSummary[]; empty: string; go: Go; more: Screen; decision?: boolean };

/** Compact case rows: time, person, verdict (and decision). Fits a narrow panel without sideways scrolling. */
function CaseList({ title, eyebrow, rows, empty, go, more, decision = true }: ListProps) {
  return <section className="panel workbench-list"><div className="panel-head"><div><span>{eyebrow}</span><h2>{title}</h2></div><Tag tone={rows.length ? "accent" : "neutral"}>{rows.length}</Tag></div>
    {rows.length === 0 ? <p className="input-hint">{empty}</p> : <ul className="case-rows">{rows.slice(0, 6).map(r => <li key={r.id}><button onClick={() => go("CaseDetail", { caseId: r.id })}>
      <span className="num case-time">{shortDate(r.created)}</span>
      <span className="case-person"><strong>{r.name ?? "Deleted profile"}</strong><small>{r.case_title || r.id}</small></span>
      <span className="case-tags"><VerdictBadge verdict={r.verdict} />{decision && r.decision !== "Pending" && <Tag tone={decisionTone(r.decision)}>{r.decision.toUpperCase()}</Tag>}</span>
      <Icon name="chevron" size={14} />
    </button></li>)}</ul>}
    {rows.length > 0 && <div className="list-foot"><button className="link-button" onClick={() => go(more)}>View all {rows.length}<Icon name="chevron" size={12} /></button></div>}
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
        <CaseList eyebrow="TODAY" title="Today's checks" rows={today} empty="No checks yet today." go={go} more="Cases" />
        <CaseList eyebrow="OPEN" title="Waiting for a decision" rows={open} empty="Every case has a recorded decision." go={go} more="Review Queue" decision={false} />
        <CaseList eyebrow="RE-CHECK" title="Uncertain, look again" rows={recheck} empty="No uncertain cases are waiting." go={go} more="Review Queue" decision={false} />
      </div>}
  </div>;
}
