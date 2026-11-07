import { useEffect, useState, type ReactNode } from "react";
import Shell from "../components/Shell";
import type { NavItem } from "../components/NavList";
import { initialData, type SimData } from "./data";
import SupDashboard from "./screens/SupDashboard";
import SupClients from "./screens/SupClients";
import SupCases from "./screens/SupCases";
import SupBatch from "./screens/SupBatch";
import SupReports from "./screens/SupReports";
import SupSystem from "./screens/SupSystem";

/** Exactly 6 main items. Verify and Compare live inside Cases & Reviews; Help lives inside System & Help. */
const items: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "audit" },
  { key: "clients", label: "Clients & Enrollment", icon: "user" },
  { key: "cases", label: "Cases & Reviews", icon: "history" },
  { key: "batch", label: "Batch Check", icon: "compare" },
  { key: "reports", label: "Reports & Research", icon: "file" },
  { key: "system", label: "System & Help", icon: "settings" },
];

export type SupRoute = { section: string; tab?: string; id?: string };
export type SupGo = (r: SupRoute) => void;
export type SupProps = { data: SimData; setData: (d: SimData) => void; route: SupRoute; go: SupGo };

/** Simulated administrative showcase. It never calls the analysis service and never reads or changes real records. */
export default function SupervisorApp({ user, logout }: { user: string; logout: () => void }) {
  const [data, setData] = useState<SimData>(initialData);
  const [route, setRoute] = useState<SupRoute>({ section: "dashboard" });
  const go: SupGo = r => { setRoute(r); window.scrollTo(0, 0); };
  const current = items.find(i => i.key === route.section) ?? items[0];
  useEffect(() => { document.title = `4buwan | Supervisor · ${current.label}`; }, [current]);
  const props: SupProps = { data, setData, route, go };
  let page: ReactNode;
  switch (route.section) {
    case "clients": page = <SupClients {...props} />; break;
    case "cases": page = <SupCases {...props} />; break;
    case "batch": page = <SupBatch {...props} />; break;
    case "reports": page = <SupReports {...props} />; break;
    case "system": page = <SupSystem {...props} />; break;
    default: page = <SupDashboard {...props} />;
  }
  return <Shell demo="Supervisor demo" user={user} items={items} active={current.key} onNav={key => go({ section: key })} crumb={current.label}
    controls={<span className="sim-label" role="status">Supervisor Demo — Simulated Data</span>}
    strip={<div className="sample-strip sim-strip" role="note"><strong>Supervisor Demo — Simulated Data.</strong><span>Fictional clients, cases and figures for demonstration. Nothing here uses the real model or the real records, and changes are not saved.</span></div>}
    note={{ title: "Simulated workspace", text: "Fictional data only. Changes reset when you log out." }}
    footer="Supervisor Demo — every client, case, figure and action on these pages is simulated." logout={logout}>
    {page}
  </Shell>;
}
