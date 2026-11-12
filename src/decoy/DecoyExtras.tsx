import { useState } from "react";
import Button from "../components/Button";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Tag from "../components/Tag";

/** Demo: office dashboard with example figures. */
export function DecoyDashboard({ openReview, openHistory }: { openReview: () => void; openHistory: () => void }) {
  const metrics: [string, string, string, "ready" | "warn" | "neutral"][] = [["Enrolled clients", "164", "READY", "ready"], ["Checks this month", "428", "THIS MONTH", "neutral"], ["Waiting for review", "3", "REVIEW", "warn"], ["Staff accounts", "4", "3 ACTIVE", "neutral"]];
  const recent = [["14:32", "Client A", "Likely genuine"], ["11:08", "Client D", "Uncertain"], ["Yesterday", "Client B", "Likely forged"]];
  const bars = [38, 54, 43, 68, 61, 72, 47, 56, 81, 74, 63, 88, 71, 79];
  return <div className="page"><PageHeader title="Dashboard" description="Office activity and items that need attention." />
    <div className="application-metrics">{metrics.map(m => <section className="panel" key={m[0]}><span>{m[0]}</span><strong>{m[1]}</strong><Tag tone={m[3]}>{m[2]}</Tag></section>)}</div>
    <div className="application-dashboard-grid">
      <section className="panel report-chart"><div className="panel-head"><div><span>CHECKS PER DAY</span><h2>Last 14 days</h2></div><Button secondary onClick={openHistory}>Open history</Button></div><div className="report-bars">{bars.map((v, i) => <i key={i} style={{ height: `${v}%` }} />)}</div></section>
      <section className="panel dashboard-review"><div className="panel-head"><div><span>REVIEW QUEUE</span><h2>3 items waiting</h2></div></div><p>Uncertain results and checks sent by staff need a recorded decision.</p>
        <div className="decoy-recent">{recent.map(r => <div key={r[1]}><span>{r[0]}</span><strong>{r[1]}</strong><Tag tone={r[2].includes("genuine") ? "ready" : r[2] === "Uncertain" ? "warn" : "bad"}>{r[2].toUpperCase()}</Tag></div>)}</div>
        <Button icon="review" onClick={openReview}>Open review queue</Button></section>
    </div>
  </div>;
}

/** Demo: office settings. Nothing is saved. */
export function DecoySettings() {
  const [saved, setSaved] = useState(false);
  return <div className="page"><PageHeader title="Settings" description="Office name, checking behaviour and data retention." action={<Button icon="save" onClick={() => setSaved(true)}>{saved ? "Saved" : "Save settings"}</Button>} />
    <div className="settings-grid">
      <section className="panel"><div className="panel-head"><div><span>OFFICE</span><h2>Workspace identity</h2></div></div><div className="form-grid"><label><span>OFFICE NAME</span><input placeholder="Your office name" /></label><label><span>CALL PEOPLE</span><select><option>Client</option><option>Member</option><option>Person</option></select></label></div></section>
      <section className="panel"><div className="panel-head"><div><span>CHECKING</span><h2>Default behaviour</h2></div></div><div className="form-grid"><label><span>STRICTNESS</span><select><option>Standard</option><option>Lenient</option><option>Strict</option></select></label><label><span>UNCERTAIN ZONE</span><select><option>Standard</option><option>Narrow</option><option>Wide</option></select></label></div></section>
      <section className="panel"><div className="panel-head"><div><span>DATA</span><h2>Retention and backup</h2></div></div><div className="form-grid"><label><span>KEEP RECORDS FOR</span><select><option>7 years</option><option>5 years</option></select></label><label><span>BACKUP</span><select><option>Every night</option><option>Every week</option></select></label></div></section>
    </div>
  </div>;
}

/** Demo: help for staff. */
export function DecoyHelp() {
  const steps: [string, string, "enrol" | "verify" | "history" | "check", string][] = [["01", "Enrol", "enrol", "Collect 12 genuine signatures from the client."], ["02", "Verify", "verify", "Check a new signature against the client's profile."], ["03", "Review", "history", "Uncertain results go to a supervisor."], ["04", "Decide", "check", "A staff member makes the final decision."]];
  return <div className="page"><PageHeader title="Help" description="How Signature Verification works." />
    <div className="help-steps">{steps.map(x => <section className="panel" key={x[0]}><span>{x[0]}</span><Icon name={x[2]} size={22} /><h2>{x[1]}</h2><p>{x[3]}</p></section>)}</div>
    <section className="panel limitations"><Icon name="alert" /><div><h2>Good to know</h2><p>The result is advice, not proof. Ask for another signature when the result is uncertain or the scan is unclear.</p></div></section>
  </div>;
}
