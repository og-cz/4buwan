import { spread } from "../../format";
import { fmt, ticks, useChartWidth, useTip } from "./chartKit";

type Props = { looScores: number[]; score: number; line: number; low: number; high: number };

/** Gaussian kernel density of the person's 12 genuine (leave-one-out) scores, Silverman bandwidth. */
function density(values: number[], xs: number[]): number[] {
  const n = values.length, h = 1.06 * (spread(values) || 1e-3) * n ** -0.2;
  return xs.map(x => values.reduce((s, v) => s + Math.exp(-0.5 * ((x - v) / h) ** 2), 0) / (n * h * Math.sqrt(2 * Math.PI)));
}

/** Panel a: genuine scores as a jittered strip with a density curve, the Decision Line, the Uncertain Zone and Q. */
export default function ScoreDistribution({ looScores, score, line, low, high }: Props) {
  const { ref, width } = useChartWidth();
  const tip = useTip();
  const H = 180, top = 20, base = 128, stripY = 150, left = 8, right = 8;
  const all = [...looScores, score, line, low, high];
  const min = Math.min(...all), max = Math.max(...all), pad = (max - min) * 0.1 || 0.01;
  const lo = min - pad, hi = max + pad, W = width || 320;
  const x = (v: number) => left + (v - lo) / (hi - lo) * (W - left - right);
  const xs = Array.from({ length: 80 }, (_, i) => lo + (i / 79) * (hi - lo));
  const ds = density(looScores, xs), dmax = Math.max(...ds, 1e-9);
  const curve = `M${x(lo)},${base} ` + xs.map((v, i) => `L${x(v)},${base - (ds[i] / dmax) * (base - top)}`).join(" ") + ` L${x(hi)},${base} Z`;
  return <div ref={ref}>
    {width > 0 && <svg className="chart-svg" viewBox={`0 0 ${W} ${H + 18}`} role="img" aria-label="Score against the Decision Line">
      {ticks(lo, hi).map(t => <g key={t}><line className="grid" x1={x(t)} x2={x(t)} y1={top} y2={stripY + 10} /><text className="tick" x={x(t)} y={H + 12} textAnchor="middle">{fmt(t, 2)}</text></g>)}
      <rect className="zone" x={x(low)} y={top - 8} width={Math.max(1, x(high) - x(low))} height={stripY + 18 - top} onMouseMove={e => tip.show(e, `Uncertain Zone ${fmt(low)} to ${fmt(high)}`, "Scores this close to the Decision Line get an Uncertain Verdict.")} onMouseLeave={tip.hide} />
      <path className="density" d={curve} />
      <line className="axis" x1={left} x2={W - right} y1={base} y2={base} />
      <line className="decision" x1={x(line)} x2={x(line)} y1={top - 8} y2={stripY + 10} onMouseMove={e => tip.show(e, `Decision Line ${fmt(line)}`, "Below this line the Verdict is Likely forged.")} onMouseLeave={tip.hide} />
      {looScores.map((v, i) => <circle key={i} className="dot" cx={x(v)} cy={stripY + ((i * 37) % 9) - 4} r={4} onMouseMove={e => tip.show(e, `Genuine score ${fmt(v)}`, `Reference ${i + 1} left out and scored against the other 11.`)} onMouseLeave={tip.hide} />)}
      <line className="marker" x1={x(score)} x2={x(score)} y1={top + 6} y2={stripY + 10} />
      <text className="label-q" x={x(score)} y={top} textAnchor="middle">Q {fmt(score)}</text>
    </svg>}
    <div className="chart-legend"><span><i style={{ background: "var(--chart-dot)" }} />Genuine scores (12)</span><span><i style={{ background: "var(--uncertain)" }} />Decision Line and Uncertain Zone</span><span><i style={{ background: "var(--accent-2)" }} />Questioned (Q)</span></div>
    <div className="exact-values"><div><span>Score</span><strong>{fmt(score, 4)}</strong></div><div><span>Decision line</span><strong>{fmt(line, 4)}</strong></div><div><span>Distance</span><strong>{score - line >= 0 ? "+" : ""}{fmt(score - line, 4)}</strong></div></div>
    {tip.node}
  </div>;
}
