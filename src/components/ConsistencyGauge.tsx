import type { Consistency } from "../types";

/** Marker = this person's Signature Consistency; faint band = the middle half (p25–p75) of the population. */
export default function ConsistencyGauge({ consistency, name }: { consistency: Consistency; name: string }) {
  const p = consistency.population;
  const lo = Math.log(p.p5), hi = Math.log(p.p95);
  const at = (v: number) => Math.min(100, Math.max(0, (Math.log(v) - lo) / (hi - lo) * 100));
  const x = at(consistency.value);
  return <div className="consistency">
    <div className="gauge-labels"><span>Very consistent</span><span>Typical range</span><span>Very variable</span></div>
    <div className="gauge"><i style={{ left: `${at(p.p25)}%`, width: `${at(p.p75) - at(p.p25)}%` }} /><em style={{ left: `${x}%` }} /><b style={{ left: `${x}%` }} /></div>
    <div className="client-marker" style={{ marginLeft: `max(0px, calc(${x}% - 20px))` }}><span>{name.toUpperCase()}</span><strong>{consistency.label}</strong></div>
  </div>;
}
