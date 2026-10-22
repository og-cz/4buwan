import Button from "../components/Button";
import PageHeader from "../components/PageHeader";
import PersonSearch from "../components/PersonSearch";
export default function ReferenceLibrary({ openProfile, enrol }: { openProfile: () => void; enrol: () => void }) {
  return <div className="page"><PageHeader title="Reference Library" description="People with stored Signature Profiles built from genuine Reference Samples." action={<Button icon="enrol" onClick={enrol}>Enrol Person</Button>} /><PersonSearch onSelect={(ready: boolean) => ready ? openProfile() : enrol()} /><section className="library-summary"><div><strong>164</strong><span>Ready profiles</span></div><div><strong>7</strong><span>Incomplete</span></div><div><strong>12</strong><span>Need refresh</span></div><div><strong>2,847</strong><span>Checks recorded</span></div></section></div>;
}
