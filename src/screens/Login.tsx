import { useState } from "react";
import Button from "../components/Button";
import Icon from "../components/Icon";
import type { Preset } from "../navigation";

type Props = { onDemo: (preset: Preset) => void; onSignIn: (username: string) => void };

export default function Login({ onDemo, onSignIn }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return <div className="login-shell">
    <section className="login-brand"><img src="/assets/7e738.svg" alt="4buwan" /><div><span>SIGNATURE DESK</span><h1>Verifies a signature using only the person&apos;s own genuine samples.</h1><p>An examination workspace for clear decisions and inspectable evidence.</p></div><small>Signatures are stored on this computer only. Every check is logged.</small></section>
    <section className="login-panel">
      <div className="office-name">SIGNATURE DESK</div><h2>Sign in</h2><p>Use your workspace account to continue.</p>
      <label><span>USERNAME</span><input value={username} onChange={e => setUsername(e.target.value)} /></label>
      <label><span>PASSWORD</span><input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
      <Button icon="chevron" disabled={!username.trim()} onClick={() => onSignIn(username.trim())}>Sign in</Button>
      <div className="login-separator"><span>TRY A DEMO</span></div>
      <div className="demo-choice-grid">
        <button onClick={() => onDemo("Examiner")}><span><Icon name="verify" /></span><div><strong>Examiner demo</strong><small>Examine signatures and see the evidence</small></div><Icon name="chevron" size={14} /></button>
        <button onClick={() => onDemo("Supervisor")}><span><Icon name="audit" /></span><div><strong>Supervisor demo</strong><small>Oversee checks, decisions and model results</small></div><Icon name="chevron" size={14} /></button>
      </div>
      <div className="login-help"><Icon name="help" size={15} />Demo sign-in needs no password. Data stays on this computer.</div>
    </section>
  </div>;
}
