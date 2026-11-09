import { useEffect, useState } from "react";
import ServiceBanner from "./components/ServiceBanner";
import Login from "./screens/Login";
import VerifierApp from "./VerifierApp";
import DecoyApp from "./decoy/DecoyApp";
import useHealth from "./state/useHealth";
import { applyTheme, showLoginTheme } from "./state/theme";
import type { Role } from "./navigation";

type Session = { role: Role; user: string };

/** Staff sign-in, then the Verifier (the working system) or a Supervisor / Researcher demonstration. */
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  // Only the Verifier talks to the analysis service; the demonstrations make no request at all.
  const health = useHealth(!session || session.role === "Verifier");
  const banner = health.status === "down" ? <ServiceBanner /> : null;
  useEffect(() => {
    if (session) applyTheme();
    else { showLoginTheme(); document.title = "4buwan | Sign in"; }
  }, [session]);
  const logout = () => setSession(null);

  if (!session) return <>{banner}<Login onLogin={(role, user) => setSession({ role, user })} /></>;
  if (session.role !== "Verifier") return <DecoyApp role={session.role} user={session.user} logout={logout} />;
  return <VerifierApp user={session.user} health={health} banner={banner} logout={logout} />;
}
