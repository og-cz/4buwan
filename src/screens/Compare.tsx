import { useEffect, useRef, useState } from "react";
import { addAttachments, checkQuality, listChecks, preprocess } from "../api/client";
import Button from "../components/Button";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Annotator, { type Pin } from "../components/viewer/Annotator";
import CompareViewer from "../components/viewer/CompareViewer";
import useAsync from "../state/useAsync";
import type { Go } from "../navigation";
import type { Preprocessed, Quality } from "../types";

type Item = { id: number; file: File; url: string; quality?: Quality; model?: Preprocessed };
const MAX = 6;

/** Manual examination of 2–6 images without a profile. Shows no verdict. */
export default function Compare({ go, notify }: { go: Go; notify: (m: string) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [a, setA] = useState(0), [b, setB] = useState(1), [annotate, setAnnotate] = useState(0);
  const [pins, setPins] = useState<Record<number, Pin[]>>({});
  const [caseId, setCaseId] = useState(""), [note, setNote] = useState(""), [saving, setSaving] = useState(false), [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach(u => URL.revokeObjectURL(u)), []);
  const cases = useAsync(() => listChecks(), []);

  function add(files: File[]) {
    const next = files.slice(0, MAX - items.length).map((file, i) => ({ id: Date.now() + i, file, url: URL.createObjectURL(file) }));
    urls.current.push(...next.map(n => n.url));
    setItems(cur => [...cur, ...next]);
    next.forEach(n => {
      checkQuality(n.file).then(q => setItems(cur => cur.map(x => x.id === n.id ? { ...x, quality: q } : x))).catch(() => undefined);
      preprocess(n.file).then(m => setItems(cur => cur.map(x => x.id === n.id ? { ...x, model: m } : x))).catch(() => undefined);
    });
  }
  function remove(id: number) {
    setItems(cur => cur.filter(x => x.id !== id));
    setA(0); setB(1); setAnnotate(0);
  }
  async function attach() {
    if (!caseId) return;
    setSaving(true); setError(null);
    const pinText = items.flatMap((it, i) => (pins[it.id] ?? []).map(p => `Image ${i + 1} pin ${p.id} (x ${p.x}, y ${p.y}): ${p.note || "no note"}`));
    try {
      await addAttachments(caseId, items.map(i => i.file), [note.trim(), ...pinText].filter(Boolean).join("\n"));
      notify(`Attached ${items.length} image${items.length === 1 ? "" : "s"} to ${caseId}.`);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  }

  const A = items[a], B = items[b] ?? items[1], N = items[annotate];
  const source = (it: Item, i: number) => ({ src: it.url, label: `Image ${i + 1}`, fileName: it.file.name, quality: it.quality, load: () => Promise.resolve(it.file as Blob) });
  return <div className="page"><PageHeader title="Compare" description="Examine two to six signature images side by side, without a Signature Profile." action={<Button icon="upload" disabled={items.length >= MAX} onClick={() => input.current?.click()}>Add images</Button>} />
    <div className="plain-explanation"><Icon name="help" /><p><strong>Manual comparison. Run Verify for a model verdict.</strong> Nothing on this page is scored by the model; it shows the images, the cleaned 100 × 100 stage and the stroke-direction map for each.</p></div>
    <input ref={input} className="hidden" type="file" accept="image/*" multiple onChange={e => { add(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
    {items.length < 2 && <section className="panel batch-upload" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); add(Array.from(e.dataTransfer.files)); }}><div><Icon name="layers" size={28} /><h2>Add two to six images</h2><p>Drop images here, or choose files. For example two signatures from the same document set.</p><Button icon="upload" onClick={() => input.current?.click()}>Choose images</Button></div></section>}
    {items.length > 0 && <section className="panel"><div className="panel-head"><div><span>Images</span><h2>{items.length} of {MAX}</h2></div></div>
      <div className="compare-items">{items.map((it, i) => <figure key={it.id} className="compare-item"><div className="ref-thumb"><img src={it.url} alt={`Image ${i + 1}`} /></div>
        <figcaption><strong>Image {i + 1}</strong><span className="viewer-file">{it.file.name}</span></figcaption>
        <div className="compare-item-actions"><button className={`viewer-tool text ${a === i ? "active" : ""}`} onClick={() => setA(i)} aria-pressed={a === i}>Left</button><button className={`viewer-tool text ${b === i ? "active" : ""}`} onClick={() => setB(i)} aria-pressed={b === i}>Right</button><button className="viewer-tool" aria-label={`Remove image ${i + 1}`} onClick={() => remove(it.id)}><Icon name="close" size={16} /></button></div>
      </figure>)}</div></section>}
    {A && B && A !== B && <section className="panel"><div className="panel-head"><div><span>Compare</span><h2>Image {a + 1} and image {b + 1}</h2></div></div><CompareViewer a={source(A, a)} b={source(B, items.indexOf(B))} /></section>}
    {items.length > 0 && <section className="panel"><div className="panel-head"><div><span>What the model would see</span><h2>Cleaned stage and stroke directions</h2></div></div>
      <div className="model-views">{items.map((it, i) => <figure key={it.id} className="model-view"><figcaption>Image {i + 1}</figcaption>{it.model ? <div><div className="hog-img"><img src={it.model.stages.S4} alt={`Image ${i + 1} cleaned`} /></div><div className="hog-img"><img src={it.model.hog} alt={`Image ${i + 1} stroke directions`} /></div></div> : <div><span className="skeleton hog-img" /><span className="skeleton hog-img" /></div>}<small>Cleaned 100 × 100 · Stroke directions</small></figure>)}</div></section>}
    {N && <section className="panel"><div className="panel-head"><div><span>Annotate</span><h2>Measure and mark</h2></div><select aria-label="Image to annotate" value={annotate} onChange={e => setAnnotate(+e.target.value)} className="inline-select">{items.map((it, i) => <option key={it.id} value={i}>Image {i + 1} · {it.file.name}</option>)}</select></div>
      <Annotator key={N.id} src={N.url} label={`Image ${annotate + 1}`} pins={pins[N.id] ?? []} setPins={p => setPins({ ...pins, [N.id]: p })} /></section>}
    {items.length > 0 && <section className="panel"><div className="panel-head"><div><span>Attach to case</span><h2>Save these images and notes to a case</h2></div></div>
      <div className="form-grid"><label className="field"><span>Case</span><select value={caseId} onChange={e => setCaseId(e.target.value)}><option value="">Choose a case…</option>{(cases.data ?? []).map(c => <option key={c.id} value={c.id}>{c.case_title || c.id} · {c.name ?? "Deleted profile"}</option>)}</select></label>
        <label className="field"><span>Note</span><input value={note} onChange={e => setNote(e.target.value)} placeholder="Summary of the manual comparison" /></label></div>
      <div className="header-actions"><Button icon="paperclip" disabled={!caseId || saving} onClick={() => void attach()}>{saving ? "Attaching…" : "Attach to case"}</Button>{caseId && <Button secondary onClick={() => go("CaseDetail", { caseId })}>Open case</Button>}</div>
      {error && <p className="input-hint error-text">{error}</p>}
      <p className="input-hint">Pin notes are added to the attachment note. The case timeline records the attachment.</p></section>}
  </div>;
}
