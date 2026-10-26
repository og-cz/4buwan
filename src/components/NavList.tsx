import Icon from "./Icon";
import { navGroups, navIcons, parentScreen, type Go, type Preset, type Screen } from "../navigation";

type Props = { preset: Preset; screen: Screen; go: Go; onNavigate?: () => void };

/** Sidebar / drawer navigation, grouped with small section labels. */
export default function NavList({ preset, screen, go, onNavigate }: Props) {
  const active = parentScreen[screen] ?? screen;
  return <nav aria-label="Modules">{navGroups(preset).map(group => <div className="nav-group" key={group.label}>
    <div className="nav-label">{group.label}</div>
    {group.items.map(item => <button key={item} className={active === item ? "active" : ""} aria-current={active === item ? "page" : undefined} data-label={item} aria-label={item} onClick={() => { go(item); onNavigate?.(); }}><Icon name={navIcons[item]} /><span>{item}</span></button>)}
  </div>)}</nav>;
}
