import { useCallback, useEffect, useState, type ReactNode } from "react";
import Shell from "./components/Shell";
import ModuleTabs from "./components/ModuleTabs";
import Toast from "./components/Toast";
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
import { getSettings } from "./state/settings";
import { setDataMode } from "./state/dataMode";
import type { HealthState } from "./state/useHealth";
import { examinerSections, pageTitle, sectionOf, type Go, type Route } from "./navigation";

type Props = { user: string; health: HealthState; banner: ReactNode; logout: () => void };

function ViewSwitch({ expert, setExpert }: { expert: boolean; setExpert: (v: boolean) => void }) {
  return <div className="view-switch" role="group" aria-label="View"><button className={!expert ? "active" : ""} aria-pressed={!expert} onClick={() => setExpert(false)}>Simple view</button><button className={expert ? "active" : ""} aria-pressed={expert} onClick={() => setExpert(true)}>Expert view</button></div>;
}

/** The working signature-verification system: real records, the real model, 8 main sections. */
export default function ExaminerApp({ user, health, banner, logout }: Props) {
  const [route, setRoute] = useState<Route>({ screen: "Workbench" });
  const [expert, setExpert] = useState(() => getSettings().defaultView === "Expert");
  const [toast, setToast] = useState<string | null>(null);
  const go: Go = (screen, params) => { setRoute({ screen, ...params }); window.scrollTo(0, 0); };
  const notify = useCallback((m: string) => setToast(m), []);
  const closeToast = useCallback(() => setToast(null), []);
  useEffect(() => { setDataMode("real"); }, []);
  useEffect(() => { document.title = pageTitle(route); }, [route]);

  const { screen, personId, caseId } = route;
  const section = sectionOf(screen);
  let page: ReactNode;
  switch (screen) {
    case "Workbench": page = <Workbench go={go} />; break;
    case "Dashboard": page = <Dashboard go={go} />; break;
    case "Reports": page = <Reports />; break;
    case "Settings": page = <Settings notify={notify} />; break;
    case "Cases": page = <Cases go={go} />; break;
    case "Review Queue": page = <Cases key="queue" queue go={go} />; break;
    case "CaseDetail": page = <CaseDetail caseId={caseId} expert={expert} go={go} notify={notify} />; break;
    case "Verify": page = <Verify key={personId ?? "search"} personId={personId} expert={expert} setExpert={setExpert} go={go} />; break;
    case "Compare": page = <Compare go={go} notify={notify} />; break;
    case "Reference Library": page = <ReferenceLibrary go={go} />; break;
    case "Person Profile": page = <PersonProfile personId={personId} expert={expert} go={go} notify={notify} />; break;
    case "Enrol": page = <Enrol go={go} />; break;
    case "Batch Check": page = <BatchCheck go={go} />; break;
    case "Evidence Reports": page = <EvidenceReports go={go} />; break;
    case "Evidence Report": page = <EvidenceReport caseId={caseId} go={go} />; break;
    case "Research Lab": page = <ResearchLab model={health.model} />; break;
    default: page = <Help />;
  }
  const items = examinerSections.map(s => ({ key: s.key, label: s.label, icon: s.icon, bottom: s.bottom }));
  const crumb = section.tabs && section.screens.includes(screen) && screen !== section.home && section.tabs.some(([s]) => s === screen)
    ? `${section.label} / ${section.tabs.find(([s]) => s === screen)?.[1]}` : section.label;
  return <Shell demo="Examiner demo" user={user} items={items} active={section.key} onNav={key => go(examinerSections.find(s => s.key === key)!.home)} crumb={crumb}
    controls={<ViewSwitch expert={expert} setExpert={setExpert} />} note={{ title: "Private office system", text: "Checks, decisions and notes are recorded in each case timeline." }}
    footer="Signatures are stored on this computer only. Every check is recorded in its case." logout={logout} banner={banner}>
    <ModuleTabs section={section} screen={screen} go={go} />{page}<Toast message={toast} onClose={closeToast} />
  </Shell>;
}
