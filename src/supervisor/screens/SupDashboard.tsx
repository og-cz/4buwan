import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import Tag from "../../components/Tag";
import VerdictBadge from "../../components/VerdictBadge";
import { decisionTone } from "../../format";
import { clientName, pct, stats } from "../data";
import type { SupProps } from "../SupervisorApp";
import { simTag } from "../SupTabs";

/** Overview of the fictional office: enrollment, activity, sample cases and review figures, all computed from the simulated records. */
export default function SupDashboard({ data, go }: SupProps) {
  const s = stats(data);
  const peak = Math.max(1, ...s.perDay.map(([, n]) => n));
  const recent = [...data.cases].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 6);
  const metrics: [string, string, string][] = [
    ["Enrolled clients", String(s.ready), `${s.incomplete} still collecting samples`],
    ["Cases", String(s.cases), `${s.perDay.length} days of activity`],
    ["Review queue", String(s.reviewQueue), "Pending or needs more evidence"],
    ["Model said Uncertain", pct(s.uncertainRate), `${s.verdicts.UNCERTAIN} of ${s.cases} cases`],
  ];
  return <div className="page"><PageHeader title="Dashboard" description="Office overview for the supervisor. Every figure is computed from the simulated records shown on the other pages." action={simTag()} />
    <div className="application-metrics">{metrics.map(([label, value, note]) => <section className="panel" key={label}><span>{label}</span><strong>{value}</strong><small className="metric-note">{note}</small></section>)}</div>
    <div className="application-dashboard-grid">
      <section className="panel report-chart"><div className="panel-head"><div><span>ACTIVITY</span><h2>Cases per day</h2></div></div>
        <div className="report-bars">{s.perDay.map(([d, n]) => <i key={d} title={`${d}: ${n} cases`} style={{ height: `${n / peak * 100}%` }} />)}</div>
        <p className="chart-note">{s.perDay[0]?.[0]} to {s.perDay.at(-1)?.[0]} · simulated</p></section>
      <section className="panel dashboard-review"><div className="panel-head"><div><span>REVIEW FIGURES</span><h2>Model classification vs human decision</h2></div></div>
        <dl className="sim-facts">
          <div><dt>Model: likely genuine</dt><dd>{s.verdicts["LIKELY GENUINE"]}</dd></div>
          <div><dt>Model: likely forged</dt><dd>{s.verdicts["LIKELY FORGED"]}</dd></div>
          <div><dt>Model: uncertain</dt><dd>{s.verdicts.UNCERTAIN}</dd></div>
          <div><dt>Human: accepted</dt><dd>{s.decisions.Accepted}</dd></div>
          <div><dt>Human: rejected</dt><dd>{s.decisions.Rejected}</dd></div>
          <div><dt>Human: needs more evidence</dt><dd>{s.decisions["Needs more evidence"]}</dd></div>
          <div><dt>Not yet decided</dt><dd>{s.decisions.Pending}</dd></div>
          <div><dt>Human agreed with a clear model result</dt><dd>{pct(s.agreement)} of {s.agreementBase}</dd></div>
        </dl>
        <Button icon="review" onClick={() => go({ section: "cases", tab: "review" })}>Open review queue ({s.reviewQueue})</Button></section>
    </div>
    <section className="panel table-panel"><div className="panel-head"><div><span>RECENT ACTIVITY</span><h2>Latest sample cases</h2></div><Button secondary onClick={() => go({ section: "cases" })}>All cases</Button></div>
      <div className="table-scroll"><table><thead><tr><th>Case</th><th>Date</th><th>Client</th><th>Model classification</th><th>Human decision</th><th /></tr></thead>
        <tbody>{recent.map(c => <tr key={c.id} className="clickable-row" onClick={() => go({ section: "cases", tab: "cases", id: c.id })}><td className="num">{c.id}</td><td className="num">{c.date}</td><td>{clientName(data, c.clientId)}</td><td><VerdictBadge verdict={c.verdict} /></td><td><Tag tone={decisionTone(c.decision)}>{c.decision}</Tag></td><td>›</td></tr>)}</tbody></table></div>
    </section>
  </div>;
}
