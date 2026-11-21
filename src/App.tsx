import { useEffect, useState } from "react";
import { startDemo } from "./api/client";
import ServiceBanner from "./components/ServiceBanner";
import { SkeletonPanel } from "./components/States";
import Login from "./screens/Login";
import VerifierApp from "./VerifierApp";
import DecoyApp from "./decoy/DecoyApp";
import { setDataMode } from "./state/dataMode";
import useHealth from "./state/useHealth";
import { applyTheme, showLoginTheme } from "./state/theme";
import type { Role } from "./navigation";

/** demo: entered with Continue to demo. A Verifier demo starts empty and nothing done in it is kept. */
type Session = { role: Role; user: string; demo: boolean };

/** Staff sign-in, then the Verifier (the working system) or a Supervisor / Researcher demonstration. */
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [demoReady, setDemoReady] = useState(false);
  // Only the Verifier talks to the analysis service; the demonstrations make no request at all.
  const health = useHealth(!session || session.role === "Verifier");
  const banner = health.status === "down" ? <ServiceBanner /> : null;
  const verifierDemo = !!session && session.role === "Verifier" && session.demo;
  useEffect(() => {
    if (session) applyTheme();
    else { showLoginTheme(); document.title = "4buwan | Sign in"; }
  }, [session]);
  useEffect(() => {
    if (!verifierDemo) return;
    let alive = true;
    // Empty the demo first, then switch to it. If the service is down, the service banner explains why.
    startDemo().catch(() => undefined).finally(() => { setDataMode("demo"); if (alive) setDemoReady(true); });
    return () => { alive = false; };
  }, [verifierDemo]);
  const logout = () => { setDataMode("real"); setDemoReady(false); setSession(null); };

  if (!session) return <>{banner}<Login onLogin={(role, user, demo) => setSession({ role, user, demo })} /></>;
  if (session.role !== "Verifier") return <DecoyApp role={session.role} user={session.user} logout={logout} />;
  if (verifierDemo && !demoReady) return <div className="page demo-loading"><SkeletonPanel /></div>;
  return <VerifierApp user={session.user} demo={session.demo} health={health} banner={banner} logout={logout} />;
}
