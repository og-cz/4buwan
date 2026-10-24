/** HOG distance between every pair of signatures. Darker = more similar. With `questioned`, the last row/column is Q. */
export default function SimilarityHeatmap({ matrix, questioned = false }: { matrix: number[][]; questioned?: boolean }) {
  const n = matrix.length;
  if (!n) return null;
  const max = Math.max(...matrix.flat(), 1e-9);
  const cell = 16, off = 22, size = off + n * cell;
  const label = (i: number) => questioned && i === n - 1 ? "Q" : `${i + 1}`;
  return <>
    <svg className="chart-svg heatmap-svg" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Similarity matrix">
      {matrix.map((row, i) => <g key={i}>
        <text x={off - 4} y={off + i * cell + cell * 0.7} textAnchor="end" className={`label ${questioned && i === n - 1 ? "q" : ""}`}>{label(i)}</text>
        <text x={off + i * cell + cell / 2} y={off - 6} textAnchor="middle" className={`label ${questioned && i === n - 1 ? "q" : ""}`}>{label(i)}</text>
        {row.map((d, j) => <rect key={j} x={off + j * cell} y={off + i * cell} width={cell - 1.5} height={cell - 1.5} className="cell" style={{ opacity: 0.12 + 0.88 * (1 - d / max) }}><title>{`${label(i)} × ${label(j)}: ${d}`}</title></rect>)}
      </g>)}
    </svg>
    <p className="chart-note">HOG distance between signatures; darker means more alike.{questioned ? " Q = the questioned signature." : ""}</p>
  </>;
}
