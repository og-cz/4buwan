import Icon, { type IconName } from "../Icon";
import { clampZoom, FIT, MAX_ZOOM, type View } from "./viewerCore";

type Props = { view: View; setView: (v: View) => void; oneToOne: number; cleaned?: boolean; onCleaned?: () => void; cleanedBusy?: boolean };

function Tool({ icon, label, onClick, active, disabled }: { icon: IconName; label: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return <button type="button" className={`viewer-tool ${active ? "active" : ""}`} aria-label={label} title={label} aria-pressed={active} disabled={disabled} onClick={onClick}><Icon name={icon} size={16} /></button>;
}

/** Zoom 100–800 %, fit, 1:1, rotate 90°, invert, and the cleaned 100 × 100 stage. Appears on hover or focus. */
export default function ViewerToolbar({ view, setView, oneToOne, cleaned, onCleaned, cleanedBusy }: Props) {
  const zoomTo = (z: number) => { const zoom = clampZoom(z); setView(zoom === 1 ? { ...view, zoom, x: 0, y: 0 } : { ...view, zoom }); };
  return <div className="viewer-toolbar" role="toolbar" aria-label="Image tools">
    <Tool icon="minus" label="Zoom out" onClick={() => zoomTo(view.zoom / 1.25)} disabled={view.zoom <= 1} />
    <span className="viewer-zoom num">{Math.round(view.zoom * 100)}%</span>
    <Tool icon="plus" label="Zoom in" onClick={() => zoomTo(view.zoom * 1.25)} disabled={view.zoom >= MAX_ZOOM} />
    <Tool icon="fit" label="Fit" onClick={() => setView({ ...FIT, invert: view.invert, rotate: view.rotate })} />
    <button type="button" className="viewer-tool text" title="Actual pixels" aria-label="Actual pixels (1:1)" onClick={() => zoomTo(oneToOne)}>1:1</button>
    <Tool icon="rotate" label="Rotate 90°" onClick={() => setView({ ...view, rotate: (view.rotate + 90) % 360 })} />
    <Tool icon="invert" label="Invert" active={view.invert} onClick={() => setView({ ...view, invert: !view.invert })} />
    {onCleaned && <button type="button" className={`viewer-tool text ${cleaned ? "active" : ""}`} aria-pressed={cleaned} disabled={cleanedBusy} title="Show the cleaned 100 × 100 image the model sees" onClick={onCleaned}>{cleanedBusy ? "…" : "Cleaned"}</button>}
  </div>;
}
