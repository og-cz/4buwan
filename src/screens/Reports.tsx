import { useState } from "react";
import { getStats } from "../api/client";
import Button from "../components/Button";
import PageHeader from "../components/PageHeader";
import { EmptyState, ErrorState, Loading } from "../components/States";
import { downloadCsv, percent } from "../format";
import useAsync from "../state/useAsync";

const iso = (d: Date) => d.toISOString().slice(0, 10);

function days(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = new Date(`${from}T00:00:00Z`); iso(d) <= to && out.length < 400; d.setUTCDate(d.getUTCDate() + 1)) out.push(iso(d));
  return out;
}

export default function Reports() {
  const today = new Date();
  const [from, setFrom] = useState(iso(new Date(today.getTime() - 29 * 864e5)));
  const [to, setTo] = useState(iso(today));
  const stats = useAsync(() => getStats(from, to), [from, to]);
  const s = stats.data;
  const perDay = new Map((s?.per_day ?? []).map(d => [d.date, d.checks]));
  const range = days(from, to);
  const peak = Math.max(1, ...range.map(d => perDay.get(d) ?? 0));

  function exportReport() {
    if (!s) return;
    downloadCsv(`report-${from}-to-${to}.csv`, ["date", "checks"], range.map(d => [d, perDay.get(d) ?? 0]));
  }

  return <div className="page"><PageHeader title="Reports" description="Check volume, Verdict mix, uncertainty, human agreement, and average Confidence." action={<Button secondary icon="save" disabled={!s?.checks} onClick={exportReport}>Export report</Button>} />
    <div className="filters"><label><span>FROM</span><input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} /></label><label><span>TO</span><input type="date" value={to} min={from} onChange={e => setTo(e.target.value)} /></label></div>
    {stats.loading ? <Loading title="Loading report" />
      : stats.error || !s ? <ErrorState message={stats.error ?? "No data."} retry={stats.reload} />
      : s.checks === 0 ? <EmptyState title="No checks yet" text="No checks were recorded in this period." />
      : <>
        <div className="report-metrics">
          <section className="panel"><span>Checks</span><strong>{s.checks}</strong><small>{s.verdicts["LIKELY GENUINE"]} genuine · {s.verdicts["LIKELY FORGED"]} forged · {s.verdicts.UNCERTAIN} uncertain</small></section>
          <section className="panel"><span>Uncertain rate</span><strong>{percent(s.uncertain_rate)}</strong><small>Share of Checks in the Uncertain Zone</small></section>
          <section className="panel"><span>Human agreement</span><strong>{percent(s.human_agreement)}</strong><small>{s.decided} decided Checks with a clear Verdict</small></section>
          <section className="panel"><span>Average Confidence</span><strong>{s.average_confidence === null ? "—" : `${Math.round(s.average_confidence)} / 100`}</strong><small>{s.pending} waiting for a decision</small></section>
        </div>
        <section className="panel report-chart"><div className="panel-head"><div><span>CHECKS PER DAY</span><h2>{from} to {to}</h2></div></div><div className="report-bars">{range.map(d => <i key={d} title={`${d}: ${perDay.get(d) ?? 0}`} style={{ height: `${(perDay.get(d) ?? 0) / peak * 100}%`, minHeight: perDay.get(d) ? 8 : 1 }} />)}</div></section>
      </>}
  </div>;
}
