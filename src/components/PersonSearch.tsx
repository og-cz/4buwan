import { useEffect, useState } from "react";
import { listPersons } from "../api/client";
import useAsync from "../state/useAsync";
import { useTerms } from "../state/settings";
import { formatDate, initials, statusTone } from "../format";
import type { PersonSummary } from "../types";
import Icon from "./Icon";
import Tag from "./Tag";
import { EmptyState, ErrorState } from "./States";
import Button from "./Button";

type Props = { onSelect: (p: PersonSummary) => void; onEnrol?: () => void };

export default function PersonSearch({ onSelect, onEnrol }: Props) {
  const t = useTerms();
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => { const h = window.setTimeout(() => setQ(search.trim()), 200); return () => window.clearTimeout(h); }, [search]);
  const people = useAsync(() => listPersons(q), [q]);
  const rows = people.data ?? [];
  return <section className="client-search">
    <div className="search-box"><Icon name="search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search by ${t.lower} name or ${t.idLabel}`} /><span>{people.loading ? "Searching…" : `${rows.length} ${rows.length === 1 ? t.lower : t.people.toLowerCase()}`}</span></div>
    {people.error ? <ErrorState message={people.error} retry={people.reload} />
      : !people.loading && rows.length === 0 ? <EmptyState icon="user" title={q ? `No ${t.people.toLowerCase()} match "${q}"` : `No ${t.people.toLowerCase()} enrolled yet`} text={`Enrol a ${t.lower} with 12 genuine signatures to start.`} action={onEnrol && <Button icon="enrol" onClick={onEnrol}>Enrol {t.person}</Button>} />
      : rows.length > 0 && <div className="client-results">{rows.map(p => <button key={p.id} onClick={() => onSelect(p)}><span className="avatar">{initials(p.name)}</span><div><strong>{p.name}</strong><small>{p.external_id || "—"} · {p.consistency.label}</small></div><Tag tone={statusTone(p.status)}>{p.status.toUpperCase()}</Tag><div className="enrolled"><span>ENROLLED</span><strong>{formatDate(p.created)}</strong></div><Icon name="chevron" size={15} /></button>)}</div>}
  </section>;
}
