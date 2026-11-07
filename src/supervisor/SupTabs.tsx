import type { SupGo, SupRoute } from "./SupervisorApp";

/** Tabs inside a Supervisor module. */
export default function SupTabs({ route, go, tabs, label }: { route: SupRoute; go: SupGo; tabs: [string, string][]; label: string }) {
  const active = route.tab ?? tabs[0][0];
  return <div className="research-tabs module-tabs" role="tablist" aria-label={label}>{tabs.map(([key, text]) =>
    <button key={key} role="tab" aria-selected={active === key} className={active === key ? "active" : ""} onClick={() => go({ section: route.section, tab: key })}>{text}</button>)}</div>;
}

export const simTag = (text = "SIMULATED") => <span className="tag warn sim-tag"><i />{text}</span>;
