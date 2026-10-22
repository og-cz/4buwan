import { useState } from "react";
import Icon from "./Icon";
import Tag from "./Tag";
const clients = [
  { name: "Amira Rahman", id: "CL-0047", status: "Ready", date: "14 Feb 2025" },
  { name: "Daniel Cruz", id: "CL-0103", status: "Incomplete", date: "10 Feb 2025" },
  { name: "Maya Santos", id: "CL-0126", status: "No profile", date: "—" },
  { name: "Leo Villanueva", id: "CL-0138", status: "Ready", date: "06 Feb 2025" },
];

export default function PersonSearch({ onSelect }: { onSelect: (ready: boolean) => void }) {
  const [search, setSearch] = useState("");
  const visible = clients.filter(c => `${c.name} ${c.id}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="client-search">
    <div className="search-box"><Icon name="search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client name or ID" /><span>{visible.length} clients</span></div>
    <div className="client-results">{visible.map(c => <button key={c.id} onClick={() => onSelect(c.status === "Ready")}><span className="avatar">{c.name.split(" ").map(n => n[0]).join("")}</span><div><strong>{c.name}</strong><small>{c.id}</small></div><Tag tone={c.status === "Ready" ? "ready" : c.status === "Incomplete" ? "warn" : "neutral"}>{c.status.toUpperCase()}</Tag><div className="enrolled"><span>ENROLLED</span><strong>{c.date}</strong></div><Icon name="chevron" size={15} /></button>)}</div>
  </section>;
}
