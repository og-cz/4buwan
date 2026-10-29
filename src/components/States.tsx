import type { ReactNode } from "react";
import Button from "./Button";
import Icon, { type IconName } from "./Icon";

export function EmptyState({ icon = "history", title, text, action }: { icon?: IconName; title: string; text?: string; action?: ReactNode }) {
  return <section className="panel result-card empty-state"><div className="empty-result"><Icon name={icon} size={30} /><strong>{title}</strong>{text && <span>{text}</span>}{action && <div className="state-action">{action}</div>}</div></section>;
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <section className="panel limitations error-state" role="alert"><Icon name="alert" /><div><h2>Something went wrong</h2><p>{message}</p>{retry && <div className="state-action"><Button secondary onClick={retry}>Try again</Button></div>}</div></section>;
}

export function Loading({ title = "Loading", text }: { title?: string; text?: string }) {
  return <section className="panel result-card loading-state"><div className="loading"><i /><strong>{title}</strong>{text && <span>{text}</span>}</div></section>;
}

/** Placeholder shaped like a panel with a table, shown while data loads. */
export function SkeletonPanel({ rows = 5 }: { rows?: number }) {
  return <section className="panel skeleton-block" aria-busy="true" aria-label="Loading"><span className="skeleton skeleton-title" />{Array.from({ length: rows }, (_, i) => <span key={i} className="skeleton skeleton-row" />)}</section>;
}
