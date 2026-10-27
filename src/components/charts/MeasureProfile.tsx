import type { MeasureStats, MeasureValues } from "../../types";
import { fmt, useChartWidth, useTip } from "./chartKit";
import { MEASURE_INFO } from "./measures";

type Props = { measures: MeasureValues[]; pairStats: Record<string, MeasureStats> };

const median = (v: number[]) => { const s = [...v].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/** Panel c: per measure, the person's genuine range (box q25–q75, whiskers min–max) and the 12 questioned values. */
export default function MeasureProfile({ measures, pairStats }: Props) {
  const { ref, width } = useChartWidth();
  const tip = useTip();
  const W = width || 320, row = 30, labelW = Math.min(210, W * 0.42), plotL = labelW + 8, plotR = W - 8;
  const rows = measures.filter(m => pairStats[m.name]);
  const H = rows.length * row + 8;
  return <div ref={ref}>
    {width > 0 && <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="17 Difference Measures">
      {rows.map((m, i) => {
        const s = pairStats[m.name], [full, def] = MEASURE_INFO[m.name] ?? [m.name, ""];
        const lo = Math.min(s.min, ...m.questioned), hi = Math.max(s.max, ...m.questioned), span = hi - lo || 1;
        const x = (v: number) => plotL + (v - lo) / span * (plotR - plotL);
        const med = median(m.questioned), outside = med < s.min || med > s.max, y = i * row + row / 2 + 4;
        return <g key={m.name}>
          {outside && <rect className="row-flag" x={0} y={y - row / 2 + 1} width={W} height={row - 2} rx={4} />}
          <text x={4} y={y + 4} className={outside ? "flag-text" : ""} onMouseMove={e => tip.show(e, full, def)} onMouseLeave={tip.hide}>{full}</text>
          <line className="whisker" x1={x(s.min)} x2={x(s.max)} y1={y} y2={y} />
          <line className="whisker" x1={x(s.min)} x2={x(s.min)} y1={y - 5} y2={y + 5} />
          <line className="whisker" x1={x(s.max)} x2={x(s.max)} y1={y - 5} y2={y + 5} />
          <rect className="band" x={x(s.q25)} y={y - 6} width={Math.max(2, x(s.q75) - x(s.q25))} height={12} rx={2} onMouseMove={e => tip.show(e, `${full}: genuine q25–q75 ${fmt(s.q25, 2)} to ${fmt(s.q75, 2)}`, `Min ${fmt(s.min, 2)}, median ${fmt(s.median, 2)}, max ${fmt(s.max, 2)} over the 66 genuine pairs.`)} onMouseLeave={tip.hide} />
          {m.questioned.map((v, j) => <circle key={j} className="qdot" cx={x(v)} cy={y} r={3} onMouseMove={e => tip.show(e, `${full}: ${fmt(v, 2)}`, `Questioned signature against Reference ${j + 1}.`)} onMouseLeave={tip.hide} />)}
        </g>;
      })}
    </svg>}
    <div className="chart-legend"><span><i style={{ background: "var(--chart-band)" }} />Genuine pairs: box q25–q75, whiskers min–max</span><span><i style={{ background: "var(--accent)" }} />Questioned vs each reference</span><span><i style={{ background: "var(--uncertain-soft)", border: "1px solid var(--uncertain)" }} />Median questioned value outside the genuine range</span></div>
    <p className="chart-note">Values are in standardised units: each measure divided by its typical size across development writers. Hover a name for its definition.</p>
    {tip.node}
  </div>;
}
