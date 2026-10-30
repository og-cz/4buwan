import Icon from "./Icon";
import { navIcons, parentScreen, presetScreens, type Go, type Preset, type Screen } from "../navigation";

type Props = { preset: Preset; screen: Screen; go: Go; onNavigate?: () => void };

/** The single MODULES list in the sidebar (also the drawer on phones). */
export default function NavList({ preset, screen, go, onNavigate }: Props) {
  const active = parentScreen[screen] ?? screen;
  return <nav aria-label="Modules">{presetScreens[preset].map(item => <button key={item} className={active === item ? "active" : ""} aria-current={active === item ? "page" : undefined} aria-label={item} title={item} onClick={() => { go(item); onNavigate?.(); }}><Icon name={navIcons[item]} /><span>{item}</span></button>)}</nav>;
}
