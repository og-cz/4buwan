import { getStats, listChecks } from "../api/client";
import Button from "../components/Button";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import Tag from "../components/Tag";
import VerdictBadge from "../components/VerdictBadge";
import { EmptyState, ErrorState, Loading } from "../components/States";
import { decisionTone, formatDate, percent } from "../format";
import type { Go } from "../navigation";
import useAsync from "../state/useAsync";

export default function Dashboard({ go }: { go: Go }) {
  const stats = useAsync(() => getStats(), []);
  const checks = useAsync(() => listChecks(), []);
  const header = <PageHeader title="Dashboard" description="Verification activity and items waiting for a human decision." />;
  if (stats.loading) return <div className="page">{header}<Loading title="Loading activity" /></div>;
  if (stats.error || !stats.data) return <div className="page">{header}<ErrorState message={stats.error ?? "No data."} retry={stats.reload} /></div>;
  const s = stats.data;
  const waiting = (checks.data ?? []).filter(c => c.verdict === "UNCERTAIN" || c.decision === "Pending").length;
  const ready = s.persons.Ready ?? 0;
  if (s.checks === 0) return <div className="page">{header}<EmptyState title="No checks yet" text={`${ready} ready Signature Profile${ready === 1 ? "" : "s"}. Run a verification to see activity here.`} action={<Button icon="verify" onClick={() => go("Verify")}>Verify a signature</Button>} /></div>;
  const metrics: [string, string, string, "ready" | "warn" | "neutral"][] = [
    ["Ready profiles", String(ready), "READY", "ready"],
    ["Checks recorded", String(s.checks), "ALL TIME", "neutral"],
    ["Uncertain rate", percent(s.uncertain_rate), "OF CHECKS", "warn"],
    ["Waiting for decision", String(s.pending), "PENDING", s.pending ? "warn" : "ready"],
  ];
  return <div className="page">{header}
    <div className="application-metrics">{metrics.map(m => <section className="panel" key={m[0]}><span>{m[0]}</span><strong>{m[1]}</strong><Tag tone={m[3]}>{m[2]}</Tag></section>)}</div>
    <div className="application-dashboard-grid">
      <section className="panel"><div className="panel-head"><div><span>RECENT CHECKS</span><h2>Latest verifications</h2></div><Button secondary onClick={() => go("Cases")}>Open Cases</Button></div>
        <DataTable rows={(checks.data ?? []).slice(0, 6)} rowKey={r => r.id} onOpen={r => go("CaseDetail", { caseId: r.id })} columns={[
          { header: "TIME", cell: r => formatDate(r.created, true) }, { header: "PERSON", cell: r => r.name ?? "Deleted profile" },
          { header: "VERDICT", cell: r => <VerdictBadge verdict={r.verdict} /> }, { header: "DECISION", cell: r => <Tag tone={decisionTone(r.decision)}>{r.decision.toUpperCase()}</Tag> },
        ]} /></section>
      <section className="panel dashboard-review"><div className="panel-head"><div><span>REVIEW QUEUE</span><h2>{waiting} item{waiting === 1 ? "" : "s"} waiting</h2></div></div><p>Uncertain results and Checks without a recorded decision. Human agreement so far: {percent(s.human_agreement)} of {s.decided} decided Checks with a clear Verdict.</p><Button icon="review" onClick={() => go("Review Queue")}>Open Review Queue</Button></section>
    </div>
  </div>;
}
