import { signed } from "../../format";

type Props = { looScores: number[]; score: number; line: number; low: number; high: number };

/** Genuine leave-one-out scores (dots), Decision Line, shaded Uncertain Zone and this signature's score. */
export default function ScoreDistribution({ looScores, score, line, low, high }: Props) {
  const all = [...looScores, score, line, low, high];
  const min = Math.min(...all), max = Math.max(...all), pad = (max - min) * 0.08 || 0.01;
  const x = (v: number) => 10 + (v - min + pad) / (max - min + 2 * pad) * 280;
  return <>
    <svg className="chart-svg" viewBox="0 0 300 110" role="img" aria-label="Score against the Decision Line">
      <line x1="10" x2="290" y1="92" y2="92" className="axis" />
      <rect x={x(low)} y="8" width={Math.max(1, x(high) - x(low))} height="84" className="zone" />
      <line x1={x(line)} x2={x(line)} y1="4" y2="98" className="decision" />
      {looScores.map((v, i) => <circle key={i} cx={x(v)} cy={78 - (i % 4) * 9} r="3.2" className="dot" />)}
      <line x1={x(score)} x2={x(score)} y1="30" y2="98" className="marker" />
      <text x={x(score)} y="24" textAnchor="middle" className="label">Q</text>
    </svg>
    <div className="exact-values"><div><span>SCORE</span><strong>{signed(score)}</strong></div><div><span>DECISION LINE</span><strong>{signed(line)}</strong></div><div><span>DISTANCE</span><strong>{signed(score - line)}</strong></div></div>
  </>;
}
