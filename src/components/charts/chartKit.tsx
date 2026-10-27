import { useEffect, useRef, useState, type ReactNode } from "react";

/** Measured width of a chart container, so the SVG viewBox is in real pixels and text stays at 12px. */
export function useChartWidth(min = 280) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(min, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [min]);
  return { ref, width };
}

export type Tip = { x: number; y: number; title: string; text?: string } | null;

/** Hover tooltip: value + what it means. */
export function useTip() {
  const [tip, setTip] = useState<Tip>(null);
  const show = (e: { clientX: number; clientY: number }, title: string, text?: string) => setTip({ x: e.clientX, y: e.clientY, title, text });
  const hide = () => setTip(null);
  const node: ReactNode = tip && <div className="chart-tip" role="tooltip" style={{ left: Math.min(tip.x + 14, window.innerWidth - 290), top: tip.y + 14 }}><strong>{tip.title}</strong>{tip.text}</div>;
  return { show, hide, node };
}

/** About five round tick values covering [lo, hi]. */
export function ticks(lo: number, hi: number, count = 5): number[] {
  const span = hi - lo || 1, raw = span / count, mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}

/** Signed number with a true minus sign, for chart labels. */
export const fmt = (v: number, digits = 3) => `${v < 0 ? "−" : ""}${Math.abs(v).toFixed(digits)}`;
