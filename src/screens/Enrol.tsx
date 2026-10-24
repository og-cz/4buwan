import { useEffect, useRef, useState } from "react";
import { checkQuality, enrolPerson, preprocess } from "../api/client";
import Button from "../components/Button";
import ConsistencyGauge from "../components/ConsistencyGauge";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import SignatureImage from "../components/SignatureImage";
import Stepper from "../components/Stepper";
import useAsync from "../state/useAsync";
import { useTerms } from "../state/settings";
import type { Go } from "../navigation";
import type { PersonDetail, Quality } from "../types";

type Slot = { file: File; url: string; quality: Quality | null; error: string | null };
const N = 12;
const stageLabels: [string, "S0" | "S2" | "S3" | "S4"][] = [["Original", "S0"], ["Background removed", "S2"], ["Cropped", "S3"], ["Resized", "S4"]];

export default function Enrol({ go }: { go: Go }) {
  const t = useTerms();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [externalId, setExternalId] = useState("");
  const [slots, setSlots] = useState<(Slot | null)[]>(Array(N).fill(null));
  const [target, setTarget] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<PersonDetail | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  useEffect(() => () => slotsRef.current.forEach(s => s && URL.revokeObjectURL(s.url)), []);

  const good = slots.filter(s => s?.quality?.ok).length;
  const firstGood = slots.find(s => s?.quality?.ok) ?? null;
  const preview = useAsync(() => step === 3 && firstGood ? preprocess(firstGood.file) : Promise.resolve(null), [step, firstGood?.file]);

  function place(files: File[]) {
    const next = [...slots];
    const order = target !== null ? [target, ...next.map((_, i) => i).filter(i => i !== target && !next[i])] : next.map((_, i) => i).filter(i => !next[i]);
    files.slice(0, order.length).forEach((file, k) => {
      const i = order[k];
      const old = next[i];
      if (old) URL.revokeObjectURL(old.url);
      next[i] = { file, url: URL.createObjectURL(file), quality: null, error: null };
      checkQuality(file)
        .then(q => setSlots(cur => cur.map((s, j) => j === i && s?.file === file ? { ...s, quality: q } : s)))
        .catch((e: unknown) => setSlots(cur => cur.map((s, j) => j === i && s?.file === file ? { ...s, error: e instanceof Error ? e.message : String(e) } : s)));
    });
    setSlots(next);
    setTarget(null);
  }

  async function create() {
    setBusy(true); setError(null);
    try {
      setCreated(await enrolPerson(name.trim(), externalId.trim(), slots.map(s => s!.file)));
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }

  const canContinue = step === 1 ? !!name.trim() : step === 2 ? good === N : true;
  const blocked = step === 1 ? "Enter a name to continue." : step === 2 && good < N ? `${N - good} more good sample${N - good === 1 ? "" : "s"} needed. Create profile stays blocked until all 12 pass the quality check.` : null;

  return <div className="page"><PageHeader title={`Enrol a ${t.lower}`} description="Create a Signature Profile using 12 genuine signatures. Forged samples are never needed." />
    <Stepper steps={[`${t.person} details`, "Add signatures", "Preview cleaning", "Create profile"]} current={step} onStep={n => !created && setStep(n)} canOpen={n => !created && (n === 1 || (n >= 2 && !!name.trim() && (n === 2 || good === N)))} />
    <section className="panel wizard-panel">
      {step === 1 && <div className="form-step"><div className="step-title"><span>STEP 1 OF 4</span><h2>{t.person} details</h2><p>Enter the name and ID used by your office.</p></div><div className="form-grid"><label><span>FULL NAME</span><input value={name} onChange={e => setName(e.target.value)} /></label><label><span>{t.idLabel.toUpperCase()}</span><input value={externalId} onChange={e => setExternalId(e.target.value)} /></label></div></div>}
      {step === 2 && <div><div className="step-title"><span>STEP 2 OF 4</span><h2>Add 12 genuine signatures</h2><p>Upload or drop the images in order. Every image is checked immediately. You can select several files at once.</p></div>
        <input ref={input} className="hidden" type="file" accept="image/*" multiple onChange={e => { place(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
        <div className="enrol-counter"><strong>{good} of 12 good samples</strong><span>{good < N ? `${N - good} more needed` : "Ready"}</span><i><em style={{ width: `${good / N * 100}%` }} /></i></div>
        <div className="sample-grid" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); place(Array.from(e.dataTransfer.files)); }}>{slots.map((s, i) => {
          const bad = s && (s.error || (s.quality && !s.quality.ok));
          return <button className={s?.quality?.ok ? "accepted" : bad ? "rejected" : ""} onClick={() => { setTarget(i); input.current?.click(); }} key={i}>
            {!s ? <><Icon name="upload" /><strong>Sample {i + 1}</strong><small>Add signature</small></>
              : bad ? <><Icon name="alert" /><strong>{s.error ? "Check failed" : "Cannot use"}</strong><small>{s.error ?? s.quality?.issues[0]?.message}</small></>
              : <><SignatureImage src={s.url} alt={`Sample ${i + 1}`} /><span>{s.quality ? <><Icon name="check" size={10} />Accepted</> : "Checking…"}</span></>}
          </button>;
        })}</div></div>}
      {step === 3 && <div><div className="step-title"><span>STEP 3 OF 4 · OPTIONAL</span><h2>Preview image cleaning</h2><p>How the model prepares the first sample.</p></div>
        {preview.data ? <div className="cleaning-strip">{stageLabels.map(([label, k]) => <div key={k}><span>{label}</span><SignatureImage src={preview.data!.stages[k]} alt={label} faded={k === "S0"} /><small>{k === "S4" ? "100 × 100" : "Preview"}</small></div>)}</div> : <p className="input-hint">{preview.error ?? "Preparing preview…"}</p>}
        <div className="plain-explanation"><Icon name="help" /><p>Cleaning makes signatures from different scanners easier to compare. It does not change the handwriting.</p></div></div>}
      {step === 4 && <div className="create-profile"><div className="step-title"><span>STEP 4 OF 4</span><h2>{busy ? "Creating Signature Profile…" : created ? "Signature Profile created" : "Ready to create profile"}</h2><p>The profile learns how much this {t.lower}&apos;s genuine signatures naturally vary.</p></div>
        {busy ? <div className="profile-progress"><i /><strong>Checking 66 signature pairs</strong><span>Please keep this window open.</span></div>
          : created ? <><ConsistencyGauge consistency={created.consistency} name={created.name} /><div className="profile-ready"><Icon name="check" /><div><strong>{created.consistency.label}</strong><span>{created.consistency.text}</span></div></div><div className="wizard-done"><Button icon="verify" onClick={() => go("Verify", { personId: created.id })}>Verify a signature for this {t.lower}</Button><Button secondary onClick={() => go("Person Profile", { personId: created.id })}>Open profile</Button></div></>
          : <><div className="profile-ready"><Icon name="check" /><div><strong>{good} good samples for {name}</strong><span>Ready to create this {t.lower}&apos;s Signature Profile.</span></div></div>{error && <p className="input-hint error-text">{error}</p>}</>}
      </div>}
      <div className="wizard-actions"><Button secondary disabled={step === 1 || busy || !!created} onClick={() => setStep(step - 1)}>Back</Button>{blocked && <span className="input-hint">{blocked}</span>}{!created && <Button icon={step === 4 ? "check" : "chevron"} disabled={busy || (step === 4 ? good < N || !name.trim() : !canContinue)} onClick={() => step === 4 ? void create() : setStep(step + 1)}>{step === 4 ? "Create profile" : "Continue"}</Button>}</div>
    </section></div>;
}
