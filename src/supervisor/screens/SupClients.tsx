import { useState } from "react";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import Tag from "../../components/Tag";
import MockSignature from "../MockSignature";
import { DEMO_DAY, type SimClient } from "../data";
import type { SupProps } from "../SupervisorApp";
import SupTabs, { simTag } from "../SupTabs";

function ClientDetail({ client, cases, back }: { client: SimClient; cases: number; back: () => void }) {
  return <section className="panel"><div className="panel-head"><div><span>CLIENT</span><h2>{client.name} · <span className="num">{client.id}</span></h2></div><Button secondary onClick={back}>Back to clients</Button></div>
    <dl className="sim-facts"><div><dt>Enrolled</dt><dd>{client.enrolled}</dd></div><div><dt>Signature samples</dt><dd>{client.samples} of 12</dd></div><div><dt>Consistency (simulated)</dt><dd>{client.consistency}</dd></div><div><dt>Cases</dt><dd>{cases}</dd></div></dl>
    <div className="sim-sample-grid">{Array.from({ length: client.samples }, (_, i) => <figure key={i}><MockSignature seed={client.seed} variant={i} /><figcaption>Sample {String(i + 1).padStart(2, "0")}</figcaption></figure>)}</div>
  </section>;
}

/** Simulated enrollment: it only adds a fictional client to this demo's memory. */
function Enrollment({ onCreate }: { onCreate: (name: string, samples: number) => void }) {
  const [name, setName] = useState(""), [samples, setSamples] = useState(0);
  return <section className="panel"><div className="panel-head"><div><span>SIMULATED ENROLLMENT</span><h2>Collect 12 genuine samples</h2></div>{simTag()}</div>
    <p className="input-hint">This walks through the enrollment steps with fictional data. No image is uploaded and no profile is built.</p>
    <div className="form-grid"><label className="field"><span>Client name</span><input value={name} onChange={e => setName(e.target.value)} placeholder="Fictional client" /></label>
      <label className="field"><span>Samples collected</span><input value={`${samples} of 12`} readOnly /></label></div>
    <div className="sim-sample-grid">{Array.from({ length: 12 }, (_, i) => <figure key={i}>{i < samples ? <MockSignature seed={name.length + 7} variant={i} /> : <div className="signature sim-empty"><Icon name="upload" /></div>}<figcaption>Sample {String(i + 1).padStart(2, "0")}</figcaption></figure>)}</div>
    <div className="header-actions"><Button secondary icon="plus" disabled={samples >= 12} onClick={() => setSamples(samples + 1)}>Add simulated sample</Button><Button icon="check" disabled={!name.trim() || samples === 0} onClick={() => { onCreate(name.trim(), samples); setName(""); setSamples(0); }}>{samples === 12 ? "Create simulated profile" : "Save as incomplete"}</Button></div>
  </section>;
}

export default function SupClients({ data, setData, route, go }: SupProps) {
  const [q, setQ] = useState("");
  const tab = route.tab ?? "clients";
  const detail = route.id ? data.clients.find(c => c.id === route.id) : undefined;
  const rows = data.clients.filter(c => `${c.name} ${c.id}`.toLowerCase().includes(q.toLowerCase()));
  function create(name: string, samples: number) {
    const id = `CL-${2001 + data.clients.length}`;
    setData({ ...data, clients: [...data.clients, { id, name, samples, enrolled: DEMO_DAY, consistency: "Typical", seed: 300 + data.clients.length }] });
    go({ section: "clients", tab: "clients", id });
  }
  return <div className="page"><PageHeader title="Clients & Enrollment" description="Fictional clients, their sample signature collections and a simulated enrollment workflow." action={simTag()} />
    <SupTabs route={route} go={go} label="Clients & Enrollment" tabs={[["clients", "Clients"], ["enroll", "Simulated enrollment"]]} />
    {tab === "enroll" ? <Enrollment onCreate={create} />
      : detail ? <ClientDetail client={detail} cases={data.cases.filter(c => c.clientId === detail.id).length} back={() => go({ section: "clients" })} />
      : <section className="panel table-panel"><div className="panel-head"><div><span>CLIENTS</span><h2>{data.clients.length} fictional clients</h2></div><input className="sim-search" placeholder="Search clients" value={q} onChange={e => setQ(e.target.value)} aria-label="Search clients" /></div>
        <div className="table-scroll"><table><thead><tr><th>Client</th><th>ID</th><th>Samples</th><th>Status</th><th>Enrolled</th><th>Cases</th></tr></thead>
          <tbody>{rows.map(c => <tr key={c.id} className="clickable-row" onClick={() => go({ section: "clients", tab: "clients", id: c.id })}><td>{c.name}</td><td className="num">{c.id}</td><td className="num">{c.samples} / 12</td><td><Tag tone={c.samples === 12 ? "ready" : "warn"}>{c.samples === 12 ? "Ready" : "Incomplete"}</Tag></td><td className="num">{c.enrolled}</td><td className="num">{data.cases.filter(k => k.clientId === c.id).length}</td></tr>)}</tbody></table></div>
      </section>}
  </div>;
}
