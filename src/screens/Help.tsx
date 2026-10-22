import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";

export default function Help() {
  return <div className="page"><PageHeader title="Help" description="How Signature Desk works and how to collect reliable evidence."/><div className="help-steps">{[["01","Enrol","Collect 12 genuine Reference Samples."],["02","Profile","Learn the Person's natural Signature Consistency."],["03","Verify","Compare a Questioned Signature with all 12 references."],["04","Decide","Review the Verdict and evidence, then record a human decision."]].map(x=><section className="panel" key={x[0]}><span>{x[0]}</span><Icon name={x[1]==="Enrol"?"enrol":x[1]==="Verify"?"verify":"check"} size={22}/><h2>{x[1]}</h2><p>{x[2]}</p></section>)}</div><section className="panel limitations"><Icon name="alert"/><div><h2>Honest limitations</h2><p>Signature Desk supports, not replaces, human judgement. Skilled forgeries can be close to genuine signatures. Poor scans can hide useful handwriting detail. Use UNCERTAIN when the evidence is not clear.</p></div></section></div>;
}
