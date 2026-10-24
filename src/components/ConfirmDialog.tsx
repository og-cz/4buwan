import Button from "./Button";

type Props = { title: string; text: string; confirm: string; danger?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void };

export default function ConfirmDialog({ title, text, confirm, danger, busy, onConfirm, onCancel }: Props) {
  return <div className="dialog-backdrop" onClick={onCancel}>
    <section className="panel dialog" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
      <h2>{title}</h2><p>{text}</p>
      <div className="dialog-actions"><Button secondary onClick={onCancel}>Cancel</Button><Button danger={danger} disabled={busy} onClick={onConfirm}>{busy ? "Working…" : confirm}</Button></div>
    </section>
  </div>;
}
