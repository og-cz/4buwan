import { useRef, useState, type MouseEvent } from "react";
import Icon from "../Icon";
import { fitSize, useBox, type Size } from "./viewerCore";

export type Point = { x: number; y: number };
export type Pin = Point & { id: number; note: string };
type Tool = "ruler" | "pin";

type Props = { src: string; label: string; pins: Pin[]; setPins: (p: Pin[]) => void };

/** Measuring ruler (in image pixels) and numbered annotation pins with notes, on one image. */
export default function Annotator({ src, label, pins, setPins }: Props) {
  const [tool, setTool] = useState<Tool>("ruler");
  const [ruler, setRuler] = useState<Point[]>([]);
  const [natural, setNatural] = useState<Size>({ w: 0, h: 0 });
  const box = useRef<HTMLDivElement>(null);
  const size = useBox(box);
  const shown = fitSize(natural, size, 0, 0.04);
  const k = shown.w ? natural.w / shown.w : 1;

  function click(e: MouseEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const p = { x: Math.round((e.clientX - r.left) * k), y: Math.round((e.clientY - r.top) * k) };
    if (tool === "ruler") setRuler(cur => cur.length === 1 ? [cur[0], p] : [p]);
    else setPins([...pins, { ...p, id: (pins.at(-1)?.id ?? 0) + 1, note: "" }]);
  }
  const length = ruler.length === 2 ? Math.hypot(ruler[1].x - ruler[0].x, ruler[1].y - ruler[0].y) : null;

  return <div className="annotator">
    <div className="compare-head">
      <div className="segmented" role="group" aria-label="Annotation tool">
        <button className={tool === "ruler" ? "active" : ""} aria-pressed={tool === "ruler"} onClick={() => setTool("ruler")}><Icon name="ruler" size={16} /> Ruler</button>
        <button className={tool === "pin" ? "active" : ""} aria-pressed={tool === "pin"} onClick={() => setTool("pin")}><Icon name="pin" size={16} /> Pin</button>
      </div>
      <span className="chart-note">{tool === "ruler" ? "Click two points to measure." : "Click to drop a numbered pin, then write its note."}{length !== null && <> Distance: <strong className="num">{length.toFixed(1)} px</strong></>}</span>
    </div>
    <div className="annotator-canvas" ref={box}>
      <div className="annotator-stage" style={{ width: shown.w || undefined, height: shown.h || undefined }}>
        <img src={src} alt={label} draggable={false} onLoad={e => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />
        {shown.w > 0 && <svg viewBox={`0 0 ${natural.w} ${natural.h}`} onClick={click} role="img" aria-label={`${label} annotations`}>
          {ruler.map((p, i) => <circle key={i} className="ruler-end" cx={p.x} cy={p.y} r={5 * k} />)}
          {ruler.length === 2 && <line className="ruler-line" x1={ruler[0].x} y1={ruler[0].y} x2={ruler[1].x} y2={ruler[1].y} strokeWidth={2 * k} />}
          {pins.map(p => <g key={p.id}><circle className="pin-dot" cx={p.x} cy={p.y} r={11 * k} /><text className="pin-num" x={p.x} y={p.y + 4 * k} textAnchor="middle" style={{ fontSize: 12 * k }}>{p.id}</text></g>)}
        </svg>}
      </div>
    </div>
    {pins.length > 0 && <ol className="pin-list">{pins.map(p => <li key={p.id}><span className="pin-badge">{p.id}</span><span className="num quiet">x {p.x}, y {p.y}</span>
      <input aria-label={`Note for pin ${p.id}`} value={p.note} placeholder="What does this point show?" onChange={e => setPins(pins.map(q => q.id === p.id ? { ...q, note: e.target.value } : q))} />
      <button className="icon-button" aria-label={`Remove pin ${p.id}`} onClick={() => setPins(pins.filter(q => q.id !== p.id))}><Icon name="close" size={16} /></button></li>)}</ol>}
  </div>;
}
