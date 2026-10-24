import { useState } from "react";
import type { Comparison } from "../../types";

/** One bar per Reference Sample: the model output for the pair (questioned, reference). Positive = genuine-like. */
export default function ComparisonBars({ comparisons, matches, majorityAccept }: { comparisons: Comparison[]; matches: number; majorityAccept: boolean }) {
  const [byValue, setByValue] = useState(false);
  const rows = byValue ? [...comparisons].sort((a, b) => b.value - a.value) : comparisons;
  const peak = Math.max(...comparisons.map(c => Math.abs(c.value)), 1e-9);
  return <>
    <div className="chart-toolbar"><button className={!byValue ? "active" : ""} onClick={() => setByValue(false)}>By reference</button><button className={byValue ? "active" : ""} onClick={() => setByValue(true)}>By value</button></div>
    <div className="comparison-bars">{rows.map(c => <div key={c.reference} title={`Reference ${c.reference}: ${c.value}`}><span>R{c.reference}</span><i><em className={c.value < 0 ? "negative" : ""} style={{ height: `${Math.max(2, Math.abs(c.value) / peak * 100)}%` }} /></i><strong>{c.value.toFixed(3)}</strong></div>)}</div>
    <p className="chart-note">{matches} of 12 above zero (majority rule: {majorityAccept ? "accept" : "reject"}). Red bars are below zero.</p>
  </>;
}
