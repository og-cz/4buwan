import { useCallback, useId, useRef, useState } from "react";
import Icon from "../Icon";
import SignatureViewer, { type ViewerSource } from "./SignatureViewer";
import ViewerToolbar from "./ViewerToolbar";
import { FIT, fitSize, Layer, useBox, usePanZoom, type Size, type View } from "./viewerCore";

export type CompareMode = "side" | "overlay" | "swipe";
type Props = { a: ViewerSource; b: ViewerSource; mode?: CompareMode; onMode?: (m: CompareMode) => void };

/** Ink-to-colour matrix: white paper stays white, dark ink takes the colour. rgb in 0–1. */
const tint = ([r, g, b]: [number, number, number]) => [r, g, b].map(c => `${(1 - c) * .299} ${(1 - c) * .587} ${(1 - c) * .114} 0 ${c}`).join(" ") + " 0 0 0 1 0";
const CYAN: [number, number, number] = [0, .718, 1];      // --overlay-q
const MAGENTA: [number, number, number] = [.878, .212, .608]; // --overlay-r

const modes: [CompareMode, string, "swipe" | "layers" | "compare"][] = [["side", "Side by side", "compare"], ["overlay", "Overlay", "layers"], ["swipe", "Swipe", "swipe"]];

/** Questioned | Reference with synchronised zoom and pan, plus overlay (cyan / magenta, multiply) and swipe modes. */
export default function CompareViewer({ a, b, mode: controlled, onMode }: Props) {
  const [own, setOwn] = useState<CompareMode>("side");
  const mode = controlled ?? own;
  const setMode = onMode ?? setOwn;
  const [view, setViewState] = useState<View>(FIT);
  const setView = useCallback((v: View) => setViewState(v), []);
  const [opacity, setOpacity] = useState(70);
  const [split, setSplit] = useState(50);
  const [natural, setNatural] = useState<Size>({ w: 0, h: 0 });
  const canvas = useRef<HTMLDivElement>(null);
  const box = useBox(canvas);
  usePanZoom(canvas, view, setView);
  const id = useId().replace(/:/g, "");
  const fitted = fitSize(natural, box, view.rotate);

  return <div className="compare-viewer">
    <div className="compare-head">
      <div className="segmented" role="group" aria-label="Compare mode">{modes.map(([m, label, icon]) => <button key={m} className={mode === m ? "active" : ""} aria-pressed={mode === m} onClick={() => setMode(m)}><Icon name={icon} size={16} /> {label}</button>)}</div>
      {mode === "overlay" && <label className="compare-slider"><span>Reference opacity</span><input type="range" min={0} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)} /></label>}
      {mode === "swipe" && <label className="compare-slider"><span>Swipe</span><input type="range" min={0} max={100} value={split} onChange={e => setSplit(+e.target.value)} /></label>}
    </div>
    {mode === "side" ? <div className="compare-side"><SignatureViewer {...a} view={view} onView={setView} /><SignatureViewer {...b} view={view} onView={setView} /></div>
      : <figure className="signature-viewer">
        <svg width="0" height="0" className="sr-only" aria-hidden="true"><filter id={`${id}q`}><feColorMatrix type="matrix" values={tint(CYAN)} /></filter><filter id={`${id}r`}><feColorMatrix type="matrix" values={tint(MAGENTA)} /></filter></svg>
        <div className="viewer-canvas tall" ref={canvas} tabIndex={0} aria-label={`${a.label} and ${b.label}, ${mode}`}>
          {mode === "overlay" ? <>
            <Layer src={a.src} alt={a.label} view={view} box={box} onNatural={setNatural} style={{ filter: `url(#${id}q)` }} />
            <Layer src={b.src} alt={b.label} view={view} box={box} className="blend" style={{ filter: `url(#${id}r)`, opacity: opacity / 100 }} />
          </> : <>
            <Layer src={b.src} alt={b.label} view={view} box={box} />
            <div className="viewer-clip" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}><Layer src={a.src} alt={a.label} view={view} box={box} onNatural={setNatural} /></div>
            <i className="swipe-line" style={{ left: `${split}%` }} aria-hidden="true" />
          </>}
          <ViewerToolbar view={view} setView={setView} oneToOne={fitted.w ? natural.w / fitted.w : 1} />
        </div>
        <figcaption className="viewer-caption">{mode === "overlay"
          ? <><span className="legend-swatch q" />{a.label}<span className="legend-swatch r" />{b.label}<span className="quiet">Overlapping ink turns dark.</span></>
          : <><strong>Left:</strong> {a.label} <strong>Right:</strong> {b.label}</>}</figcaption>
      </figure>}
  </div>;
}
