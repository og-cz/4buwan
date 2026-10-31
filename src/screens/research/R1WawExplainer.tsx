import { OUR_METHOD_LONG } from "../../methods";

/** Mini diagram: the person's own spread on the main direction u₁, the shared yardstick on the other 16. */
export default function R1WawExplainer() {
  return <section className="panel r1waw"><div className="panel-head"><div><span>WHAT R1-WAW DOES</span><h2>{OUR_METHOD_LONG}</h2></div></div>
    <p>It keeps the shared yardstick learned from many writers for 16 of the 17 directions, and along the one main direction it uses this person&apos;s own spread. A consistent signer gets a stricter check; a variable signer a more tolerant one.</p>
    <div className="r1waw-diagram" role="img" aria-label="One direction uses the person's own spread, sixteen use the shared yardstick">
      <div className="r1waw-own"><i /><small>u₁ · own spread σ_w</small></div>
      <div className="r1waw-shared"><div>{Array.from({ length: 16 }, (_, k) => <i key={k} />)}</div><small>16 directions · shared yardstick</small></div>
    </div>
    <code className="formula">W = W_G + (σ_w⁻¹ − λ₁^(−½)) u₁u₁ᵀ</code>
    <p className="chart-note">W_G whitens the 17 difference measures with the pooled within-writer covariance; u₁ is its main direction and λ₁ the pooled spread along it. One number per person, so 12 references are enough to estimate it.</p>
  </section>;
}
