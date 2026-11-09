import { useEffect, useRef, useState } from "react";
import { checkQuality, getImageBlob, sampleUrl, verify } from "../api/client";
import Button from "../components/Button";
import Dropzone from "../components/Dropzone";
import ExpertEvidence from "../components/ExpertEvidence";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import CompareViewer, { type CompareMode } from "../components/viewer/CompareViewer";
import ReferenceStrip from "../components/viewer/ReferenceStrip";
import SignatureViewer, { type ViewerSource } from "../components/viewer/SignatureViewer";
import Tag from "../components/Tag";
import VerdictCard from "../components/VerdictCard";
import { initials, pad2 } from "../format";
import type { Go } from "../navigation";
import { useSettings, useTerms } from "../state/settings";
import type { PersonDetail, Quality, VerifyResult } from "../types";

type Props = { person: PersonDetail; go: Go; changePerson: () => void };
type Upload = { file: File; url: string; quality: Quality | null; error: string | null };

function useUpload() {
  const [upload, setUpload] = useState<Upload | null>(null);
  const url = useRef<string | null>(null);
  const release = () => { if (url.current) URL.revokeObjectURL(url.current); url.current = null; };
  useEffect(() => release, []);
  function choose(file: File) {
    release();
    const next: Upload = { file, url: URL.createObjectURL(file), quality: null, error: null };
    url.current = next.url;
    setUpload(next);
    checkQuality(file)
      .then(q => setUpload(u => u && u.file === file ? { ...u, quality: q } : u))
      .catch((e: unknown) => setUpload(u => u && u.file === file ? { ...u, error: e instanceof Error ? e.message : String(e) } : u));
  }
  return { upload, choose, clear: () => { release(); setUpload(null); } };
}

/** One scrolling page: case form, evidence, verdict, the 12 references and every evidence panel (A–H). */
export default function VerifyWorkspace({ person, go, changePerson }: Props) {
  const settings = useSettings();
  const t = useTerms();
  const first = useUpload(), second = useUpload();
  const [caseTitle, setCaseTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [second_, setSecond] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ref, setRef] = useState(1);
  const secondInput = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<CompareMode>("side");
  const reference = (n: number): ViewerSource => ({ src: sampleUrl(person.id, n), label: `Reference ${pad2(n)}`, fileName: `Reference sample ${n} of 12`, load: () => getImageBlob(sampleUrl(person.id, n)) });

  const up = first.upload;
  const ready = !!up && !!up.quality?.ok;
  const blockReason = !up ? "Verification is disabled until a clear image is added." : up.error ? up.error : !up.quality ? "Checking image quality…" : !up.quality.ok ? up.quality.issues[0]?.message : null;

  async function run(file: File, title: string) {
    return verify({ personId: person.id, file, strictness: settings.strictness, uncertain: settings.uncertain, caseTitle: title, notes });
  }
  async function start() {
    if (!up || !ready) return;
    setState("running"); setError(null); setSecond(null); second.clear();
    try {
      const r = await run(up.file, caseTitle);
      setResult(r); setState("done");
      setRef(r.comparisons.reduce((a, b) => b.value > a.value ? b : a).reference);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); setState("idle"); }
  }
  async function runSecond(file: File) {
    second.choose(file);
    try { setSecond(await run(file, `${caseTitle || "Check"} (second sample)`)); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }
  function reset() { first.clear(); second.clear(); setResult(null); setSecond(null); setState("idle"); setError(null); setCaseTitle(""); setNotes(""); }

  // Shortcuts: V run verification, 1–9 select a reference, O overlay. Ignored while typing.
  const keys = useRef({ start, mode });
  keys.current = { start, mode };
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement;
      if (e.ctrlKey || e.metaKey || e.altKey || el.closest("input, textarea, select, [contenteditable]")) return;
      const k = e.key.toLowerCase(), cur = keys.current;
      if (k === "v") { e.preventDefault(); void cur.start(); }
      else if (k === "o") { e.preventDefault(); setMode(cur.mode === "overlay" ? "side" : "overlay"); }
      else if (/^[1-9]$/.test(k)) { e.preventDefault(); setRef(+k); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const actions = (r: VerifyResult) => <><Button secondary icon="history" onClick={() => go("CaseDetail", { caseId: r.case_id })}>Open Case</Button><Button secondary icon="print" onClick={() => go("Evidence Report", { caseId: r.case_id })}>Export Evidence Report</Button><Button secondary icon="verify" onClick={reset}>New Check</Button></>;

  return <div className="page"><PageHeader title="Verification workspace" description={`Compare one Questioned Signature against a ${t.person}'s 12 genuine Reference Samples.`} action={<div className="header-actions"><button className="client-chip" onClick={() => go("Person Profile", { personId: person.id, label: person.name })}><span>{initials(person.name)}</span><div><strong>{person.name}</strong><small>{person.external_id || "—"} · Signature Profile ready</small></div><Icon name="chevron" size={14} /></button><Button secondary onClick={changePerson}>Change</Button></div>} />
    <div className="verify-grid">
      <section className="panel query-panel"><div className="panel-head"><div><span>CASE</span><h2>Check details</h2></div></div>
        <label className="compact-field"><span>CASE REFERENCE</span><input value={caseTitle} onChange={e => setCaseTitle(e.target.value)} placeholder="Optional case reference" /></label>
        <label className="compact-field"><span>NOTES</span><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional examination notes" /></label>
        <Dropzone file={up?.file ?? null} previewUrl={up?.url ?? null} onFile={f => { first.choose(f); setResult(null); setSecond(null); setState("idle"); }} />
        {up?.quality && (up.quality.ok
          ? <div className="quality-check"><Icon name="check" size={13} /><span><strong>Image quality: Good</strong>Ink covers {(up.quality.ink_fraction * 100).toFixed(1)}% of the image</span></div>
          : <div className="quality-check bad"><Icon name="alert" size={13} /><span><strong>Image cannot be used</strong>{up.quality.issues.map(i => i.message).join(" ")}</span></div>)}
        <Button icon="scan" disabled={!ready || state === "running"} title={blockReason ?? undefined} onClick={start}>{state === "running" ? "Running verification…" : "Run verification"}</Button>
        {blockReason && <p className="input-hint">{blockReason}</p>}
        <p className="input-hint">Strictness: {settings.strictness} · Uncertain Zone: {settings.uncertain}</p>
        <p className="input-hint shortcut-hint"><Icon name="keyboard" size={14} /> <kbd>V</kbd> verify <kbd>1</kbd>–<kbd>9</kbd> reference <kbd>O</kbd> overlay</p>
      </section>
      <section className="panel evidence-panel"><div className="panel-head"><div><span>EVIDENCE</span><h2>Questioned and Reference Samples</h2></div><Tag tone={up ? "ready" : "neutral"}>{up ? "IMAGE READY" : "AWAITING IMAGE"}</Tag></div>
        {up ? <CompareViewer mode={mode} onMode={setMode} a={{ src: up.url, label: "Questioned signature", fileName: up.file.name, quality: up.quality, load: () => Promise.resolve(up.file) }} b={reference(ref)} />
          : <div className="evidence-viewer"><div><span>QUESTIONED SIGNATURE</span><div className="evidence-empty"><Icon name="upload" /><small>Add an image in the Case panel</small></div></div><SignatureViewer {...reference(ref)} /></div>}
      </section>
      <section className={`panel result-card ${result ? result.verdict.toLowerCase().replace(" ", "-") : ""}`}>
        {state === "running" ? <div className="loading"><i /><strong>Comparing with 12 Reference Samples</strong><span>Measuring this {t.person}&apos;s natural variation.</span></div>
          : result ? <VerdictCard result={result} actions={actions(result)} uncertainAction={<><input ref={secondInput} className="hidden" type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) void runSecond(f); e.target.value = ""; }} /><Button secondary icon="enrol" onClick={() => secondInput.current?.click()}>Request another sample</Button></>} />
          : error ? <div className="empty-result"><Icon name="alert" size={30} /><strong>Verification failed</strong><span>{error}</span></div>
          : <div className="empty-result"><Icon name="verify" size={30} /><strong>No Verdict yet</strong><span>Run verification to see Confidence, reason, and next step.</span></div>}
      </section>
    </div>
    <section className="panel reference-panel"><div className="panel-head"><div><span>REFERENCE SAMPLES</span><h2>12 genuine signatures of {person.name}</h2></div>{result && <span className="chart-note">Bars: model value per comparison (green ≥ 0, red &lt; 0)</span>}</div>
      <ReferenceStrip personId={person.id} selected={ref} onSelect={setRef} comparisons={result?.comparisons} /></section>
    {second_ && second.upload && <section className={`panel result-card second-result ${second_.verdict.toLowerCase().replace(" ", "-")}`}><div className="second-layout"><div><span className="mini-label">SECOND SAMPLE</span><SignatureViewer src={second.upload.url} label="Second sample" fileName={second.upload.file.name} quality={second.upload.quality} /></div><div><VerdictCard result={second_} label="SECOND SAMPLE · ADVISORY VERDICT" actions={actions(second_)} /></div></div></section>}
    {result && <ExpertEvidence result={result} person={person} questioned={up?.file ?? null} reference={ref} />}
  </div>;
}
