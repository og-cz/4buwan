import { useRef, useState } from "react";
import { listPersons, verify } from "../api/client";
import Button from "../components/Button";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Tag from "../components/Tag";
import VerdictBadge from "../components/VerdictBadge";
import { downloadCsv } from "../format";
import type { Go } from "../navigation";
import useAsync from "../state/useAsync";
import { useSettings, useTerms } from "../state/settings";
import type { VerifyResult } from "../types";

type Row = { file: File; personId: string; result?: VerifyResult; error?: string };

/** Parses "file,person_id" lines (header optional). Values may be a person's internal id or their external ID. */
function parseCsv(text: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    const [file, person] = line.split(",").map(s => s?.trim().replace(/^"|"$/g, "") ?? "");
    if (file && person && file.toLowerCase() !== "file") map.set(file, person);
  }
  return map;
}

export default function BatchCheck({ go }: { go: Go }) {
  const settings = useSettings();
  const t = useTerms();
  const persons = useAsync(() => listPersons(), []);
  const ready = (persons.data ?? []).filter(p => p.status === "Ready");
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [onlyUncertain, setOnlyUncertain] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [mapping, setMapping] = useState<{ name: string; map: Map<string, string> } | null>(null);
  const images = useRef<HTMLInputElement>(null), csv = useRef<HTMLInputElement>(null);

  const resolve = (value: string) => ready.find(p => p.id === value || p.external_id === value)?.id ?? "";
  // The CSV can be loaded before or after the images; it is applied to every image added while it is loaded.
  const assign = (list: Row[], map: Map<string, string>) =>
    list.map(row => { const id = map.has(row.file.name) ? resolve(map.get(row.file.name)!) : ""; return id ? { ...row, personId: id } : row; });
  function describe(name: string, map: Map<string, string>, list: Row[]) {
    const missing = [...new Set([...map.values()].filter(v => !resolve(v)))];
    if (!list.length) return `${name} loaded (${map.size} file${map.size === 1 ? "" : "s"} listed). Now choose the images.`;
    const assigned = list.filter(r => map.has(r.file.name) && resolve(map.get(r.file.name)!)).length;
    return `${name}: ${assigned} of ${list.length} images assigned.` + (missing.length ? ` Not enrolled yet: ${missing.join(", ")}. Enrol them with these ${t.lower} IDs first.` : "");
  }
  function addImages(files: File[]) {
    const next = [...rows, ...files.map(file => ({ file, personId: "" }))];
    const out = mapping ? assign(next, mapping.map) : next;
    setRows(out); setDone(0);
    if (mapping) setNote(describe(mapping.name, mapping.map, out));
  }
  async function applyCsv(file: File) {
    const map = parseCsv(await file.text());
    if (!map.size) { setNote(`${file.name} has no rows. Use two columns: file,${t.lower}_id.`); return; }
    const out = assign(rows, map);
    setMapping({ name: file.name, map }); setRows(out);
    setNote(describe(file.name, map, out));
  }
  async function run() {
    setRunning(true); setDone(0);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.personId) { setRows(r => r.map((x, j) => j === i ? { ...x, error: `No ${t.lower} assigned`, result: undefined } : x)); setDone(i + 1); continue; }
      try {
        const result = await verify({ personId: row.personId, file: row.file, strictness: settings.strictness, uncertain: settings.uncertain, caseTitle: `Batch · ${row.file.name}`, notes: "" });
        setRows(r => r.map((x, j) => j === i ? { ...x, result, error: undefined } : x));
      } catch (e) {
        setRows(r => r.map((x, j) => j === i ? { ...x, error: e instanceof Error ? e.message : String(e), result: undefined } : x));
      }
      setDone(i + 1);
    }
    setRunning(false);
  }
  const nameOf = (id: string) => ready.find(p => p.id === id)?.name ?? "";
  const visible = rows.map((r, i) => ({ r, i })).filter(({ r }) => !onlyUncertain || r.result?.verdict === "UNCERTAIN");
  const finished = done === rows.length && rows.length > 0 && !running;

  function exportCsv() {
    downloadCsv("batch-results.csv", ["file", "person", "case_id", "verdict", "confidence", "error"],
      rows.map(r => [r.file.name, nameOf(r.personId), r.result?.case_id ?? "", r.result?.verdict ?? "", r.result?.confidence ?? "", r.error ?? ""]));
  }

  return <div className="page"><PageHeader title="Batch Check" description={`Check many Questioned Signatures. Assign each file to a ${t.lower} with a CSV (file,person_id) or in the table.`} action={finished && <Button icon="save" onClick={exportCsv}>Export results</Button>} />
    <input ref={images} className="hidden" type="file" accept="image/*" multiple onChange={e => { addImages(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
    <input ref={csv} className="hidden" type="file" accept=".csv,text/csv" onChange={e => { const f = e.target.files?.[0]; if (f) void applyCsv(f); e.target.value = ""; }} />
    <section className="panel batch-upload"><div><Icon name="upload" size={26} /><h2>Upload signatures and an optional mapping CSV</h2><p>Add the images and the CSV in either order; the CSV assigns {t.people.toLowerCase()} automatically, or assign them in the table.</p><div className="header-actions"><Button onClick={() => images.current?.click()}>Choose images</Button><Button secondary onClick={() => csv.current?.click()}>Apply CSV</Button>{(rows.length > 0 || mapping) && <Button secondary disabled={running} onClick={() => { setRows([]); setDone(0); setNote(null); setMapping(null); }}>Clear</Button>}</div>{note && <p className="input-hint">{note}</p>}</div></section>
    {rows.length > 0 && <section className="panel table-panel">
      <div className="batch-progress"><span>{done} of {rows.length} {running ? "checked" : finished ? "complete" : "queued"}</span><i><em style={{ width: `${rows.length ? done / rows.length * 100 : 0}%` }} /></i><div className="header-actions"><label className="inline-check"><input type="checkbox" checked={onlyUncertain} onChange={e => setOnlyUncertain(e.target.checked)} /> Uncertain only</label><Button icon="scan" disabled={running || !rows.some(r => r.personId)} onClick={() => void run()}>{running ? "Running…" : "Run batch"}</Button></div></div>
      <div className="table-scroll"><table><thead><tr><th>FILE</th><th>{t.person.toUpperCase()}</th><th>VERDICT</th><th>CONFIDENCE</th><th>FLAGS</th><th /></tr></thead><tbody>{visible.map(({ r, i }) => <tr key={`${r.file.name}-${i}`} className={r.result ? "clickable-row" : ""} onClick={r.result ? () => go("CaseDetail", { caseId: r.result!.case_id }) : undefined}>
        <td>{r.file.name}</td>
        <td onClick={e => e.stopPropagation()}><select className="table-select" value={r.personId} disabled={running} onChange={e => { const v = e.target.value; setRows(rs => rs.map((x, j) => j === i ? { ...x, personId: v } : x)); }}><option value="">Assign…</option>{ready.map(p => <option key={p.id} value={p.id}>{p.name}{p.external_id ? ` · ${p.external_id}` : ""}</option>)}</select></td>
        <td>{r.result ? <VerdictBadge verdict={r.result.verdict} /> : "—"}</td>
        <td>{r.result ? r.result.confidence : "—"}</td>
        <td>{r.error ? <Tag tone="bad">{r.error}</Tag> : "—"}</td>
        <td>{r.result && <Icon name="chevron" size={14} />}</td>
      </tr>)}</tbody></table></div>
    </section>}
  </div>;
}
