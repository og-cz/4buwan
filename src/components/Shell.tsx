import { useCallback, useState, type ReactNode } from "react";
import Brand from "./Brand";
import Drawer from "./Drawer";
import Icon from "./Icon";
import NavList from "./NavList";
import { useSettings } from "../state/settings";
import { useTheme } from "../state/theme";
import { type Go, type Preset, type Screen } from "../navigation";

type Props = { preset: Preset; user: string; screen: Screen; go: Go; logout: () => void; banner?: ReactNode; children: ReactNode };

const crumb: Partial<Record<Screen, string>> = { CaseDetail: "Case", "Person Profile": "Profile" };

/** The preset decides the data, so the top bar only states it; there is no switch. */
export function DataLabel({ sample }: { sample: boolean }) {
  return <div className={`data-label ${sample ? "sample" : ""}`}><strong>{sample ? "Sample data" : "Real data"}</strong><small>{sample ? "Example data from the research datasets." : "Your own enrolled people and checks."}</small></div>;
}

export default function Shell({ preset, user, screen, go, logout, banner, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const settings = useSettings();
  const [theme, setTheme] = useTheme();
  const initials = user.split(/\s+/).map(n => n[0] ?? "").join("").slice(0, 2).toUpperCase();
  const org = settings.orgName || "Signature Desk";
  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand"><Brand size={32} label={org} logo={settings.orgLogo} /><button className="brand-toggle" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand menu" : "Collapse menu"} title={collapsed ? "Expand menu" : "Collapse menu"}><Icon name="menu" size={18} /></button></div>
      <div className="office"><span>Workspace</span><strong>{preset} demo</strong></div>
      <NavList screen={screen} go={go} />
      <div className="privacy-side"><Icon name="audit" size={18} /><p><strong>Private office system</strong>Access and changes are logged.</p></div>
    </aside>
    <main className="main">
      <header className="topbar">
        <button className="icon-button mobile-only" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer}><Icon name="menu" size={18} /></button>
        <div className="crumbs"><span className="desktop-only">{org}</span><b className="desktop-only">/</b><strong>{crumb[screen] ?? screen}</strong></div>
        <div className="top-tools"><div className="desktop-only"><DataLabel sample={false} /></div><button className="icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} title={theme === "dark" ? "Light theme" : "Dark theme"}><Icon name={theme === "dark" ? "sun" : "moon"} size={18} /></button><div className="staff-menu"><span aria-hidden="true">{initials || "SD"}</span><div className="desktop-only"><strong>{user}</strong><small>Signed in</small></div><button className="icon-button" onClick={logout} title="Log out" aria-label="Log out"><Icon name="logout" size={18} /></button></div></div>
      </header>
      {banner}
      <div className="content">{children}</div>
      <footer>Signatures are stored on this computer only. Every check is logged.</footer>
    </main>
    <Drawer open={drawer} onClose={closeDrawer} label="Menu">
      <Brand size={32} label={org} logo={settings.orgLogo} />
      <div className="drawer-section"><span className="nav-label">Data</span><DataLabel sample={false} /></div>
      <div className="drawer-section"><span className="nav-label">Workspace</span><strong>{preset} demo · {user}</strong></div>
      <NavList screen={screen} go={go} onNavigate={closeDrawer} />
    </Drawer>
  </div>;
}
