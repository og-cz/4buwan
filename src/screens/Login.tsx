import { useState, type KeyboardEvent } from "react";
import { getHealth } from "../api/client";
import Brand from "../components/Brand";
import Icon, { type IconName } from "../components/Icon";
import type { Preset } from "../navigation";

type Props = { onDemo: (preset: Preset) => void; onSignIn: (username: string) => void };

const steps: [IconName, string][] = [["enrol", "Enrol 12 genuine"], ["user", "Learn the person's variation"], ["verify", "Verify and decide"]];
const demos: { preset: Preset; icon: IconName; title: string; text: string; shows: string[] }[] = [
  { preset: "Examiner", icon: "verify", title: "Examiner demo", text: "Examine signatures and see the evidence behind every Verdict.", shows: ["Workbench with today's checks", "Verify and manual Compare", "Cases and Evidence Reports"] },
  { preset: "Supervisor", icon: "audit", title: "Supervisor demo", text: "Oversee checks, decisions and model results across the office.", shows: ["Dashboard and Review Queue", "Reports over time", "Research Lab and Settings"] },
];

export default function Login({ onDemo, onSignIn }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [busy, setBusy] = useState(false);
  const ready = !!username.trim() && !busy;

  async function signIn() {
    if (!ready) return;
    setBusy(true);
    await getHealth().catch(() => null);   // warms the service; sign-in itself is a local stub for now
    onSignIn(username.trim());
  }
  const capsCheck = (e: KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState("CapsLock"));

  return <div className="login-shell">
    <section className="login-brand">
      <Brand size={56} />
      <div className="login-copy">
        <span>Signature Desk</span>
        <h1>Verifies a signature using only the person&apos;s own genuine samples.</h1>
        <p>An examination workspace for clear decisions and inspectable evidence.</p>
        <ol className="login-steps">{steps.map(([icon, label], i) => <li key={label}><span><Icon name={icon} size={18} /></span><small className="num">0{i + 1}</small><strong>{label}</strong></li>)}</ol>
      </div>
      <small>Signatures are stored on this computer only. Every check is logged.</small>
    </section>
    <section className="login-side">
      <form className="login-panel" onSubmit={e => { e.preventDefault(); void signIn(); }}>
        <h2>Sign in</h2><p>Use your workspace account to continue.</p>
        <label className="field"><span>Username</span><input autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} /></label>
        <label className="field"><span>Password</span>
          <div className="password-field"><input type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} onKeyUp={capsCheck} onKeyDown={capsCheck} onBlur={() => setCaps(false)} /><button type="button" className="icon-button" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} onClick={() => setShow(!show)}><Icon name={show ? "eyeOff" : "eye"} size={18} /></button></div>
          {caps && <small className="caps-warning" role="status"><Icon name="alert" size={14} /> Caps Lock is on</small>}
        </label>
        <button type="submit" className={`button login-submit ${busy ? "busy" : ""}`} disabled={!ready} aria-busy={busy}>{busy ? "Signing in" : <>Sign in <Icon name="chevron" size={18} /></>}</button>
        <div className="login-separator"><span>or try a demo</span></div>
        <div className="demo-choice-grid">{demos.map(d => <button type="button" key={d.preset} onClick={() => onDemo(d.preset)}>
          <span><Icon name={d.icon} /></span>
          <div><strong>{d.title}</strong><small>{d.text}</small><ul>{d.shows.map(s => <li key={s}><Icon name="check" size={14} />{s}</li>)}</ul></div>
          <Icon name="chevron" size={16} />
        </button>)}</div>
      </form>
      <p className="login-help"><Icon name="help" size={16} />Demo sign-in needs no password. Both presets use data stored on this computer.</p>
    </section>
  </div>;
}
