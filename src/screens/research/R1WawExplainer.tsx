import { OUR_METHOD_LONG } from "../../methods";

/** Inline symbols for the explanation text. */
const WG = <math><msub><mi>W</mi><mi>G</mi></msub></math>;
const U1 = <math><msub><mi>u</mi><mn>1</mn></msub></math>;
const L1 = <math><msub><mi>λ</mi><mn>1</mn></msub></math>;

/** Mini diagram: the shared yardstick keeps 16 directions; the person's own spread replaces the main one. */
export default function R1WawExplainer() {
  const bars = Array.from({ length: 17 }, (_, i) => i);
  return <section className="panel r1waw"><div className="panel-head"><div><span>What R1-WAW does</span><h2>{OUR_METHOD_LONG}</h2></div></div>
    <p>It keeps the shared yardstick learned from many writers for 16 of the 17 directions, and along the one main direction it uses this person&apos;s own spread, strengthened by an adaptation strength η = 3, so a consistent signer gets a stricter check and a variable signer a more tolerant one.</p>
    <svg className="chart-svg r1waw-diagram" viewBox="0 0 520 120" role="img" aria-label="Shared yardstick for 16 directions, the person's own spread on the main direction">
      {bars.map(i => <g key={i}><rect x={20 + i * 29} y={i === 0 ? 18 : 48} width={20} height={i === 0 ? 70 : 40} rx={3} className={i === 0 ? "bar-own" : "bar-shared"} /></g>)}
      <text x={20} y={108}>u<tspan baseline-shift="sub" fontSize="9">1</tspan> · own spread σ<tspan baseline-shift="sub" fontSize="9">w</tspan></text>
      <text x={320} y={108}>16 directions · shared</text>
    </svg>
    <div className="formula" role="img" aria-label="W J equals W G plus, in brackets, sigma eff to the minus 1 minus lambda 1 to the minus one half, times u 1 u 1 transposed; sigma eff squared equals lambda 1 times, in brackets, sigma w squared over lambda 1, to the power eta">
      <math display="block">
        <msub><mi>W</mi><mi>J</mi></msub><mo>=</mo><msub><mi>W</mi><mi>G</mi></msub><mo>+</mo>
        <mrow><mo>(</mo>
          <msubsup><mi>σ</mi><mtext>eff</mtext><mrow><mo>−</mo><mn>1</mn></mrow></msubsup><mo>−</mo>
          <msubsup><mi>λ</mi><mn>1</mn><mrow><mo>−</mo><mn>1</mn><mo lspace="0" rspace="0">/</mo><mn>2</mn></mrow></msubsup>
        <mo>)</mo></mrow>
        <msub><mi>u</mi><mn>1</mn></msub><msubsup><mi>u</mi><mn>1</mn><mo>⊤</mo></msubsup>
        <mo>,</mo><mspace width="1em" />
        <msubsup><mi>σ</mi><mtext>eff</mtext><mn>2</mn></msubsup><mo>=</mo><msub><mi>λ</mi><mn>1</mn></msub>
        <msup><mrow><mo>(</mo><mfrac><msubsup><mi>σ</mi><mi>w</mi><mn>2</mn></msubsup><msub><mi>λ</mi><mn>1</mn></msub></mfrac><mo>)</mo></mrow><mi>η</mi></msup>
      </math>
    </div>
    <p className="chart-note">{WG} whitens the 17 difference measures with the pooled within-writer covariance; {U1} is its main direction and {L1} the pooled spread along it. The person&apos;s own spread <math><msub><mi>σ</mi><mi>w</mi></msub></math> is one number, so 12 references are enough to estimate it; η = 3 was chosen on the development writers for the one-class form (η = 1 is the first form).</p>
    <h3>R1-WAW-V: how the app scores a signature</h3>
    <p>The app keeps R1-WAW&apos;s main direction {U1} and the person&apos;s own statistics along it, and drops the one-class SVM. Each pair of signatures gets one level <math><mi>t</mi></math> along {U1} over the 12 measures that compare the two HOG vectors; a larger level means a more different pair. A questioned signature is judged at its closest reference, one-sidedly, in the person&apos;s own units:</p>
    <div className="formula" role="img" aria-label="z equals minus, in brackets, the smallest t k minus m w, divided by sigma w">
      <math display="block">
        <mi>z</mi><mo>=</mo><mo>−</mo>
        <mfrac><mrow><munder><mo movablelimits="true">min</mo><mi>k</mi></munder><msub><mi>t</mi><mi>k</mi></msub><mo>−</mo><msub><mi>m</mi><mi>w</mi></msub></mrow><msub><mi>σ</mi><mi>w</mi></msub></mfrac>
      </math>
    </div>
    <p className="chart-note"><math><msub><mi>m</mi><mi>w</mi></msub></math> and <math><msub><mi>σ</mi><mi>w</mi></msub></math> are the mean and spread of the person&apos;s 66 reference pairs along {U1} (η = 1, strict whitening). Because every score is in its person&apos;s own units, one pair of thresholds serves every person. Under writer-level cross-validation on the development writers it reached a per-writer AUC of 0.930 against 0.857 for the one-class form; it has not yet been confirmed on new writers.</p>
  </section>;
}
