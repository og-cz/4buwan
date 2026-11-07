import type { Go, Screen, Section } from "../navigation";

/** Tabs inside a merged module (for example Cases | Review queue). Detail pages keep their parent tab highlighted. */
export default function ModuleTabs({ section, screen, go }: { section: Section; screen: Screen; go: Go }) {
  if (!section.tabs) return null;
  const active = section.tabs.some(([s]) => s === screen) ? screen : section.home;
  return <div className="research-tabs module-tabs" role="tablist" aria-label={section.label}>{section.tabs.map(([s, label]) =>
    <button key={s} role="tab" aria-selected={active === s} className={active === s ? "active" : ""} onClick={() => go(s)}>{label}</button>)}</div>;
}
