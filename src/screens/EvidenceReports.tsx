import { listReports } from "../api/client";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import Tag from "../components/Tag";
import VerdictBadge from "../components/VerdictBadge";
import { EmptyState, ErrorState, SkeletonPanel } from "../components/States";
import { decisionTone, formatDate } from "../format";
import type { Go } from "../navigation";
import useAsync from "../state/useAsync";

/** Every Evidence Report that was exported, newest first. Opening one re-renders it from the saved case. */
export default function EvidenceReports({ go }: { go: Go }) {
  const reports = useAsync(() => listReports(), []);
  const rows = reports.data ?? [];
  return <div className="page"><PageHeader title="Evidence Reports" description="Reports exported from cases. Open one to view or print it again; it is rebuilt from the saved case." />
    {reports.loading ? <SkeletonPanel />
      : reports.error ? <ErrorState message={reports.error} retry={reports.reload} />
      : rows.length === 0 ? <EmptyState icon="file" title="No reports exported yet" text="Open a case and choose Evidence Report, then Print, to export one." />
      : <section className="panel table-panel"><DataTable rows={rows} rowKey={r => `${r.case_id}-${r.at}`} onOpen={r => go("Evidence Report", { caseId: r.case_id })} columns={[
        { header: "Exported", cell: r => <span className="num">{formatDate(r.at, true)}</span> },
        { header: "Case", cell: r => <span className="num">{r.case_title || r.case_id}</span> },
        { header: "Person", cell: r => r.name ?? "Deleted profile" },
        { header: "Verdict", cell: r => <VerdictBadge verdict={r.verdict} /> },
        { header: "Decision", cell: r => <Tag tone={decisionTone(r.decision)}>{r.decision}</Tag> },
      ]} /></section>}
  </div>;
}
