import { useState } from "react";
import Button from "../components/Button";
import Icon from "../components/Icon";
import type { Role } from "../navigation";

type Props = { onLogin: (role: Role, user: string, demo: boolean) => void };

const demoNames: Record<Role, string> = { Verifier: "Demo Verifier", Supervisor: "Demo Supervisor", Researcher: "Demo Researcher" };

/** Staff sign-in from the 4buwan-ui design. Signing in opens the Verifier; the demo button opens any role without an account. */
export default function Login({ onLogin }: Props) {
  const [role, setRole] = useState<Role>("Verifier");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const user = username.trim();
  const ready = username.trim() !== "" && password !== "";
  return <div className="login-shell">
    <section className="login-brand"><img src="/assets/7e738.svg" alt="4buwan" /><div><span>SIGNATURE VERIFICATION</span><h1>Signature verification from genuine samples only.</h1><p>An examination workspace for clear decisions and inspectable evidence.</p></div><small>Signatures are stored on this computer only. Access is logged.</small></section>
    <section className="login-panel"><h2>Staff sign in</h2><p>Use your office account to continue.</p>
      <form onSubmit={e => { e.preventDefault(); if (ready) onLogin("Verifier", user, false); }}>
        <label><span>USERNAME</span><input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="Enter your username" /></label>
        <label><span>PASSWORD</span><input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" /></label>
        <button className="button" type="submit" disabled={!ready}><Icon name="chevron" size={15} />Sign in</button>
      </form>
      <div className="login-divider"><span>OR TRY THE DEMO</span></div>
      <label><span>DEMO ROLE</span><select value={role} onChange={e => setRole(e.target.value as Role)}><option>Verifier</option><option>Supervisor</option><option>Researcher</option></select></label>
      <Button secondary icon="chevron" onClick={() => onLogin(role, demoNames[role], true)}>Continue to demo</Button>
      <div className="login-help"><Icon name="help" size={15} />Contact your supervisor if you cannot sign in.</div>
    </section>
  </div>;
}
