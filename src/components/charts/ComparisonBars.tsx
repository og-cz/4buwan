import { useState } from "react";
import { pad2 } from "../../format";
import type { Comparison } from "../../types";
import { fmt, useChartWidth, useTip } from "./chartKit";

/** Panel b: one bar per Reference Sample with a zero baseline. Positive = genuine-like. */
export default function ComparisonBars({ comparisons, matches, majorityAccept }: { comparisons: Comparison[]; matches: number; majorityAccept: boolean }) {
  const [byValue, setByValue] = useState(false);
  const { ref, width } = useChartWidth();
  const tip = useTip();
  const rows = byValue ? [...comparisons].sort((a, b) => b.value - a.value) : comparisons;
  const peak = Math.max(...comparisons.map(c => Math.abs(c.value)), 1e-9);
  const hasNeg = comparisons.some(c => c.value < 0), hasPos = comparisons.some(c => c.value >= 0);
  const W = width || 320, H = 220, top = 22, bottom = 30;
  const zero = hasNeg && hasPos ? top + (H - top - bottom) / 2 : hasNeg ? top : H - bottom;
  const scale = (hasNeg && hasPos ? (H - top - bottom) / 2 : H - top - bottom) / peak;
  const slot = W / rows.length, bw = Math.min(36, slot * 0.6);
  return <div ref={ref}>
    <div className="chart-toolbar" role="group" aria-label="Sort"><button className={!byValue ? "active" : ""} aria-pressed={!byValue} onClick={() => setByValue(false)}>By reference</button><button className={byValue ? "active" : ""} aria-pressed={byValue} onClick={() => setByValue(true)}>By value</button></div>
    {width > 0 && <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Model output for each Reference Sample">
      {rows.map((c, i) => {
        const h = Math.max(1, Math.abs(c.value) * scale), cx = slot * i + slot / 2, y = c.value >= 0 ? zero - h : zero;
        return <g key={c.reference} onMouseMove={e => tip.show(e, `R${pad2(c.reference)} ${fmt(c.value)}`, c.value >= 0 ? "Genuine-like: inside this person's genuine region." : "Outside this person's genuine region for this pair.")} onMouseLeave={tip.hide}>
          <rect x={cx - slot / 2} y={0} width={slot} height={H} fill="transparent" />
          <rect className={c.value >= 0 ? "bar-pos" : "bar-neg"} x={cx - bw / 2} y={y} width={bw} height={h} rx={3} />
          {slot >= 34 && <text className="value" x={cx} y={c.value >= 0 ? y - 5 : y + h + 14} textAnchor="middle">{fmt(c.value, 2)}</text>}
          <text x={cx} y={H - 8} textAnchor="middle">R{pad2(c.reference)}</text>
        </g>;
      })}
      <line className="zero" x1={0} x2={W} y1={zero} y2={zero} />
    </svg>}
    <p className="chart-note"><span className="num">{matches}</span> of 12 above zero (majority rule: {majorityAccept ? "accept" : "reject"}).</p>
    {tip.node}
  </div>;
}
