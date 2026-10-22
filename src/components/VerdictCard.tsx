
import Button from "./Button";
import Icon from "./Icon";
export type Verdict = "LIKELY GENUINE" | "LIKELY FORGED" | "UNCERTAIN";
export default function VerdictCard({ verdict }: { verdict: Verdict }) {
  const uncertain = verdict === "UNCERTAIN", genuine = verdict === "LIKELY GENUINE";
  return <><div className="result-top"><span className={`verdict-icon ${genuine ? "good" : uncertain ? "warn" : "bad"}`}><Icon name={genuine ? "check" : "alert"} size={26} /></span><div><span>ADVISORY VERDICT</span><strong>{verdict}</strong><small>{genuine ? "Closely matches 10 of the 12 Reference Samples." : uncertain ? "The score is too close to the Decision Line for a clear Verdict." : "Differs from all Reference Samples in overall shape."}</small></div></div><div className="confidence"><div><span>Different</span><span>Uncertain Zone</span><span>Similar</span></div><i><em /><b style={{ left: genuine ? "78%" : uncertain ? "52%" : "24%" }} /></i><p>Confidence: {genuine ? "86" : uncertain ? "51" : "79"} of 100. The shaded area is the Uncertain Zone.</p></div>{uncertain && <div className="next-steps"><strong>Recommended next step</strong><div><Button secondary icon="enrol">Request another sample</Button><Button secondary icon="save">Needs more evidence</Button></div></div>}<div className="result-actions"><Button secondary icon="save">Save to Case</Button><Button secondary icon="print">Export Evidence Report</Button><Button secondary icon="verify">New Check</Button></div><p className="advice"><Icon name="help" size={14} />The tool advises; a human makes the final decision.</p></>;
}
