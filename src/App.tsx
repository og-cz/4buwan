import { useCallback, useEffect, useState, type ReactNode } from "react";
import Shell from "./components/Shell";
import ServiceBanner from "./components/ServiceBanner";
import Toast from "./components/Toast";
import Login from "./screens/Login";
import Verify from "./screens/Verify";
import Cases from "./screens/Cases";
import CaseDetail from "./screens/CaseDetail";
import EvidenceReport from "./screens/EvidenceReport";
import ReferenceLibrary from "./screens/ReferenceLibrary";
import PersonProfile from "./screens/PersonProfile";
import Enrol from "./screens/Enrol";
import BatchCheck from "./screens/BatchCheck";
import Dashboard from "./screens/Dashboard";
import Reports from "./screens/Reports";
import ResearchLab from "./screens/research/ResearchLab";
import Settings from "./screens/Settings";
import Help from "./screens/Help";
import Workbench from "./screens/Workbench";
import Compare from "./screens/Compare";
import EvidenceReports from "./screens/EvidenceReports";
import useHealth from "./state/useHealth";
import { getSettings } from "./state/settings";
import { useDataMode } from "./state/dataMode";
import { pageTitle, presetScreens, type Go, type Preset, type Route } from "./navigation";

type Session = { user: string; preset: Preset };

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [route, setRoute] = useState<Route>({ screen: "Verify" });
  const [expert, setExpert] = useState(false);
  const [mode] = useDataMode();
  const [toast, setToast] = useState<string | null>(null);
  const health = useHealth();
  const banner = health.status === "down" ? <ServiceBanner /> : null;
  const go: Go = (screen, params) => { setRoute({ screen, ...params }); window.scrollTo(0, 0); };
  const notify = useCallback((m: string) => setToast(m), []);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => { document.title = pageTitle(session ? route : null); }, [session, route]);

  function start(user: string, preset: Preset) {
    setSession({ user, preset });
    setExpert(getSettings().defaultView === "Expert");
    setRoute({ screen: presetScreens[preset][0] });
  }

  if (!session) return <>{banner}<Login onDemo={preset => start(`${preset} demo`, preset)} onSignIn={user => start(user, "Examiner")} /></>;

  const { screen, personId, caseId } = route;
  let page: ReactNode;
  switch (screen) {
    case "Workbench": page = <Workbench go={go} />; break;
    case "Dashboard": page = <Dashboard go={go} />; break;
    case "Compare": page = <Compare go={go} notify={notify} />; break;
    case "Evidence Reports": page = <EvidenceReports go={go} />; break;
    case "Verify": page = <Verify key={personId ?? "search"} personId={personId} expert={expert} setExpert={setExpert} go={go} />; break;
    case "Person Profile": page = <PersonProfile personId={personId} expert={expert} go={go} notify={notify} />; break;
    case "Enrol": page = <Enrol go={go} />; break;
    case "Cases": page = <Cases go={go} />; break;
    case "Review Queue": page = <Cases key="queue" queue go={go} />; break;
    case "CaseDetail": page = <CaseDetail caseId={caseId} expert={expert} go={go} notify={notify} />; break;
    case "Evidence Report": page = <EvidenceReport caseId={caseId} go={go} />; break;
    case "Reference Library": page = <ReferenceLibrary go={go} />; break;
    case "Batch Check": page = <BatchCheck go={go} />; break;
    case "Reports": page = <Reports />; break;
    case "Research Lab": page = <ResearchLab model={health.model} />; break;
    case "Settings": page = <Settings notify={notify} />; break;
    default: page = <Help />;
  }
  // Switching Real / Sample data remounts the screen so it loads from the other data folder.
  return <Shell preset={session.preset} user={session.user} screen={screen} go={go} logout={() => setSession(null)} expert={expert} setExpert={setExpert} counts={health.counts} banner={banner}><div key={mode} className="mode-frame">{page}</div><Toast message={toast} onClose={closeToast} /></Shell>;
}
