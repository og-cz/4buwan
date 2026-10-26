import { sampleUrl } from "../../api/client";
import { pad2 } from "../../format";
import type { Comparison } from "../../types";

type Props = { personId: string; selected: number; onSelect: (n: number) => void; comparisons?: Comparison[] };

/** The 12 Reference Samples. In Expert view a small bar under each shows that comparison's model value. */
export default function ReferenceStrip({ personId, selected, onSelect, comparisons }: Props) {
  const peak = comparisons ? Math.max(...comparisons.map(c => Math.abs(c.value)), 1e-9) : 1;
  return <div className="reference-strip" role="listbox" aria-label="Reference Samples">{Array.from({ length: 12 }, (_, i) => {
    const n = i + 1, c = comparisons?.find(x => x.reference === n);
    return <button key={n} role="option" aria-selected={selected === n} className={selected === n ? "active" : ""} onClick={() => onSelect(n)} title={c ? `Reference ${pad2(n)}: ${c.value.toFixed(3)}` : `Reference ${pad2(n)}`}>
      <span className="ref-thumb"><img src={sampleUrl(personId, n)} alt="" loading="lazy" draggable={false} /></span>
      <span className="ref-badge">R{pad2(n)}</span>
      {c && <span className="ref-bar" aria-hidden="true"><i className={c.value >= 0 ? "pos" : "neg"} style={{ width: `${Math.max(4, Math.abs(c.value) / peak * 100)}%` }} /></span>}
    </button>;
  })}</div>;
}
