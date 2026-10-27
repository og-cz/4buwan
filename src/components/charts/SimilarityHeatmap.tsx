import { useChartWidth, useTip } from "./chartKit";

/** Panel d: HOG distance between every pair of signatures. Stronger colour = more alike. With `questioned`, the last row/column is Q. */
export default function SimilarityHeatmap({ matrix, questioned = false }: { matrix: number[][]; questioned?: boolean }) {
  const { ref, width } = useChartWidth(240);
  const tip = useTip();
  const n = matrix.length;
  if (!n) return null;
  const off = 28, size = Math.min(width || 300, 420), cell = (size - off) / n;
  const vals = matrix.flat().filter(v => v > 0), max = Math.max(...vals, 1e-9), min = Math.min(...vals, max);
  const shade = (d: number) => d === 0 ? 1 : 0.12 + 0.88 * (1 - (d - min) / (max - min || 1));
  const label = (i: number) => questioned && i === n - 1 ? "Q" : String(i + 1);
  const q = questioned ? off + (n - 1) * cell : 0;
  return <div ref={ref} className="heatmap-wrap">
    {width > 0 && <svg className="chart-svg" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: size }} role="img" aria-label="Similarity matrix">
      {matrix.map((row, i) => <g key={i}>
        <text className={`tick ${questioned && i === n - 1 ? "q" : ""}`} x={off - 6} y={off + i * cell + cell / 2 + 4} textAnchor="end">{label(i)}</text>
        <text className={`tick ${questioned && i === n - 1 ? "q" : ""}`} x={off + i * cell + cell / 2} y={off - 8} textAnchor="middle">{label(i)}</text>
        {row.map((d, j) => <rect key={j} className="cell" x={off + j * cell} y={off + i * cell} width={cell - 1.5} height={cell - 1.5} rx={2} style={{ opacity: shade(d) }} onMouseMove={e => tip.show(e, `${label(i)} × ${label(j)}: ${d.toFixed(2)}`, i === j ? "Same signature." : "HOG distance; smaller means more alike.")} onMouseLeave={tip.hide} />)}
      </g>)}
      {questioned && <><rect className="outline" x={off - 1} y={q - 1} width={n * cell} height={cell + 1} rx={3} /><rect className="outline" x={q - 1} y={off - 1} width={cell + 1} height={n * cell} rx={3} /></>}
    </svg>}
    <div className="heat-scale"><span className="num">{min.toFixed(1)}</span><i /><span className="num">{max.toFixed(1)}</span><span className="quiet">HOG distance (stronger colour = more alike){questioned ? " · Q = questioned" : ""}</span></div>
    {tip.node}
  </div>;
}
