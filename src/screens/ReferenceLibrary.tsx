import { listPersons } from "../api/client";
import PageHeader from "../components/PageHeader";
import PersonSearch from "../components/PersonSearch";
import useAsync from "../state/useAsync";
import { useTerms } from "../state/settings";
import type { Go } from "../navigation";

export default function ReferenceLibrary({ go }: { go: Go }) {
  const t = useTerms();
  const all = useAsync(() => listPersons(), []);
  const people = all.data ?? [];
  const count = (status: string) => people.filter(p => p.status === status).length;
  return <div className="page"><PageHeader title="Reference Library" description={`${t.people} with stored Signature Profiles built from genuine Reference Samples.`} />
    <PersonSearch onSelect={p => go("Person Profile", { personId: p.id, label: p.name })} onEnrol={() => go("Enrol")} />
    {people.length > 0 && <section className="library-summary"><div><strong>{count("Ready")}</strong><span>Ready profiles</span></div><div><strong>{count("Archived")}</strong><span>Archived</span></div><div><strong>{people.length}</strong><span>{t.people} in total</span></div><div><strong>{people.reduce((a, p) => a + p.n_checks, 0)}</strong><span>Checks recorded</span></div></section>}
  </div>;
}
