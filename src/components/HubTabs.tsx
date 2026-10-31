import { hubTabs, parentScreen, type Go, type NavScreen, type Screen } from "../navigation";

/** Tabs for modules that group several screens (Cases, Reference Library). Same look as the Research Lab tabs. */
export default function HubTabs({ screen, go }: { screen: Screen; go: Go }) {
  const hub = (parentScreen[screen] ?? screen) as NavScreen;
  const tabs = hubTabs[hub];
  if (!tabs || !tabs.some(([t]) => t === screen)) return null;
  return <div className="research-tabs hub-tabs" role="tablist">{tabs.map(([target, label]) => <button key={target} role="tab" aria-selected={screen === target} className={screen === target ? "active" : ""} onClick={() => go(target)}>{label}</button>)}</div>;
}
