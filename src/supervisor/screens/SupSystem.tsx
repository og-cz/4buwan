import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import type { SupProps } from "../SupervisorApp";
import SupTabs, { simTag } from "../SupTabs";

const ROLES: [string, string, string, string][] = [
  ["Examiner", "Verify, compare and record decisions", "Enrol clients", "View reports"],
  ["Supervisor", "Review the queue and override decisions", "Manage clients", "Export reports and view research"],
  ["Auditor", "Read cases and decisions", "—", "View reports"],
];

/** Demonstration settings, an illustrative role overview, and help for the Supervisor demo. */
export default function SupSystem({ route, go }: SupProps) {
  const tab = route.tab ?? "settings";
  const [strict, setStrict] = useState("Standard"), [zone, setZone] = useState("Standard"), [office, setOffice] = useState("Riverside Branch (fictional)");
  return <div className="page"><PageHeader title="System & Help" description="Demonstration settings, an overview of roles and permissions, and help for this demo." action={simTag()} />
    <SupTabs route={route} go={go} label="System & Help" tabs={[["settings", "Demo settings"], ["roles", "Roles & permissions"], ["help", "Help"]]} />
    {tab === "settings" && <section className="panel"><div className="panel-head"><div><span>DEMO SETTINGS</span><h2>Changes stay in this demo only</h2></div></div>
      <div className="form-grid"><label className="field"><span>Office name</span><input value={office} onChange={e => setOffice(e.target.value)} /></label>
        <label className="field"><span>Strictness</span><select value={strict} onChange={e => setStrict(e.target.value)}><option>Lenient</option><option>Standard</option><option>Strict</option></select></label>
        <label className="field"><span>Uncertain zone</span><select value={zone} onChange={e => setZone(e.target.value)}><option>Narrow</option><option>Standard</option><option>Wide</option></select></label></div>
      <p className="input-hint">These controls show where an administrator would set office-wide behaviour. In this demo they do not change any result and are not saved. The working settings are in the Examiner demo under Workbench → Settings.</p></section>}
    {tab === "roles" && <section className="panel table-panel"><div className="panel-head"><div><span>ROLES & PERMISSIONS</span><h2>Illustrative overview</h2></div></div>
      <div className="table-scroll"><table><thead><tr><th>Role</th><th>Cases</th><th>Clients</th><th>Reports</th></tr></thead><tbody>{ROLES.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table></div>
      <p className="input-hint panel-empty">This is a design overview only. The application has no user accounts or permission checks yet; both demos can be opened by anyone on this computer.</p></section>}
    {tab === "help" && <section className="panel model-card"><h2>About the Supervisor demo</h2><dl>
      <div><dt>What it is</dt><dd>An administrative showcase with fictional clients, cases and figures. It shows how an office could oversee enrollment, reviews, batches and reports.</dd></div>
      <div><dt>What it is not</dt><dd>It is not the verification system. It never runs the model and never reads or changes real records. Use the Examiner demo for real examinations.</dd></div>
      <div><dt>Model vs human</dt><dd>“Model classification” is the advisory result (likely genuine, likely forged, uncertain). “Human decision” is what a reviewer recorded (accepted, rejected, needs more evidence, or pending).</dd></div>
      <div><dt>Changes</dt><dd>Decisions, new clients and batch progress you make here are kept in memory and reset when you log out.</dd></div>
    </dl></section>}
  </div>;
}
