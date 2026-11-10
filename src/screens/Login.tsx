import { useState } from "react";
import Button from "../components/Button";
import Icon from "../components/Icon";
import type { Role } from "../navigation";

type Props = { onLogin: (role: Role, user: string) => void };

const names: Record<string, string> = { "a.lee": "Alex Lee", "m.reyes": "Maria Reyes", "s.tan": "Sam Tan" };

/** Staff sign-in, exactly as in the 4buwan-ui design, with the demo role chooser. */
export default function Login({ onLogin }: Props) {
  const [role, setRole] = useState<Role>("Verifier");
  const [username, setUsername] = useState("a.lee");
  const [password, setPassword] = useState("password");
  const user = names[username.trim()] ?? (username.trim() || "Staff");
  return <div className="login-shell">
    <section className="login-brand"><img src="/assets/7e738.svg" alt="4buwan" /><div><span>SIGNATURE VERIFICATION</span><h1>Signature verification from genuine samples only.</h1><p>An examination workspace for clear decisions and inspectable evidence.</p></div><small>Signatures are stored on this computer only. Access is logged.</small></section>
    <section className="login-panel"><div className="office-name">RIVERSIDE COMMUNITY COOPERATIVE</div><h2>Staff sign in</h2><p>Use your office account to continue.</p>
      <label><span>USERNAME</span><input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" /></label>
      <label><span>PASSWORD</span><input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>
      <label><span>DEMO ROLE</span><select value={role} onChange={e => setRole(e.target.value as Role)}><option>Verifier</option><option>Supervisor</option><option>Researcher</option></select></label>
      <Button icon="chevron" onClick={() => onLogin(role, user)}>Sign in</Button>
      <div className="login-help"><Icon name="help" size={15} />Contact your supervisor if you cannot sign in.</div>
    </section>
  </div>;
}
