import { useEffect, useRef, type ReactNode } from "react";
import Icon from "./Icon";

/** Slide-over panel for small screens. Focus stays inside while open; Esc or the scrim closes it. */
export default function Drawer({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusables = () => [...(panel.current?.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])") ?? [])].filter(el => !el.hasAttribute("disabled"));
    focusables()[0]?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; previous?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="drawer" role="dialog" aria-modal="true" aria-label={label}>
    <div className="drawer-scrim" onClick={onClose} />
    <div className="drawer-panel" ref={panel}>
      <button className="icon-button drawer-close" onClick={onClose} aria-label="Close menu"><Icon name="close" size={18} /></button>
      {children}
    </div>
  </div>;
}
