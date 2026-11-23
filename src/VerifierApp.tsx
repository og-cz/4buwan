import { useCallback, useEffect, useState, type ReactNode } from "react";
import Shell from "./components/Shell";
import Toast from "./components/Toast";
import DemoBar from "./components/DemoBar";
import Verify from "./screens/Verify";
import Cases from "./screens/Cases";
import CaseDetail from "./screens/CaseDetail";
import EvidenceReport from "./screens/EvidenceReport";
import EvidenceReports from "./screens/EvidenceReports";
import ReferenceLibrary from "./screens/ReferenceLibrary";
import PersonProfile from "./screens/PersonProfile";
import Enrol from "./screens/Enrol";
import BatchCheck from "./screens/BatchCheck";
import Dashboard from "./screens/Dashboard";
import Reports from "./screens/Reports";
import ResearchLab from "./screens/research/ResearchLab";
import Settings from "./screens/Settings";
import Help from "./screens/Help";
import Compare from "./screens/Compare";
import type { HealthState } from "./state/useHealth";
import { moduleOf, pageTitle, verifierModules, type Go, type Route } from "./navigation";

type Props = { user: string; demo: boolean; health: HealthState; banner: ReactNode; logout: () => void };

/** The Verifier: the working system on the real records and the real model. Every page shows the full evidence. */
export default function VerifierApp({ user, demo, health, banner, logout }: Props) {
  const [route, setRoute] = useState<Route>({ screen: "Verify" });
  const [toast, setToast] = useState<string | null>(null);
  const go: Go = (screen, params) => { setRoute({ screen, ...params }); window.scrollTo(0, 0); };
  const notify = useCallback((m: string) => setToast(m), []);
  const closeToast = useCallback(() => setToast(null), []);
  useEffect(() => { document.title = pageTitle(route); }, [route]);

  const { screen, personId, caseId } = route;
  let page: ReactNode;
  switch (screen) {
    case "Dashboard": page = <Dashboard go={go} />; break;
    case "Reports": page = <Reports />; break;
    case "Verify": page = <Verify key={personId ?? "search"} personId={personId} go={go} />; break;
    case "Person Profile": page = <PersonProfile personId={personId} expert go={go} notify={notify} />; break;
    case "Reference Library": page = <ReferenceLibrary go={go} />; break;
    case "Compare": page = <Compare go={go} notify={notify} />; break;
    case "Enrol": page = <Enrol go={go} />; break;
    case "Cases": page = <Cases go={go} />; break;
    case "Review Queue": page = <Cases key="queue" queue go={go} />; break;
    case "CaseDetail": page = <CaseDetail caseId={caseId} expert go={go} notify={notify} />; break;
    case "Evidence Reports": page = <EvidenceReports go={go} />; break;
    case "Evidence Report": page = <EvidenceReport caseId={caseId} go={go} />; break;
    case "Batch Check": page = <BatchCheck go={go} />; break;
    case "Research Lab": page = <ResearchLab model={health.model} />; break;
    case "Settings": page = <Settings notify={notify} />; break;
    default: page = <Help />;
  }
  const current = moduleOf(screen);
  const items = verifierModules.map(m => ({ key: m.key, label: m.label, icon: m.icon, group: m.group, bottom: m.bottom }));
  return <Shell demo="Verifier" user={user} items={items} active={current.key} onNav={key => go(verifierModules.find(m => m.key === key)!.home)} crumb={current.label}
    strip={<DemoBar>{demo
      ? "This Verifier runs the real verification model. Nothing you do here is kept: every demo starts empty."
      : "This Verifier runs the real verification model on the real data stored on this computer. It is a demonstration build, not the full application."}</DemoBar>}
    note={demo ? { title: "Demo session", text: "Enrol, verify and decide freely. Nothing is kept after this session." }
      : { title: "Private office system", text: "Checks, decisions and notes are recorded in each case." }}
    footer={demo ? "Demo session: nothing is saved." : "Signatures are stored on this computer only."} logout={logout} banner={banner}>
    {page}<Toast message={toast} onClose={closeToast} />
  </Shell>;
}
