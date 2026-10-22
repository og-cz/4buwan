import { useState, type ReactNode } from "react";
import Shell from "./components/Shell";
import PageHeader from "./components/PageHeader";
import Login from "./screens/Login";
import Verify from "./screens/Verify";
import Cases from "./screens/Cases";
import ReferenceLibrary from "./screens/ReferenceLibrary";
import PersonProfile from "./screens/PersonProfile";
import Enrol from "./screens/Enrol";
import BatchCheck from "./screens/BatchCheck";
import Dashboard from "./screens/Dashboard";
import Reports from "./screens/Reports";
import ResearchLab from "./screens/research/ResearchLab";
import Settings from "./screens/Settings";
import Help from "./screens/Help";
import { presetScreens, type Go, type Preset, type Route } from "./navigation";

type Session = { user: string; preset: Preset };

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [route, setRoute] = useState<Route>({ screen: "Verify" });
  const [expert, setExpert] = useState(false);
  const go: Go = (screen, params) => { setRoute({ screen, ...params }); window.scrollTo(0, 0); };

  function start(user: string, preset: Preset) {
    setSession({ user, preset });
    setExpert(preset === "Supervisor");
    setRoute({ screen: presetScreens[preset][0] });
  }

  if (!session) return <Login onDemo={preset => start(`${preset} demo`, preset)} onSignIn={user => start(user, "Examiner")} />;

  let page: ReactNode;
  switch (route.screen) {
    case "Dashboard": page = <Dashboard openReview={() => go("Review Queue")} openHistory={() => go("Cases")} />; break;
    case "Verify": page = <Verify expert={expert} onProfile={() => go("Person Profile")} onEnrol={() => go("Enrol")} />; break;
    case "Person Profile": page = <PersonProfile expert={expert} verify={() => go("Verify")} reenrol={() => go("Enrol")} />; break;
    case "Enrol": page = <Enrol />; break;
    case "Cases": page = <Cases />; break;
    case "Review Queue": page = <Cases queue />; break;
    case "Reference Library": page = <ReferenceLibrary openProfile={() => go("Person Profile")} enrol={() => go("Enrol")} />; break;
    case "Batch Check": page = <BatchCheck />; break;
    case "Reports": page = <Reports />; break;
    case "Research Lab": page = <ResearchLab />; break;
    case "Settings": page = <Settings />; break;
    case "CaseDetail": case "Evidence Report": page = <div className="page"><PageHeader title="Case" description="No checks yet." /></div>; break;
    default: page = <Help />;
  }
  return <Shell preset={session.preset} user={session.user} expert={expert} setExpert={setExpert} screen={route.screen} go={go} logout={() => setSession(null)}>{page}</Shell>;
}
