import { useRef, useState } from "react";
import Button from "../components/Button";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Tag from "../components/Tag";
import { ClientSearch, ConsistencyGauge, Result, Signature, type DemoVerdict } from "./mock";

/** Demo: client profile (example content). */
export function DecoyProfile({ canDelete, verify, reenrol }: { canDelete: boolean; verify: () => void; reenrol: () => void }) {
  return <div className="page"><PageHeader title="Client A" description="Client CL-0047 · Signature profile ready" action={<div className="header-actions"><Button secondary onClick={reenrol}>Re-enrol</Button>{canDelete && <Button danger>Delete profile</Button>}<Button icon="verify" onClick={verify}>Verify a signature</Button></div>} />
    <div className="profile-layout"><section className="panel"><div className="panel-head"><div><span>REFERENCE SIGNATURES</span><h2>12 genuine samples</h2></div><Tag tone="ready">PROFILE READY</Tag></div><div className="reference-grid">{Array.from({ length: 12 }, (_, i) => <div key={i}><Signature seed={i} /><span>Reference {String(i + 1).padStart(2, "0")}</span></div>)}</div></section>
      <section className="panel profile-summary"><div className="panel-head"><div><span>SIGNATURE CONSISTENCY</span><h2>How much this client&apos;s signature naturally changes</h2></div></div><ConsistencyGauge /><div className="plain-explanation"><Icon name="help" /><p>Client A signs quite consistently, so the system checks new signatures more strictly than it would for a naturally variable signer.</p></div><dl><div><dt>Enrolled</dt><dd>14 February 2025</dd></div><div><dt>Enrolled by</dt><dd>Demo Verifier</dd></div><div><dt>Accepted samples</dt><dd>12</dd></div><div><dt>Profile status</dt><dd><Tag tone="ready">READY</Tag></dd></div></dl></section></div>
  </div>;
}

/** Demo: verify a signature. The result is chosen with the DEMO RESULT buttons, not computed. */
export function DecoyVerify({ onProfile, onEnrol }: { onProfile: () => void; onEnrol: () => void }) {
  const [client, setClient] = useState<"none" | "ready" | "blocked">("none");
  const [file, setFile] = useState("");
  const [state, setState] = useState<"empty" | "loading" | "result">("empty");
  const [verdict, setVerdict] = useState<DemoVerdict>("LIKELY GENUINE");
  const input = useRef<HTMLInputElement>(null);
  function run() { if (!file) return; setState("loading"); window.setTimeout(() => setState("result"), 900); }
  if (client === "none") return <div className="page"><PageHeader title="Verify a signature" description="Start by finding the client whose signature you want to check." /><ClientSearch onSelect={ready => setClient(ready ? "ready" : "blocked")} /></div>;
  if (client === "blocked") return <div className="page"><PageHeader title="Verify a signature" description="This client cannot be checked yet." /><section className="panel blocked-verify"><span><Icon name="alert" size={24} /></span><div><Tag tone="warn">PROFILE NOT READY</Tag><h2>Complete this client&apos;s signature profile first</h2><p>Verification needs 12 accepted genuine signatures. No forged samples are required.</p><div><Button secondary onClick={() => setClient("none")}>Choose another client</Button><Button icon="enrol" onClick={onEnrol}>Complete enrolment</Button></div></div></section></div>;
  return <div className="page"><PageHeader title="Verify a signature" description="Checking against Client A's 12 genuine reference signatures." action={<button className="client-chip" onClick={onProfile}><span>CA</span><div><strong>Client A</strong><small>CL-0047 · Profile ready</small></div><Icon name="chevron" size={14} /></button>} />
    <div className="decoy-verify-grid"><section className="panel query-panel"><div className="panel-head"><div><span>QUESTIONED SIGNATURE</span><h2>Add the signature to check</h2></div></div><input ref={input} className="hidden" type="file" accept="image/*" onChange={e => { setFile(e.target.files?.[0]?.name || "signature.png"); setState("empty"); }} />
      <button className={`upload-area ${file ? "loaded" : ""}`} onClick={() => input.current?.click()}>{file ? <><Signature seed={1} /><span>{file}</span></> : <><i><Icon name="upload" /></i><strong>Upload or scan signature</strong><small>PNG, JPG or TIFF</small></>}</button>
      <div className="demo-outcomes"><span>DEMO RESULT</span>{(["LIKELY GENUINE", "UNCERTAIN", "LIKELY FORGED"] as DemoVerdict[]).map(v => <button className={verdict === v ? "active" : ""} onClick={() => setVerdict(v)} key={v}>{v.replace("LIKELY ", "")}</button>)}</div>
      <Button icon="scan" disabled={!file || state === "loading"} onClick={run}>{state === "loading" ? "Checking signature…" : "Check signature"}</Button>{!file && <p className="input-hint">Add one clear signature image to continue.</p>}</section>
      <section className={`panel result-card ${state === "result" ? verdict.toLowerCase().replace(" ", "-") : ""}`}>{state === "loading" ? <div className="loading"><i /><strong>Comparing with 12 references</strong><span>This usually takes less than a second.</span></div> : state === "result" ? <Result verdict={verdict} /> : <div className="empty-result"><Icon name="verify" size={30} /><strong>No result yet</strong><span>The result and plain-language reason will appear here after checking.</span></div>}</section></div>
    {state === "result" && <section className="panel comparison"><div className="panel-head"><div><span>VISUAL COMPARISON</span><h2>Questioned signature and reference samples</h2></div></div><div className="comparison-signatures"><div><span>QUESTIONED</span><Signature seed={1} /></div><div className="similar"><span>MOST SIMILAR · REFERENCE 04</span><Signature seed={1} /></div><div className="different"><span>LEAST SIMILAR · REFERENCE 10</span><Signature seed={2} /></div></div></section>}
  </div>;
}

/** Demo: the enrolment wizard. Clicking empty sample slots fills them. */
export function DecoyEnrol() {
  const [step, setStep] = useState(1);
  const [accepted, setAccepted] = useState(9);
  const [loading, setLoading] = useState(false);
  function next() { if (step === 4) { setLoading(true); window.setTimeout(() => setLoading(false), 1000); } else setStep(step + 1); }
  return <div className="page"><PageHeader title="Enrol a client" description="Create a signature profile using 12 genuine signatures. Forged samples are never needed." />
    <div className="wizard-steps">{["Client details", "Add signatures", "Preview cleaning", "Create profile"].map((s, i) => <button className={step === i + 1 ? "active" : step > i + 1 ? "done" : ""} onClick={() => setStep(i + 1)} key={s}><i>{step > i + 1 ? <Icon name="check" size={12} /> : i + 1}</i><span>{s}</span></button>)}</div>
    <section className="panel wizard-panel">
      {step === 1 && <div className="form-step"><div className="step-title"><span>STEP 1 OF 4</span><h2>Client details</h2><p>Enter the name and ID used by your office.</p></div><div className="form-grid"><label><span>FULL NAME</span><input defaultValue="Client A" /></label><label><span>CLIENT ID</span><input defaultValue="CL-0047" /></label><label><span>CONTACT (OPTIONAL)</span><input placeholder="Phone or email" /></label></div></div>}
      {step === 2 && <div><div className="step-title"><span>STEP 2 OF 4</span><h2>Add 12 genuine signatures</h2><p>Scan, upload, or drop each signature. Every image is checked immediately.</p></div><div className="enrol-counter"><strong>{accepted} of 12 accepted</strong><span>{12 - accepted} more needed</span><i><em style={{ width: `${accepted / 12 * 100}%` }} /></i></div><div className="sample-grid">{Array.from({ length: 12 }, (_, i) => <button className={i < accepted ? "accepted" : i === accepted ? "rejected" : ""} onClick={() => i >= accepted && setAccepted(Math.min(12, accepted + 1))} key={i}>{i < accepted ? <><Signature seed={i} /><span><Icon name="check" size={10} />Accepted</span></> : i === accepted ? <><Icon name="alert" /><strong>Too faint</strong><small>Scan again with darker ink</small></> : <><Icon name="upload" /><strong>Sample {i + 1}</strong><small>Add signature</small></>}</button>)}</div></div>}
      {step === 3 && <div><div className="step-title"><span>STEP 3 OF 4 · OPTIONAL</span><h2>Preview image cleaning</h2><p>See how the system removes the background and prepares one signature.</p></div><div className="cleaning-strip">{["Original", "Background removed", "Cropped", "Resized"].map((s, i) => <div key={s}><span>{s}</span><Signature seed={1} faded={i === 0} /><small>{i === 3 ? "Standard size" : "Preview"}</small></div>)}</div><div className="plain-explanation"><Icon name="help" /><p>Cleaning makes signatures from different scanners easier to compare. It does not change the handwriting.</p></div></div>}
      {step === 4 && <div className="create-profile"><div className="step-title"><span>STEP 4 OF 4</span><h2>{loading ? "Creating signature profile…" : "Ready to create profile"}</h2><p>The profile learns how much this client&apos;s genuine signatures naturally vary.</p></div>{loading ? <div className="profile-progress"><i /><strong>Checking 66 signature pairs</strong><span>Please keep this window open.</span></div> : <><ConsistencyGauge /><div className="profile-ready"><Icon name="check" /><div><strong>12 accepted samples</strong><span>Ready to create this client&apos;s signature profile.</span></div></div></>}</div>}
      <div className="wizard-actions"><Button secondary disabled={step === 1} onClick={() => setStep(step - 1)}>Back</Button><Button icon={step === 4 ? "check" : "chevron"} disabled={step === 2 && accepted < 12} onClick={next}>{step === 4 ? "Create profile" : "Continue"}</Button></div>
    </section></div>;
}
