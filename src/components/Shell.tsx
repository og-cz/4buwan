import { useState, type ReactNode } from "react";
import Icon from "./Icon";
import { useSettings } from "../state/settings";
import { navIcons, parentScreen, presetScreens, type Go, type Preset, type Screen } from "../navigation";

type Props = {
  preset: Preset; user: string; screen: Screen; go: Go; logout: () => void;
  expert: boolean; setExpert: (v: boolean) => void; banner?: ReactNode; children: ReactNode;
};

const crumb: Partial<Record<Screen, string>> = { CaseDetail: "Case", "Person Profile": "Profile" };

export default function Shell({ preset, user, screen, go, logout, expert, setExpert, banner, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const settings = useSettings();
  const active = parentScreen[screen] ?? screen;
  const initials = user.split(/\s+/).map(n => n[0] ?? "").join("").slice(0, 2).toUpperCase();
  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand"><img src={settings.orgLogo || "/assets/7e738.svg"} alt={settings.orgName || "4buwan"} /><button className="brand-toggle" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand menu" : "Collapse menu"} title={collapsed ? "Expand menu" : "Collapse menu"}><Icon name="menu" size={18} /></button></div>
      <div className="office"><span>{(settings.orgName || "Signature Desk").toUpperCase()}</span><strong>{preset} demo</strong></div>
      <div className="nav-label">MODULES</div>
      <nav>{presetScreens[preset].map(item => <button className={active === item ? "active" : ""} onClick={() => go(item)} key={item}><Icon name={navIcons[item]} /><span>{item}</span></button>)}</nav>
      <div className="privacy-side"><Icon name="audit" size={15} /><p><strong>Private office system</strong>Access and changes are logged.</p></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><span>Signature Desk</span><b>/</b><strong>{crumb[screen] ?? screen}</strong></div><div className="top-tools"><div className="view-switch"><button className={!expert ? "active" : ""} onClick={() => setExpert(false)}>Simple view</button><button className={expert ? "active" : ""} onClick={() => setExpert(true)}>Expert view</button></div><div className="staff-menu"><span>{initials || "SD"}</span><div><strong>{user}</strong><small>Signed in</small></div><button onClick={logout} title="Log out"><Icon name="logout" size={16} /></button></div></div></header>
      {banner}
      <div className="content">{children}</div>
      <footer>Signatures are stored on this computer only. Every check is logged.</footer>
    </main>
  </div>;
}
