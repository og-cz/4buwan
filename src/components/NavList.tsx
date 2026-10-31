import Icon from "./Icon";
import { examinerGroups, navIcons, parentScreen, type Go, type Screen } from "../navigation";

type Props = { screen: Screen; go: Go; onNavigate?: () => void };

/** Sidebar modules, grouped under small category labels. */
export default function NavList({ screen, go, onNavigate }: Props) {
  const active = parentScreen[screen] ?? screen;
  return <nav aria-label="Modules">{examinerGroups.map(g => <div className="nav-group" key={g.label}>
    <div className="nav-label">{g.label}</div>
    {g.items.map(item => <button key={item} className={active === item ? "active" : ""} aria-current={active === item ? "page" : undefined} aria-label={item} title={item} onClick={() => { go(item); onNavigate?.(); }}><Icon name={navIcons[item]} /><span>{item}</span></button>)}
  </div>)}</nav>;
}
