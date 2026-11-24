import { useRef, useState } from "react";
import { exportUrl, importWorkspace } from "../api/client";
import Button from "../components/Button";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import { useDataMode } from "../state/dataMode";
import { useTerms } from "../state/settings";
import type { Go } from "../navigation";
import type { ImportResult } from "../types";

/** Import a whole workspace from one export file, or export the current one. Import only adds; it never deletes. */
export default function Import({ go }: { go: Go }) {
  const t = useTerms();
  const [mode] = useDataMode();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ name: string; r: ImportResult } | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function load(file: File) {
    setBusy(true); setError(null); setResult(null);
    try { setResult({ name: file.name, r: await importWorkspace(file) }); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  return <div className="page"><PageHeader title="Import" description={`Load a whole workspace from one export file: ${t.people.toLowerCase()}, their reference signatures, checks, decisions and notes, with their dates.`} />
    <input ref={input} className="hidden" type="file" accept=".zip,application/zip" onChange={e => { const f = e.target.files?.[0]; if (f) void load(f); e.target.value = ""; }} />
    <section className="panel batch-upload" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) void load(f); }}>
      <div><Icon name="upload" size={26} /><h2>Import an export file</h2>
        <p>Choose or drop one 4buwan export (.zip). Everything in it is added{mode === "demo" ? " to this demo session" : ""}; nothing already here is changed or deleted.</p>
        <div className="header-actions"><Button icon="upload" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Importing…" : "Choose export file"}</Button></div>
        {result && <p className="input-hint import-result" role="status">{result.name}: added {result.r.persons} {result.r.persons === 1 ? t.lower : t.people.toLowerCase()} and {plural(result.r.checks, "check")}{result.r.skipped ? ` (${result.r.skipped} already here)` : ""}.</p>}
        {result && <div className="header-actions"><Button secondary icon="user" onClick={() => go("Reference Library")}>Open Profiles</Button><Button secondary icon="history" onClick={() => go("Cases")}>Open History</Button></div>}
        {error && <p className="input-hint error-text" role="alert">{error}</p>}
      </div>
    </section>
    <section className="panel"><div className="panel-head"><div><span>EXPORT</span><h2>Save this workspace as one file</h2></div>
      <a className="button secondary" href={exportUrl()} download><Icon name="save" size={15} />Export</a></div>
      <p className="input-hint">{mode === "demo" ? "Exports this demo session, so it can be imported again later." : "Exports the real data on this computer. It contains signatures: keep the file private."}</p>
    </section>
  </div>;
}
