import { useState } from "react";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import Tag from "../../components/Tag";
import VerdictBadge from "../../components/VerdictBadge";
import { decisionTone } from "../../format";
import MockSignature from "../MockSignature";
import { clientName, DEMO_DAY, isInReview, REVIEWERS, type SimCase, type SimVerdict } from "../data";
import type { SupProps } from "../SupervisorApp";
import SupTabs, { simTag } from "../SupTabs";
import SupCaseDetail, { SimBars } from "./SupCaseDetail";

function CaseTable({ rows, data, open }: { rows: SimCase[]; data: SupProps["data"]; open: (id: string) => void }) {
  return <div className="table-scroll"><table><thead><tr><th>Case</th><th>Date</th><th>Client</th><th>Model classification</th><th>Confidence</th><th>Human decision</th></tr></thead>
    <tbody>{rows.map(c => <tr key={c.id} className="clickable-row" onClick={() => open(c.id)}><td className="num">{c.id}</td><td className="num">{c.date}</td><td>{clientName(data, c.clientId)}</td><td><VerdictBadge verdict={c.verdict} /></td><td className="num">{c.confidence}</td><td><Tag tone={decisionTone(c.decision)}>{c.decision}</Tag></td></tr>)}</tbody></table></div>;
}

/** Simulated Verify: a made-up result for a fictional client. The real model is never called. */
function SimVerify({ data, save }: { data: SupProps["data"]; save: (c: SimCase) => void }) {
  const ready = data.clients.filter(c => c.samples === 12);
  const [clientId, setClientId] = useState(ready[0]?.id ?? ""), [kind, setKind] = useState<"same" | "other">("same"), [result, setResult] = useState<SimCase | null>(null);
  const client = ready.find(c => c.id === clientId);
  function run() {
    const s = (client?.seed ?? 1) + (kind === "same" ? 0 : 57), score = kind === "same" ? 0.12 + (s % 9) / 100 : -0.2 - (s % 7) / 100;
    const verdict: SimVerdict = score > 0.06 ? "LIKELY GENUINE" : score < -0.06 ? "LIKELY FORGED" : "UNCERTAIN";
    setResult({ id: `SIM-${3001 + data.cases.length}`, clientId, date: DEMO_DAY, title: "Simulated check", verdict, score, confidence: Math.min(95, 50 + Math.round(Math.abs(score) * 120)),
      comparisons: Array.from({ length: 12 }, (_, i) => Math.round((score + ((s * (i + 1)) % 11 - 5) / 60) * 1000) / 1000), decision: "Pending", reviewer: null, note: "" });
  }
  return <section className="panel"><div className="panel-head"><div><span>SIMULATED VERIFY</span><h2>Walk through a check with fictional data</h2></div>{simTag()}</div>
    <div className="form-grid"><label className="field"><span>Client</span><select value={clientId} onChange={e => { setClientId(e.target.value); setResult(null); }}>{ready.map(c => <option key={c.id} value={c.id}>{c.name} · {c.id}</option>)}</select></label>
      <label className="field"><span>Questioned sample</span><select value={kind} onChange={e => { setKind(e.target.value as "same" | "other"); setResult(null); }}><option value="same">Signed by the client (simulated)</option><option value="other">Signed by someone else (simulated)</option></select></label></div>
    <div className="sim-pair"><figure className="sim-figure"><MockSignature seed={client?.seed ?? 1} variant={kind === "same" ? 5 : 0} tint={undefined} />{kind === "other" && <span className="sim-overlay-note">different writer</span>}<figcaption>Questioned (simulated)</figcaption></figure><figure className="sim-figure"><MockSignature seed={client?.seed ?? 1} variant={0} /><figcaption>Reference 01 (simulated)</figcaption></figure></div>
    <div className="header-actions"><Button icon="scan" onClick={run}>Run simulated check</Button>{result && <Button secondary icon="save" onClick={() => save(result)}>Save as simulated case</Button>}</div>
    {result && <div className="sim-result"><VerdictBadge verdict={result.verdict} /><span className="num">Score {result.score.toFixed(3)} · confidence {result.confidence}</span><SimBars values={result.comparisons} /><p className="chart-note">Generated for the demo, not by the verification model.</p></div>}
  </section>;
}

/** Simulated Compare: two fictional signatures side by side or overlaid. */
function SimCompare({ data }: { data: SupProps["data"] }) {
  const [a, setA] = useState(data.clients[0].id), [b, setB] = useState(data.clients[1].id), [overlay, setOverlay] = useState(false);
  const ca = data.clients.find(c => c.id === a)!, cb = data.clients.find(c => c.id === b)!;
  return <section className="panel"><div className="panel-head"><div><span>SIMULATED COMPARE</span><h2>Manual comparison with fictional signatures</h2></div>{simTag()}</div>
    <div className="form-grid"><label className="field"><span>Left</span><select value={a} onChange={e => setA(e.target.value)}>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="field"><span>Right</span><select value={b} onChange={e => setB(e.target.value)}>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
    <div className="view-switch sim-mode"><button className={!overlay ? "active" : ""} onClick={() => setOverlay(false)}>Side by side</button><button className={overlay ? "active" : ""} onClick={() => setOverlay(true)}>Overlay</button></div>
    {overlay ? <div className="sim-overlay"><MockSignature seed={ca.seed} tint="q" /><MockSignature seed={cb.seed} tint="r" /></div>
      : <div className="sim-pair"><figure className="sim-figure"><MockSignature seed={ca.seed} /><figcaption>{ca.name}</figcaption></figure><figure className="sim-figure"><MockSignature seed={cb.seed} /><figcaption>{cb.name}</figcaption></figure></div>}
    <p className="chart-note">Manual comparison only. No verdict is shown.</p>
  </section>;
}

export default function SupCases({ data, setData, route, go }: SupProps) {
  const tab = route.tab ?? "cases";
  const open = (id: string) => go({ section: "cases", tab, id });
  const detail = route.id ? data.cases.find(c => c.id === route.id) : undefined;
  const queue = data.cases.filter(isInReview).sort((x, y) => x.date.localeCompare(y.date));
  const decide = (id: string) => (decision: SimCase["decision"], note: string) =>
    setData({ ...data, cases: data.cases.map(c => c.id === id ? { ...c, decision, note, reviewer: REVIEWERS[0] } : c) });
  return <div className="page"><PageHeader title="Cases & Reviews" description="Mock cases with simulated verification details, a sample review queue and simulated decisions. Verify and Compare are walkthroughs with fictional data." action={simTag()} />
    <SupTabs route={route} go={go} label="Cases & Reviews" tabs={[["cases", `Cases (${data.cases.length})`], ["review", `Review queue (${queue.length})`], ["verify", "Verify (simulated)"], ["compare", "Compare (simulated)"]]} />
    {detail ? <SupCaseDetail c={detail} client={data.clients.find(c => c.id === detail.clientId)} onDecide={decide(detail.id)} back={() => go({ section: "cases", tab })} />
      : tab === "verify" ? <SimVerify data={data} save={c => { setData({ ...data, cases: [c, ...data.cases] }); go({ section: "cases", tab: "cases", id: c.id }); }} />
      : tab === "compare" ? <SimCompare data={data} />
      : <section className="panel table-panel"><div className="panel-head"><div><span>{tab === "review" ? "REVIEW QUEUE" : "ALL CASES"}</span><h2>{tab === "review" ? "Waiting for a final human decision, oldest first" : "Every simulated case"}</h2></div></div>
        <CaseTable rows={tab === "review" ? queue : data.cases} data={data} open={open} /></section>}
  </div>;
}
