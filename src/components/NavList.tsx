import Icon, { type IconName } from "./Icon";

export type NavItem = { key: string; label: string; icon: IconName; group?: string; bottom?: boolean };
type Props = { items: NavItem[]; active: string; onNav: (key: string) => void; onNavigate?: () => void };

/** The main sidebar list, with a label above each category. Items marked `bottom` (Help) sit at the foot of the list. */
export default function NavList({ items, active, onNav, onNavigate }: Props) {
  const button = (item: NavItem) => <button key={item.key} className={active === item.key ? "active" : ""} aria-current={active === item.key ? "page" : undefined} data-label={item.label} aria-label={item.label} onClick={() => { onNav(item.key); onNavigate?.(); }}><Icon name={item.icon} /><span>{item.label}</span></button>;
  const main = items.filter(i => !i.bottom);
  return <nav aria-label="Main navigation" className="main-nav">
    {main.map((item, i) => item.group !== main[i - 1]?.group || i === 0
      ? [<div className="nav-label" key={`label-${item.group ?? "modules"}`}>{(item.group ?? "Modules").toUpperCase()}</div>, button(item)]
      : button(item))}
    <div className="nav-bottom">{items.filter(i => i.bottom).map(button)}</div>
  </nav>;
}
