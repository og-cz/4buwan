import { useState } from "react";
import { getPerson } from "../api/client";
import PageHeader from "../components/PageHeader";
import PersonSearch from "../components/PersonSearch";
import Button from "../components/Button";
import Icon from "../components/Icon";
import Tag from "../components/Tag";
import { ErrorState, SkeletonPanel } from "../components/States";
import useAsync from "../state/useAsync";
import { useTerms } from "../state/settings";
import type { Go } from "../navigation";
import VerifyWorkspace from "./VerifyWorkspace";

type Props = { personId?: string; expert: boolean; setExpert: (v: boolean) => void; go: Go };

export default function Verify({ personId, expert, setExpert, go }: Props) {
  const t = useTerms();
  const [selected, setSelected] = useState<string | undefined>(personId);
  const person = useAsync(() => selected ? getPerson(selected) : Promise.resolve(null), [selected]);

  if (!selected) return <div className="page"><PageHeader title="Verify a signature" description={`Start by finding the ${t.person} whose signature you want to check.`} /><PersonSearch onSelect={p => setSelected(p.id)} onEnrol={() => go("Enrol")} /></div>;
  if (person.loading) return <div className="page"><PageHeader title="Verify a signature" description="Loading the Signature Profile." /><SkeletonPanel /></div>;
  if (person.error || !person.data) return <div className="page"><PageHeader title="Verify a signature" description="The Signature Profile could not be loaded." /><ErrorState message={person.error ?? "Not found."} retry={person.reload} /><div><Button secondary onClick={() => setSelected(undefined)}>Choose another {t.person}</Button></div></div>;

  const p = person.data;
  if (p.status !== "Ready") return <div className="page"><PageHeader title="Verify a signature" description={`This ${t.person} cannot be checked.`} /><section className="panel blocked-verify"><span><Icon name="alert" size={24} /></span><div><Tag tone="warn">PROFILE {p.status.toUpperCase()}</Tag><h2>{p.name} has no ready Signature Profile</h2><p>{p.status === "Archived" ? "This profile is archived. Archived profiles cannot be used for new checks." : "Verification needs 12 accepted genuine Reference Samples. No forged samples are required."}</p><div><Button secondary onClick={() => setSelected(undefined)}>Choose another {t.person}</Button><Button icon="enrol" onClick={() => go("Enrol")}>Enrol</Button></div></div></section></div>;

  return <VerifyWorkspace key={p.id} person={p} expert={expert} setExpert={setExpert} go={go} changePerson={() => setSelected(undefined)} />;
}
