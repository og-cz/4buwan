import { useState } from "react";
import Button from "../components/Button";
import Icon from "../components/Icon";
import Tag from "../components/Tag";

/** Demo-only building blocks from the 4buwan-ui design. Nothing here uses the model or any stored data. */

export type DemoVerdict = "LIKELY GENUINE" | "LIKELY FORGED" | "UNCERTAIN";

export function Signature({ seed = 0, faded = false }: { seed?: number; faded?: boolean }) {
  const d = [
    "M12 56c9-17 13-28 16-1 3 23 10-40 17-2 5 24 14-24 19-1 5 20 13-17 20 1 6 14 14-8 21-1 10 8 20 2 31-5",
    "M12 60c12-8 12-33 19-2 5 24 11-37 18-1 5 23 11-14 17-1 7 18 12-12 21-1 8 11 17-4 24-1 9 4 19 0 28-5",
    "M15 58c8-11 13-28 17 0 4 20 12-31 18-1 4 18 10-10 16-1 8 16 12-10 21-2 9 12 17-3 24-1 13 7 23 5 37-4",
  ][seed % 3];
  return <div className={`signature mock-sig ${faded ? "faded" : ""}`}><svg viewBox="0 0 160 86" preserveAspectRatio="none"><path d={d} /><path className="under" d={`M${17 + seed * 3} 69c41-7 82 9 126-3`} /></svg></div>;
}

export function initials(name: string) { return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(); }

export const clients = [
  { name: "Client A", id: "CL-0047", status: "Ready", date: "14 Feb 2025" },
  { name: "Client B", id: "CL-0103", status: "Incomplete", date: "10 Feb 2025" },
  { name: "Client C", id: "CL-0126", status: "No profile", date: "—" },
  { name: "Client D", id: "CL-0138", status: "Ready", date: "06 Feb 2025" },
];

export function ClientSearch({ onSelect }: { onSelect: (ready: boolean) => void }) {
  const [search, setSearch] = useState("");
  const visible = clients.filter(c => `${c.name} ${c.id}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="client-search">
    <div className="search-box"><Icon name="search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client name or ID" /><span>{visible.length} clients</span></div>
    <div className="client-results">{visible.map(c => <button key={c.id} onClick={() => onSelect(c.status === "Ready")}><span className="avatar">{initials(c.name)}</span><div><strong>{c.name}</strong><small>{c.id}</small></div><Tag tone={c.status === "Ready" ? "ready" : c.status === "Incomplete" ? "warn" : "neutral"}>{c.status.toUpperCase()}</Tag><div className="enrolled"><span>ENROLLED</span><strong>{c.date}</strong></div><Icon name="chevron" size={15} /></button>)}</div>
  </section>;
}

export function ConsistencyGauge() {
  return <div className="consistency"><div className="gauge-labels"><span>Very consistent</span><span>Typical range</span><span>Very variable</span></div><div className="gauge"><i style={{ left: "30%", width: "38%" }} /><em style={{ left: "25%" }} /></div><div className="client-marker" style={{ marginLeft: "18%" }}><span>CLIENT A</span><strong>Consistent</strong></div></div>;
}

export function Result({ verdict }: { verdict: DemoVerdict }) {
  const uncertain = verdict === "UNCERTAIN", genuine = verdict === "LIKELY GENUINE";
  return <>
    <div className="result-top"><span className={`verdict-icon ${genuine ? "good" : uncertain ? "warn" : "bad"}`}><Icon name={genuine ? "check" : "alert"} size={26} /></span><div><span>ADVISORY RESULT</span><strong>{verdict}</strong><small>{genuine ? "Closely matches 10 of the 12 reference signatures." : uncertain ? "The score is too close to the decision line for a clear result." : "Differs from all reference signatures in overall shape."}</small></div></div>
    <div className="confidence"><div><span>Different</span><span>Uncertain zone</span><span>Similar</span></div><i><em style={{ left: "43%", width: "14%" }} /><b style={{ left: genuine ? "78%" : uncertain ? "52%" : "24%" }} /></i><p>The marker shows where this signature falls. The shaded middle area means a staff decision is needed.</p></div>
    {uncertain && <div className="next-steps"><strong>What to do next</strong><div><Button secondary icon="enrol">Ask client to sign again</Button><Button secondary icon="review">Send to supervisor</Button></div></div>}
    <div className="result-actions"><Button secondary icon="save">Save to history</Button><Button secondary icon="print">Print verification slip</Button></div>
    <p className="advice"><Icon name="help" size={14} />This result is advice. A staff member makes the final decision.</p>
  </>;
}
