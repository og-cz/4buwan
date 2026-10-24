import type { ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

type Props = { children: ReactNode; icon?: IconName; secondary?: boolean; danger?: boolean; disabled?: boolean; title?: string; onClick?: () => void };

export default function Button({ children, icon, secondary, danger, disabled, title, onClick }: Props) {
  return <button className={`button ${secondary ? "secondary" : ""} ${danger ? "danger" : ""}`} disabled={disabled} title={title} onClick={onClick}>{icon && <Icon name={icon} size={15} />}{children}</button>;
}
