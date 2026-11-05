import { useCallback, useState, type ReactNode } from "react";
import Brand from "./Brand";
import Drawer from "./Drawer";
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

const dataHint: Record<DataMode, string> = {
  real: "Your own enrolled people and checks.",
  sample: "Example data from the research datasets, to show how real use looks.",
};

/** Real data | Sample data, with a one-line hint and the number of people in that data. */
function DataSwitch({ counts }: { counts: Counts }) {
  const [mode, setMode] = useDataMode();
  const count = counts ? ` · ${counts.persons} ${counts.persons === 1 ? "person" : "people"}` : "";
  return <div className="data-switch-block">
    <div className="view-switch" role="group" aria-label="Data"><button className={mode === "real" ? "active" : ""} aria-pressed={mode === "real"} onClick={() => setMode("real")}>Real data</button><button className={mode === "sample" ? "active sample" : ""} aria-pressed={mode === "sample"} onClick={() => setMode("sample")}>Sample data</button></div>
    <small>{mode === "sample" ? "Sample data" : "Real data"}{count}. {dataHint[mode]}</small>
  </div>;
}

const crumb: Partial<Record<Screen, string>> = { CaseDetail: "Case", "Person Profile": "Profile" };

function ViewSwitch({ expert, setExpert }: { expert: boolean; setExpert: (v: boolean) => void }) {
  return <div className="view-switch" role="group" aria-label="View"><button className={!expert ? "active" : ""} aria-pressed={!expert} onClick={() => setExpert(false)}>Simple view</button><button className={expert ? "active" : ""} aria-pressed={expert} onClick={() => setExpert(true)}>Expert view</button></div>;
}

export default function Shell({ preset, user, screen, go, logout, expert, setExpert, counts, banner, children }: Props) {
  const [mode, setMode] = useDataMode();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const settings = useSettings();
  const [theme, setTheme] = useTheme();
  const initials = user.split(/\s+/).map(n => n[0] ?? "").join("").slice(0, 2).toUpperCase();
  const org = settings.orgName || "Signature Desk";
  const themeButton = <button className="icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} title={theme === "dark" ? "Light theme" : "Dark theme"}><Icon name={theme === "dark" ? "sun" : "moon"} size={18} /></button>;

  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand"><Brand size={64} logo={settings.orgLogo} /><button className="brand-toggle" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand menu" : "Collapse menu"} title={collapsed ? "Expand menu" : "Collapse menu"}><Icon name="menu" size={18} /></button></div>
      <div className="office"><span>{org.toUpperCase()}</span><strong>{preset} demo</strong></div>
      <NavList preset={preset} screen={screen} go={go} />
      <div className="privacy-side"><Icon name="audit" size={18} /><p><strong>Private office system</strong>Access and changes are logged.</p></div>
    </aside>
    <main className="main">
      <header className="topbar">
        <button className="icon-button mobile-only" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer}><Icon name="menu" size={18} /></button>
        <div className="crumbs"><span className="desktop-only">{org}</span><b className="desktop-only">/</b><strong>{crumb[screen] ?? screen}</strong></div>
        <div className="top-tools"><div className="desktop-only switch-stack"><ViewSwitch expert={expert} setExpert={setExpert} /><DataSwitch counts={counts} /></div>{themeButton}<div className="staff-menu"><span aria-hidden="true">{initials || "SD"}</span><div className="desktop-only"><strong>{user}</strong><small>Signed in</small></div><button className="icon-button" onClick={logout} title="Log out" aria-label="Log out"><Icon name="logout" size={18} /></button></div></div>
      </header>
      {mode === "sample" && <div className="sample-strip" role="note"><span>Sample data — signatures from the public CEDAR dataset used in the research. Not real clients.</span><button onClick={() => setMode("real")}>Switch to real data</button></div>}
      {banner}
      <div className="content">{children}</div>
      <footer>Signatures are stored on this computer only. Every check is logged.</footer>
    </main>
    <Drawer open={drawer} onClose={closeDrawer} label="Menu">
      <Brand size={56} logo={settings.orgLogo} />
      <div className="drawer-section"><span className="nav-label">View</span><ViewSwitch expert={expert} setExpert={setExpert} /></div>
      <div className="drawer-section"><span className="nav-label">Data</span><DataSwitch counts={counts} /></div>
      <div className="drawer-section"><span className="nav-label">Workspace</span><strong>{preset} demo · {user}</strong></div>
      <NavList preset={preset} screen={screen} go={go} onNavigate={closeDrawer} />
    </Drawer>
  </div>;
}
