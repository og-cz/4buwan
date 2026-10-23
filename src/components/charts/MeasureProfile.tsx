import type { MeasureStats, MeasureValues } from "../../types";

type Props = { measures: MeasureValues[]; pairStats: Record<string, MeasureStats> };

/** For each Difference Measure: the person's genuine range (whiskers min–max, band q25–q75) and the 12 questioned values (dots). */
export default function MeasureProfile({ measures, pairStats }: Props) {
  return <>
    <div className="measure-profile">{measures.map(m => {
      const s = pairStats[m.name];
      if (!s) return null;
      const lo = Math.min(s.min, ...m.questioned), hi = Math.max(s.max, ...m.questioned), w = hi - lo || 1;
      const at = (v: number) => (v - lo) / w * 100;
      return <div key={m.name} title={`${m.name}: genuine ${s.min.toFixed(2)} … ${s.max.toFixed(2)}`}><span>{m.name}</span><i>
        <em className="whisker" style={{ left: `${at(s.min)}%`, width: `${at(s.max) - at(s.min)}%` }} />
        <em style={{ left: `${at(s.q25)}%`, width: `${Math.max(0.5, at(s.q75) - at(s.q25))}%` }} />
        {m.questioned.map((v, i) => <b key={i} className="measure-dot" style={{ left: `${at(v)}%` }} />)}
      </i></div>;
    })}</div>
    <p className="chart-note">Values are in standardised units (each measure divided by its typical size across development writers). Grey = this person&apos;s genuine pairs; blue dots = the questioned signature against each reference.</p>
  </>;
}
