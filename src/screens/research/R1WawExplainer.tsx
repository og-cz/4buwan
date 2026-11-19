import { OUR_METHOD_LONG } from "../../methods";

/** Inline symbols for the explanation text. */
const WG = <math><msub><mi>W</mi><mi>G</mi></msub></math>;
const U1 = <math><msub><mi>u</mi><mn>1</mn></msub></math>;
const L1 = <math><msub><mi>λ</mi><mn>1</mn></msub></math>;

/** Mini diagram: the shared yardstick keeps 16 directions; the person's own spread replaces the main one. */
export default function R1WawExplainer() {
  const bars = Array.from({ length: 17 }, (_, i) => i);
  return <section className="panel r1waw"><div className="panel-head"><div><span>What R1-WAW does</span><h2>{OUR_METHOD_LONG}</h2></div></div>
    <p>It keeps the shared yardstick learned from many writers for 16 of the 17 directions, and along the one main direction it uses this person&apos;s own spread, so a consistent signer gets a stricter check and a variable signer a more tolerant one.</p>
    <svg className="chart-svg r1waw-diagram" viewBox="0 0 520 120" role="img" aria-label="Shared yardstick for 16 directions, the person's own spread on the main direction">
      {bars.map(i => <g key={i}><rect x={20 + i * 29} y={i === 0 ? 18 : 48} width={20} height={i === 0 ? 70 : 40} rx={3} className={i === 0 ? "bar-own" : "bar-shared"} /></g>)}
      <text x={20} y={108}>u<tspan baseline-shift="sub" fontSize="9">1</tspan> · own spread σ<tspan baseline-shift="sub" fontSize="9">w</tspan></text>
      <text x={320} y={108}>16 directions · shared</text>
    </svg>
    <div className="formula" role="img" aria-label="W J equals W G plus, in brackets, sigma w to the minus 1 minus lambda 1 to the minus one half, times u 1 u 1 transposed">
      <math display="block">
        <msub><mi>W</mi><mi>J</mi></msub><mo>=</mo><msub><mi>W</mi><mi>G</mi></msub><mo>+</mo>
        <mrow><mo>(</mo>
          <msubsup><mi>σ</mi><mi>w</mi><mrow><mo>−</mo><mn>1</mn></mrow></msubsup><mo>−</mo>
          <msubsup><mi>λ</mi><mn>1</mn><mrow><mo>−</mo><mn>1</mn><mo lspace="0" rspace="0">/</mo><mn>2</mn></mrow></msubsup>
        <mo>)</mo></mrow>
        <msub><mi>u</mi><mn>1</mn></msub><msubsup><mi>u</mi><mn>1</mn><mo>⊤</mo></msubsup>
      </math>
    </div>
    <p className="chart-note">{WG} whitens the 17 difference measures with the pooled within-writer covariance; {U1} is its main direction and {L1} the pooled spread along it. The person&apos;s own spread <math><msub><mi>σ</mi><mi>w</mi></msub></math> is one number, so 12 references are enough to estimate it.</p>
  </section>;
}
