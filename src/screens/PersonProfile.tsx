import Icon from "../components/Icon";
import Button from "../components/Button";
import Tag from "../components/Tag";
import PageHeader from "../components/PageHeader";
import Signature from "../components/Signature";
import ConsistencyGauge from "../components/ConsistencyGauge";
export default function PersonProfile({ verify, reenrol, expert }: { verify: () => void; reenrol: () => void; expert: boolean }) {
  return <div className="page"><PageHeader title="Amira Rahman" description="Person CL-0047 · Signature Profile ready" action={<div className="header-actions"><Button secondary onClick={reenrol}>Update samples</Button><Button secondary>Archive</Button><Button danger>Delete</Button><Button icon="verify" onClick={verify}>Verify a signature</Button></div>} />
    <div className="profile-layout"><section className="panel"><div className="panel-head"><div><span>REFERENCE SIGNATURES</span><h2>12 genuine samples</h2></div><Tag tone="ready">PROFILE READY</Tag></div><div className="reference-grid">{Array.from({ length: 12 }, (_, i) => <div key={i}><Signature seed={i} /><span>Reference {String(i + 1).padStart(2, "0")}</span></div>)}</div></section>
      <section className="panel profile-summary"><div className="panel-head"><div><span>SIGNATURE CONSISTENCY</span><h2>How much Amira's signature naturally changes</h2></div></div><ConsistencyGauge /><div className="plain-explanation"><Icon name="help" /><p>Amira signs quite consistently, so checks for this person will be stricter.</p></div><dl><div><dt>Enrolled</dt><dd>14 February 2025</dd></div><div><dt>Reference Samples</dt><dd>12</dd></div><div><dt>Checks</dt><dd>28</dd></div><div><dt>Profile status</dt><dd><Tag tone="ready">READY</Tag></dd></div>{expert && <><div><dt>Reference pairs</dt><dd>66</dd></div><div><dt>Consistency value</dt><dd>0.71</dd></div></>}</dl></section></div>
  </div>;
}
