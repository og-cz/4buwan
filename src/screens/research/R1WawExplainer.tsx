import { OUR_METHOD_LONG } from "../../methods";

/** Mini diagram: the shared yardstick keeps 16 directions; the person's own spread replaces the main one. */
export default function R1WawExplainer() {
  const bars = Array.from({ length: 17 }, (_, i) => i);
  return <section className="panel r1waw"><div className="r1waw-main"><div className="panel-head"><div><span>What R1-WAW does</span><h2>{OUR_METHOD_LONG}</h2></div></div>
    <p>It keeps the shared yardstick learned from many writers for 16 of the 17 directions, and along the one main direction it uses this person&apos;s own spread, so a consistent signer gets a stricter check and a variable signer a more tolerant one.</p>
    <svg className="chart-svg r1waw-diagram" viewBox="0 0 520 120" role="img" aria-label="Shared yardstick for 16 directions, the person's own spread on the main direction">
      {bars.map(i => <g key={i}><rect x={20 + i * 29} y={i === 0 ? 18 : 48} width={20} height={i === 0 ? 70 : 40} rx={3} className={i === 0 ? "bar-own" : "bar-shared"} /></g>)}
      <text x={20} y={108}>u₁ · own spread σ_w</text>
      <text x={320} y={108}>16 directions · shared</text>
    </svg>
    <code className="formula">W = W_G + (σ_w⁻¹ − λ₁^(−½)) u₁u₁ᵀ</code>
    <p className="chart-note">W_G whitens the 17 difference measures with the pooled within-writer covariance; u₁ is its main direction and λ₁ the pooled spread along it. One number per person, so 12 references are enough to estimate it.</p></div>
    <aside className="side-facts"><span>At a glance</span><dl>
      <div><dt>Per-person parameters</dt><dd>1, the person&apos;s spread along the main direction</dd></div>
      <div><dt>Shared directions</dt><dd>16 of 17, learned from 142 development writers</dd></div>
      <div><dt>Enrolment</dt><dd>12 genuine signatures, giving 66 reference pairs</dd></div>
      <div><dt>Classifier</dt><dd>One-class SVM trained on genuine pairs only</dd></div>
      <div><dt>Forgeries needed</dt><dd>None, at enrolment or at any later step</dd></div>
    </dl></aside>
  </section>;
}
