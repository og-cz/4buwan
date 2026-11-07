import { useEffect, useState } from "react";
import ServiceBanner from "./components/ServiceBanner";
import Login from "./screens/Login";
import ExaminerApp from "./ExaminerApp";
import SupervisorApp from "./supervisor/SupervisorApp";
import useHealth from "./state/useHealth";
import type { Preset } from "./navigation";

type Session = { user: string; preset: Preset };

/** Sign-in, then one of two separate demos: the Examiner (real system) or the Supervisor (simulated showcase). */
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  // The Supervisor demo makes no request to the analysis service, not even the health check.
  const health = useHealth(!session || session.preset === "Examiner");
  const banner = health.status === "down" ? <ServiceBanner /> : null;
  useEffect(() => { if (!session) document.title = "4buwan | Sign in"; }, [session]);

  if (!session) return <>{banner}<Login onDemo={preset => setSession({ user: `${preset} demo`, preset })} onSignIn={user => setSession({ user, preset: "Examiner" })} /></>;
  if (session.preset === "Supervisor") return <SupervisorApp user={session.user} logout={() => setSession(null)} />;
  return <ExaminerApp user={session.user} health={health} banner={banner} logout={() => setSession(null)} />;
}
