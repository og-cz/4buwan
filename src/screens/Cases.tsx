import Icon from "../components/Icon";
import Tag from "../components/Tag";
import PageHeader from "../components/PageHeader";

const historyRows = [
  ["Today, 14:32", "Amira Rahman", "Likely genuine", "Accepted"],
  ["Today, 11:08", "Leo Villanueva", "Uncertain", "Pending"],
  ["Yesterday, 16:41", "Daniel Cruz", "Likely forged", "Rejected"],
  ["12 Feb, 09:14", "Amira Rahman", "Likely genuine", "Accepted"],
];

export default function Cases({ queue = false }: { queue?: boolean }) {
  const rows = queue ? historyRows.filter(r => r[2] === "Uncertain" || r[3] === "Pending") : historyRows;
  return <div className="page"><PageHeader title={queue ? "Review Queue" : "Cases"} description={queue ? "Uncertain Checks and Checks still waiting for a recorded decision, oldest first." : "Saved Checks, evidence, final human decisions, notes, and action history."} /><div className="filters"><label><span>DATE</span><select><option>Last 30 days</option></select></label><label><span>RESULT</span><select><option>All results</option></select></label><div><Icon name="search" /><input placeholder="Search client" /></div></div><section className="panel table-panel"><table><thead><tr>{["DATE & TIME", "PERSON", "VERDICT", "FINAL DECISION", ""].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{i === 2 ? <Tag tone={c.includes("genuine") ? "ready" : c === "Uncertain" ? "warn" : "bad"}>{c.toUpperCase()}</Tag> : c}</td>)}<td><Icon name="chevron" size={14} /></td></tr>)}</tbody></table></section></div>;
}
