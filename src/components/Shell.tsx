import { useState, type ReactNode } from "react";
import Icon from "./Icon";
import NavList from "./NavList";
import { useSettings } from "../state/settings";
import { useTheme } from "../state/theme";
import { useDataMode, type DataMode } from "../state/dataMode";
import { type Go, type Preset, type Screen } from "../navigation";

type Counts = { persons: number; checks: number } | null;
type Props = {
  preset: Preset; user: string; screen: Screen; go: Go; logout: () => void;
  expert: boolean; setExpert: (v: boolean) => void; counts: Counts; banner?: ReactNode; children: ReactNode;
};

const crumb: Partial<Record<Screen, string>> = { CaseDetail: "Case", "Person Profile": "Profile" };
const hint: Record<DataMode, string> = {
  real: "Your own enrolled people and checks.",
  sample: "Example data from the research datasets, to show how real use looks.",
};

/** Simple | Expert, and under it Real data | Sample data with a one-line hint. */
function Switches({ expert, setExpert, counts }: { expert: boolean; setExpert: (v: boolean) => void; counts: Counts }) {
  const [mode, setMode] = useDataMode();
  const count = counts ? ` · ${counts.persons} ${counts.persons === 1 ? "person" : "people"}` : "";
  return <div className="switch-stack">
    <div className="view-switch" role="group" aria-label="View"><button className={!expert ? "active" : ""} aria-pressed={!expert} onClick={() => setExpert(false)}>Simple view</button><button className={expert ? "active" : ""} aria-pressed={expert} onClick={() => setExpert(true)}>Expert view</button></div>
    <div className="view-switch data-switch" role="group" aria-label="Data"><button className={mode === "real" ? "active" : ""} aria-pressed={mode === "real"} onClick={() => setMode("real")}>Real data</button><button className={mode === "sample" ? "active sample" : ""} aria-pressed={mode === "sample"} onClick={() => setMode("sample")}>Sample data</button></div>
    <small>{mode === "sample" ? "Sample data" : "Real data"}{count}. {hint[mode]}</small>
  </div>;
}

/** Signature Desk shell from the original Figma Make design: dark sidebar with the MODULES list, top bar, content. */
export default function Shell({ preset, user, screen, go, logout, expert, setExpert, counts, banner, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const settings = useSettings();
  const [theme, setTheme] = useTheme();
  const [mode, setMode] = useDataMode();
  const light = theme === "light";
  const initials = user.split(/\s+/).map(n => n[0] ?? "").join("").slice(0, 2).toUpperCase();
  const office = settings.orgName ? settings.orgName.toUpperCase() : "SIGNATURE DESK";
  const toggleMenu = () => window.matchMedia("(max-width: 1199px)").matches ? setDrawerOpen(!drawerOpen) : setCollapsed(!collapsed);
  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${drawerOpen ? "drawer-open" : ""}`}>
      <div className="brand"><img src={settings.orgLogo || "/assets/7e738.svg"} alt={settings.orgName || "4buwan"} /><button className="brand-toggle" onClick={toggleMenu} aria-label={collapsed ? "Expand menu" : "Collapse menu"} title={collapsed ? "Expand menu" : "Collapse menu"}><Icon name="menu" size={18} /></button></div>
      <div className="office"><span>{office}</span><strong>{preset} demo</strong></div>
      <NavList preset={preset} screen={screen} go={go} onNavigate={() => setDrawerOpen(false)} />
      <div className="drawer-controls"><span>VIEW AND DATA</span><Switches expert={expert} setExpert={setExpert} counts={counts} /></div>
      <div className="privacy-side"><Icon name="audit" size={15} /><p><strong>Private office system</strong>Access and changes are logged.</p></div>
    </aside>
    {drawerOpen && <button className="drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-label="Close menu" />}
    <main className={`main ${light ? "light-theme" : ""}`}>
      <header className="topbar"><div><button className="mobile-menu" onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Icon name="menu" size={18} /></button><span>Signature Desk</span><b>/</b><strong>{crumb[screen] ?? screen}</strong></div>
        <div className="top-tools"><div className="top-switches"><Switches expert={expert} setExpert={setExpert} counts={counts} /></div>
          <button className="top-search" onClick={() => setTheme(light ? "dark" : "light")} title={light ? "Dark theme" : "Light theme"} aria-label={light ? "Dark theme" : "Light theme"}><Icon name={light ? "moon" : "sun"} size={15} /></button>
          <div className="staff-menu"><span aria-hidden="true">{initials || "SD"}</span><div><strong>{user}</strong><small>Signed in</small></div><button onClick={logout} title="Log out" aria-label="Log out"><Icon name="logout" size={16} /></button></div></div>
      </header>
      {mode === "sample" && <div className="sample-strip" role="note">Sample data — signatures from the public CEDAR dataset used in the research. Not real clients. <button onClick={() => setMode("real")}>Switch to real data</button></div>}
      {banner}
      <div className="content">{children}</div>
      <footer>Signatures are stored on this computer only. Every check is logged.</footer>
    </main>
  </div>;
}
