import Button from "../components/Button";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Tag from "../components/Tag";
import { initials, Signature } from "./mock";

const historyRows = [
  ["Today, 14:32", "Client A", "Demo Verifier", "Likely genuine", "No"],
  ["Today, 11:08", "Client D", "Demo Verifier", "Uncertain", "No"],
  ["Yesterday, 16:41", "Client B", "Demo Supervisor", "Likely forged", "Yes"],
  ["12 Feb, 09:14", "Client A", "Demo Verifier", "Likely genuine", "No"],
];

/** Demo: verification history. */
export function DecoyHistory() {
  return <div className="page"><PageHeader title="Verification history" description="Every saved check, staff decision, and supervisor override." />
    <div className="filters"><label><span>DATE</span><select><option>Last 30 days</option></select></label><label><span>STAFF</span><select><option>All staff</option></select></label><label><span>RESULT</span><select><option>All results</option></select></label><div><Icon name="search" /><input placeholder="Search client" /></div></div>
    <section className="panel table-panel"><div className="table-scroll"><table><thead><tr>{["DATE & TIME", "CLIENT", "STAFF", "RESULT", "OVERRIDDEN", ""].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{historyRows.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{i === 3 ? <Tag tone={c.includes("genuine") ? "ready" : c === "Uncertain" ? "warn" : "bad"}>{c.toUpperCase()}</Tag> : c}</td>)}<td><Icon name="chevron" size={14} /></td></tr>)}</tbody></table></div></section>
  </div>;
}

/** Demo: review queue. */
export function DecoyReviewQueue() {
  return <div className="page"><PageHeader title="Review queue" description="Uncertain results and checks sent by staff for a supervisor decision." action={<Tag tone="warn">3 WAITING</Tag>} />
    <div className="review-list">{[["Client A", "Today, 11:08", "Score falls inside the uncertain zone."], ["Client B", "Yesterday, 15:22", "Second signature differs from the first attempt."], ["Client C", "11 Feb, 10:04", "Staff requested a supervisor check."]].map((r, i) => <section className="panel review-item" key={r[0]}>
      <div className="review-person"><span className="avatar">{initials(r[0])}</span><div><strong>{r[0]}</strong><small>{r[1]} · Sent by Demo Verifier</small></div><Tag tone="warn">UNCERTAIN</Tag></div>
      <div className="review-evidence"><div><span>QUESTIONED</span><Signature seed={i + 1} /></div><p><Icon name="alert" />{r[2]}</p></div>
      <label><span>REQUIRED REVIEW NOTE</span><input placeholder="Explain your decision…" /></label>
      <div className="review-actions"><Button secondary icon="check">Approve as genuine</Button><Button secondary icon="alert">Mark as forged</Button><Button secondary icon="enrol">Ask for new sample</Button></div>
    </section>)}</div>
  </div>;
}

/** Demo: staff accounts. */
export function DecoyStaff() {
  const staff: [string, string, string, string, boolean][] = [["Demo Verifier", "demo.verifier", "Verifier", "Today, 08:12", true], ["Demo Supervisor", "demo.supervisor", "Supervisor", "Yesterday, 16:47", true], ["Demo Researcher", "demo.researcher", "Researcher", "12 Feb, 09:02", true], ["Former Verifier", "former.verifier", "Verifier", "28 Jan, 11:30", false]];
  return <div className="page"><PageHeader title="Staff accounts" description="Add staff, assign access, and deactivate accounts." action={<Button icon="staff">Add staff account</Button>} />
    <section className="panel staff-list">{staff.map(s => <div key={s[1]}><span className="avatar">{initials(s[0])}</span><div><strong>{s[0]}</strong><small>@{s[1]}</small></div><Tag tone={s[4] ? "ready" : "neutral"}>{s[4] ? "ACTIVE" : "INACTIVE"}</Tag><div><span>ROLE</span><strong>{s[2]}</strong></div><div><span>LAST LOGIN</span><strong>{s[3]}</strong></div><Button secondary>{s[4] ? "Manage" : "Reactivate"}</Button></div>)}</section>
  </div>;
}
