import { useCallback, useState, type ReactNode } from "react";
import Brand from "./Brand";
import Drawer from "./Drawer";
import Icon from "./Icon";
import NavList, { type NavItem } from "./NavList";
import { useSettings } from "../state/settings";
import { useTheme } from "../state/theme";

type Props = {
  demo: string; user: string; items: NavItem[]; active: string; onNav: (key: string) => void; crumb: string;
  controls?: ReactNode; strip?: ReactNode; note: { title: string; text: string }; footer: string;
  logout: () => void; banner?: ReactNode; children: ReactNode;
};

/** Application frame shared by both demos: dark sidebar, top bar with the demo's own controls, content. */
export default function Shell({ demo, user, items, active, onNav, crumb, controls, strip, note, footer, logout, banner, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const settings = useSettings();
  const [theme, setTheme] = useTheme();
  const initials = user.split(/\s+/).map(n => n[0] ?? "").join("").slice(0, 2).toUpperCase();
  const org = settings.orgName || "Signature Verification";
  const themeButton = <button className="icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} title={theme === "dark" ? "Light theme" : "Dark theme"}><Icon name={theme === "dark" ? "sun" : "moon"} size={18} /></button>;

  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand"><Brand size={64} logo={settings.orgLogo} /><button className="brand-toggle" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand menu" : "Collapse menu"} title={collapsed ? "Expand menu" : "Collapse menu"}><Icon name="menu" size={18} /></button></div>
      <div className="office"><span>{org.toUpperCase()}</span><strong>{demo}</strong></div>
      <NavList items={items} active={active} onNav={onNav} />
      <div className="privacy-side"><Icon name="audit" size={18} /><p><strong>{note.title}</strong>{note.text}</p></div>
    </aside>
    <main className="main">
      <header className="topbar">
        <button className="icon-button mobile-only" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer}><Icon name="menu" size={18} /></button>
        <div className="crumbs"><span className="desktop-only">{org}</span><b className="desktop-only">/</b><strong>{crumb}</strong></div>
        <div className="top-tools">{controls && <div className="desktop-only">{controls}</div>}{themeButton}<div className="staff-menu"><span aria-hidden="true">{initials || "SD"}</span><div className="desktop-only"><strong>{user}</strong><small>Signed in</small></div><button className="icon-button" onClick={logout} title="Log out" aria-label="Log out"><Icon name="logout" size={18} /></button></div></div>
      </header>
      {strip}
      {banner}
      <div className="content">{children}</div>
      <footer>{footer}</footer>
    </main>
    <Drawer open={drawer} onClose={closeDrawer} label="Menu">
      <Brand size={56} logo={settings.orgLogo} />
      {controls && <div className="drawer-section">{controls}</div>}
      <div className="drawer-section"><span className="nav-label">Workspace</span><strong>{demo} · {user}</strong></div>
      <NavList items={items} active={active} onNav={onNav} onNavigate={closeDrawer} />
    </Drawer>
  </div>;
}
