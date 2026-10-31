import { useState, type ReactNode } from "react";
import Icon from "./Icon";
import NavList from "./NavList";
import { useSettings } from "../state/settings";
import { useTheme } from "../state/theme";
import { type Go, type Preset, type Screen } from "../navigation";

type Props = { preset: Preset; user: string; screen: Screen; go: Go; logout: () => void; banner?: ReactNode; children: ReactNode };

const crumb: Partial<Record<Screen, string>> = { CaseDetail: "Case", "Person Profile": "Profile" };

/** Shared data label: the preset decides the data, so there is no switch, only this note. */
export function DataLabel({ sample }: { sample: boolean }) {
  return <div className={`data-label ${sample ? "sample" : ""}`}><strong>{sample ? "SAMPLE DATA" : "REAL DATA"}</strong><small>{sample ? "Example data from the research datasets." : "Your own enrolled people and checks."}</small></div>;
}

/** Signature Desk shell from the Figma Make design (4buwan-ui): dark sidebar, MODULES list, top bar. */
export default function Shell({ preset, user, screen, go, logout, banner, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const settings = useSettings();
  const [theme, setTheme] = useTheme();
  const light = theme === "light";
  const initials = user.split(/\s+/).map(n => n[0] ?? "").join("").slice(0, 2).toUpperCase();
  const office = settings.orgName ? settings.orgName.toUpperCase() : "SIGNATURE DESK";
  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${drawerOpen ? "drawer-open" : ""}`}>
      <div className="brand"><img src={settings.orgLogo || "/assets/7e738.svg"} alt={settings.orgName || "4buwan"} /><button className="brand-toggle" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand menu" : "Collapse menu"}><Icon name="menu" size={18} /></button></div>
      <div className="office"><span>{office}</span><strong>{preset} demo</strong></div>
      <NavList screen={screen} go={go} onNavigate={() => setDrawerOpen(false)} />
      <div className="drawer-controls"><span>DATA</span><DataLabel sample={false} /></div>
      <div className="privacy-side"><Icon name="audit" size={15} /><p><strong>Private office system</strong>Access and changes are logged.</p></div>
    </aside>
    {drawerOpen && <button className="drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-label="Close menu" />}
    <main className={`main ${light ? "light-theme" : ""}`}>
      <header className="topbar"><div><button className="mobile-menu" onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Icon name="menu" size={18} /></button><span>Signature Desk</span><b>/</b><strong>{crumb[screen] ?? screen}</strong></div>
        <div className="top-tools"><DataLabel sample={false} /><button className="top-search" onClick={() => setTheme(light ? "dark" : "light")} title={light ? "Dark theme" : "Light theme"} aria-label={light ? "Dark theme" : "Light theme"}><Icon name={light ? "sun" : "moon"} size={15} /></button><div className="staff-menu"><span aria-hidden="true">{initials || "SD"}</span><div><strong>{user}</strong><small>Signed in</small></div><button onClick={logout} title="Log out" aria-label="Log out"><Icon name="logout" size={16} /></button></div></div>
      </header>
      {banner}
      <div className="content">{children}</div>
      <footer>Signatures are stored on this computer only. Every check is logged.</footer>
    </main>
  </div>;
}
