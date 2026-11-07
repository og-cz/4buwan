/** A drawn, made-up signature for the fictional clients. `variant` changes the stroke a little (another sample of the same "writer"). */
export default function MockSignature({ seed, variant = 0, tint }: { seed: number; variant?: number; tint?: "q" | "r" }) {
  let a = (seed * 9301 + variant * 49297) >>> 0;
  const r = () => { a = (a * 1103515245 + 12345) >>> 0; return (a % 1000) / 1000; };
  const base = (seed % 7) / 7;
  let x = 14, d = `M${x} ${52 + base * 8}`;
  for (let i = 0; i < 7; i++) {
    const w = 14 + ((seed + i) % 5) * 3, up = 18 + ((seed * (i + 3)) % 17), jitter = (r() - 0.5) * 5;
    d += ` c${w * 0.3} ${-up + jitter} ${w * 0.7} ${-up + jitter} ${w} 0 c${w * 0.2} ${up * 0.6} ${w * 0.5} ${8 + jitter} ${w * 0.7} -2`;
    x += w * 1.7;
  }
  const flourish = `M${18 + (seed % 9)} ${70 + (r() - 0.5) * 3} C${60} ${62 + variant} ${110} ${78 - variant} ${Math.min(x, 186)} ${64}`;
  return <div className={`signature mock-signature ${tint ? `tint-${tint}` : ""}`} role="img" aria-label="Simulated signature">
    <svg viewBox="0 0 200 86" preserveAspectRatio="xMidYMid meet"><path d={d} /><path className="under" d={flourish} /></svg>
  </div>;
}
