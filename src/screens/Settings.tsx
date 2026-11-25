import { useState } from "react";
import Button from "../components/Button";
import { DemoBarSwitch, DemoNotice } from "../components/DemoBar";
import { useDataMode } from "../state/dataMode";
import PageHeader from "../components/PageHeader";
import { saveSettings, strictnessHelp, uncertainHelp, useSettings, type Settings as S, type Term } from "../state/settings";
import type { Strictness, UncertainZone } from "../types";

const terms: Term[] = ["Person", "Client", "Member", "Student", "Employee", "Custom"];

export default function Settings({ notify }: { notify: (m: string) => void }) {
  const saved = useSettings();
  const [mode] = useDataMode();
  const [s, setS] = useState<S>(saved);
  const set = <K extends keyof S>(k: K, v: S[K]) => setS(cur => ({ ...cur, [k]: v }));
  function logo(file: File) {
    const r = new FileReader();
    r.onload = () => typeof r.result === "string" && set("orgLogo", r.result);
    r.readAsDataURL(file);
  }
  return <div className="page"><PageHeader title="Settings" description={mode === "demo" ? "Organisation, terminology and decision behaviour for this demo session. Demo settings are kept apart from the real workspace." : "Organisation, terminology and decision behaviour for Real data. Settings are kept on this computer."} action={<Button icon="save" onClick={() => { saveSettings(s); notify("Settings saved."); }}>Save Settings</Button>} />
    <div className="settings-grid">
      <section className="panel"><div className="panel-head"><div><span>ORGANISATION</span><h2>Workspace identity</h2></div></div>
        <label className="compact-field"><span>ORGANISATION NAME</span><input value={s.orgName} onChange={e => set("orgName", e.target.value)} placeholder="Shown on Evidence Reports" /></label>
        <label className="compact-field"><span>LOGO</span><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) logo(f); }} /></label>
        {s.orgLogo && <div className="settings-logo"><img src={s.orgLogo} alt="Organisation logo" /><Button secondary onClick={() => set("orgLogo", "")}>Remove logo</Button></div>}
        <label className="compact-field"><span>CALL PEOPLE</span><select value={s.term} onChange={e => set("term", e.target.value as Term)}>{terms.map(t => <option key={t}>{t}</option>)}</select></label>
        {s.term === "Custom" && <label className="compact-field"><span>CUSTOM WORD</span><input value={s.customTerm} onChange={e => set("customTerm", e.target.value)} placeholder="e.g. Account holder" /></label>}
        <label className="compact-field"><span>ID LABEL</span><input value={s.idLabel} onChange={e => set("idLabel", e.target.value)} /></label>
      </section>
      <section className="panel"><div className="panel-head"><div><span>DECISIONS</span><h2>Default checking behaviour</h2></div></div>
        <label className="compact-field"><span>STRICTNESS</span><select value={s.strictness} onChange={e => set("strictness", e.target.value as Strictness)}>{(Object.keys(strictnessHelp) as Strictness[]).map(k => <option key={k} value={k}>{k} — {strictnessHelp[k]}</option>)}</select></label>
        <label className="compact-field"><span>UNCERTAIN ZONE</span><select value={s.uncertain} onChange={e => set("uncertain", e.target.value as UncertainZone)}>{(Object.keys(uncertainHelp) as UncertainZone[]).map(k => <option key={k} value={k}>{k} — {uncertainHelp[k]}</option>)}</select></label>
        <p className="input-hint">The decision rule is provisional and was chosen on development writers. These settings move it; they do not retrain the model.</p>
      </section>
      <section className="panel"><div className="panel-head"><div><span>DATA & PRIVACY</span><h2>Retention and backup</h2></div></div>
        <label className="compact-field"><span>RETENTION PERIOD · COMING SOON</span><select disabled><option>Until manually deleted</option></select></label>
        <div className="settings-actions"><Button secondary disabled title="Coming soon">Back up data</Button><Button secondary disabled title="Coming soon">Restore backup</Button></div>
      </section>
      <section className="panel"><div className="panel-head"><div><span>DEMONSTRATION</span><h2>Demo bar</h2></div></div>
        <DemoBarSwitch />
        <p className="input-hint">The bar says which role you are in and whether it uses the real model and data. It applies at once to every role.</p>
      </section>
    </div>
    <DemoNotice /></div>;
}
