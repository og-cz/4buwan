import { useState } from "react";
import Icon from "../components/Icon";
import Button from "../components/Button";
import Tag from "../components/Tag";
import PageHeader from "../components/PageHeader";

export default function BatchCheck() {
  const [loaded, setLoaded] = useState(false);
  return <div className="page"><PageHeader title="Batch Check" description="Check many Questioned Signatures using a CSV mapping each file to a Person ID." action={loaded && <Button icon="save">Export results</Button>} /><section className="panel batch-upload"><div><Icon name="upload" size={26}/><h2>Upload signatures and mapping CSV</h2><p>Choose image files first, then assign Person IDs automatically or in the table.</p><Button onClick={() => setLoaded(true)}>Load demonstration Batch</Button></div></section>{loaded && <section className="panel table-panel"><div className="batch-progress"><span>24 of 24 complete</span><i><em/></i><Tag tone="ready">BATCH COMPLETE</Tag></div><table><thead><tr><th>FILE</th><th>PERSON</th><th>VERDICT</th><th>CONFIDENCE</th><th>FLAGS</th><th/></tr></thead><tbody>{[["scan_001.png","CL-0047","LIKELY GENUINE","86","—"],["scan_002.png","CL-0103","UNCERTAIN","51","Review image"],["scan_003.png","CL-0138","LIKELY FORGED","79","Shape differs"]].map(r=><tr key={r[0]}>{r.map((c,i)=><td key={i}>{i===2?<Tag tone={c==="LIKELY GENUINE"?"ready":c==="UNCERTAIN"?"warn":"bad"}>{c}</Tag>:c}</td>)}<td><Icon name="chevron" size={14}/></td></tr>)}</tbody></table></section>}</div>;
}
