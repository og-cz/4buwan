import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import MethodComparison from "./MethodComparison";
import DatasetCheck from "./DatasetCheck";
export default function ResearchLab() {
  const [tab,setTab]=useState<"methods"|"dataset"|"model">("methods");
  return <div className="research-lab"><div className="research-tabs"><button className={tab==="methods"?"active":""} onClick={()=>setTab("methods")}>Method comparison</button><button className={tab==="dataset"?"active":""} onClick={()=>setTab("dataset")}>Dataset check</button><button className={tab==="model"?"active":""} onClick={()=>setTab("model")}>Model card</button></div>{tab==="methods"?<MethodComparison/>:tab==="dataset"?<DatasetCheck/>:<div className="page"><PageHeader title="Model card" description="What the model does, how it was built, and where it can fail."/><section className="panel model-card"><h2>Writer-adaptive one-class signature verification</h2><p>Uses only genuine samples to learn each Person's natural Signature Consistency. It supports human judgement and does not establish identity on its own.</p><dl><div><dt>Reference Samples</dt><dd>12 per Person</dd></div><div><dt>Difference Measures</dt><dd>17</dd></div><div><dt>Reference pairs</dt><dd>66</dd></div><div><dt>Known limitation</dt><dd>Skilled forgeries may remain close to genuine signatures</dd></div></dl></section></div>}</div>;
}
