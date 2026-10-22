import { useRef, useState } from "react";
import Icon from "../components/Icon";
import Button from "../components/Button";
import Tag from "../components/Tag";
import PageHeader from "../components/PageHeader";
import Signature from "../components/Signature";
import PersonSearch from "../components/PersonSearch";
import ExpertEvidence from "../components/ExpertEvidence";
import VerdictCard, { type Verdict } from "../components/VerdictCard";
export default function Verify({ onProfile, onEnrol, expert }: { onProfile: () => void; onEnrol: () => void; expert: boolean }) {
  const [client, setClient] = useState<"none" | "ready" | "blocked">("none");
  const [file, setFile] = useState("");
  const [state, setState] = useState<"empty" | "loading" | "result">("empty");
  const verdict: Verdict = "LIKELY GENUINE";
  const input = useRef<HTMLInputElement>(null);
  function run() { if (!file) return; setState("loading"); window.setTimeout(() => setState("result"), 900); }
  if (client === "none") return <div className="page"><PageHeader title="Verify a signature" description="Start by finding the Person whose signature you want to check." /><PersonSearch onSelect={(ready: boolean) => setClient(ready ? "ready" : "blocked")} /></div>;
  if (client === "blocked") return <div className="page"><PageHeader title="Verify a signature" description="This Person cannot be checked yet." /><section className="panel blocked-verify"><span><Icon name="alert" size={24} /></span><div><Tag tone="warn">PROFILE NOT READY</Tag><h2>Complete this Signature Profile first</h2><p>Verification needs 12 accepted genuine Reference Samples. No forged samples are required.</p><div><Button secondary onClick={() => setClient("none")}>Choose another Person</Button><Button icon="enrol" onClick={onEnrol}>Complete enrolment</Button></div></div></section></div>;
  return <div className="page"><PageHeader title="Verification workspace" description="Compare one Questioned Signature against a Person's 12 genuine Reference Samples." action={<button className="client-chip" onClick={onProfile}><span>AR</span><div><strong>Amira Rahman</strong><small>CL-0047 · Signature Profile ready</small></div><Icon name="chevron" size={14} /></button>} />
    <div className="verify-grid">
      <section className="panel query-panel"><div className="panel-head"><div><span>CASE</span><h2>Check details</h2></div></div><label className="compact-field"><span>CASE REFERENCE</span><input defaultValue="CASE-2025-0184" /></label><label className="compact-field"><span>NOTES</span><textarea placeholder="Optional examination notes" /></label><input ref={input} className="hidden" type="file" accept="image/*" onChange={e => { setFile(e.target.files?.[0]?.name || "signature.png"); setState("empty"); }} /><button className={`upload-area ${file ? "loaded" : ""}`} onClick={() => input.current?.click()}>{file ? <><Signature seed={1} /><span>{file}</span></> : <><i><Icon name="upload" /></i><strong>Add Questioned Signature</strong><small>Drop, upload, scan, or crop a document</small></>}</button>{file && <div className="quality-check"><Icon name="check" size={13} /><span><strong>Image quality: Good</strong>Clear ink · one signature · usable size</span></div>}<Button icon="scan" disabled={!file || state === "loading"} onClick={run}>{state === "loading" ? "Running verification…" : "Run verification"}</Button>{!file && <p className="input-hint">Verification is disabled until a clear image is added.</p>}</section>
      <section className="panel evidence-panel"><div className="panel-head"><div><span>EVIDENCE</span><h2>Questioned and Reference Samples</h2></div><Tag tone={file ? "ready" : "neutral"}>{file ? "IMAGE READY" : "AWAITING IMAGE"}</Tag></div><div className="evidence-viewer"><div><span>QUESTIONED SIGNATURE</span>{file ? <Signature seed={1} /> : <div className="evidence-empty"><Icon name="upload" /><small>Add an image in the Case panel</small></div>}</div><div><span>SELECTED REFERENCE · 04</span><Signature seed={1} /></div></div><div className="viewer-tools"><label><input type="checkbox" /> Overlay</label><label><input type="checkbox" defaultChecked /> Zoom/pan synchronised</label><label><input type="checkbox" /> Show cleaned image</label></div><div className="reference-strip">{Array.from({ length: 12 }, (_, i) => <button className={i === 3 ? "active" : ""} key={i}><Signature seed={i} /><span>R{String(i + 1).padStart(2, "0")}</span></button>)}</div></section>
      <section className={`panel result-card ${state === "result" ? verdict.toLowerCase().replace(" ", "-") : ""}`}>{state === "loading" ? <div className="loading"><i /><strong>Comparing with 12 Reference Samples</strong><span>Measuring this Person's natural variation.</span></div> : state === "result" ? <VerdictCard verdict={verdict} /> : <div className="empty-result"><Icon name="verify" size={30} /><strong>No Verdict yet</strong><span>Run verification to see Confidence, reason, and next step.</span></div>}</section>
    </div>
    {state === "result" && <section className="panel comparison"><div className="panel-head"><div><span>SIMPLE EVIDENCE</span><h2>Most and least similar Reference Samples</h2></div></div><div className="comparison-signatures"><div><span>QUESTIONED SIGNATURE</span><Signature seed={1} /></div><div className="similar"><span>MOST SIMILAR · REFERENCE 04</span><Signature seed={1} /></div><div className="different"><span>LEAST SIMILAR · REFERENCE 10</span><Signature seed={2} /></div></div></section>}
    {expert && state === "result" && <ExpertEvidence />}
  </div>;
}
