import { useState } from "react";
import Icon from "../../components/Icon";
import Tag from "../../components/Tag";
import PageHeader from "../../components/PageHeader";

function Curve({ variant }: { variant: number }) {
  const d = ["M15 170C44 122 84 87 126 58s72-31 105-37", "M15 170C40 102 79 66 122 43s76-20 109-22", "M15 170C38 90 76 53 120 34s78-12 111-13"][variant];
  return <svg className="curve" viewBox="0 0 250 190"><path className="grid" d="M15 20v150h220M15 130h220M15 90h220M15 50h220M70 20v150M125 20v150M180 20v150" /><path className="chance" d="m15 170 220-150" /><path className="line" d={d} /></svg>;
}

export default function MethodComparison() {
  const [dataset, setDataset] = useState("CEDAR");
  const methods = [["Standard method", "The conventional approach", "0.842", "14.8%"], ["Shared yardstick", "One measure for everyone", "0.901", "9.7%"], ["Our method", "Adapts to each person", "0.918", "8.6%"]];
  return <div className="page"><PageHeader title="Method comparison" description="Research view: compare how well each method separates genuine and forged signatures." /><div className="dataset-tabs">{["CEDAR", "BHSig260 Bengali", "BHSig260 Hindi"].map(d => <button className={dataset === d ? "active" : ""} onClick={() => setDataset(d)} key={d}>{d}</button>)}</div><div className="method-grid">{methods.map((m, i) => <section className={`panel method-card ${i === 2 ? "ours" : ""}`} key={m[0]}><div className="method-title"><span>{String(i + 1).padStart(2, "0")}</span><div><h2>{m[0]}</h2><p>{m[1]}</p></div>{i === 2 && <Tag tone="accent">CURRENT</Tag>}</div><Curve variant={i} /><div className="method-values"><div><span>SEPARATION SCORE</span><strong>{m[2]}</strong><small>1.0 perfect · 0.5 guessing</small></div><div><span>ERROR RATE</span><strong>{m[3]}</strong></div></div></section>)}</div><section className="reliability panel"><Icon name="help" /><div><span>IS THE IMPROVEMENT RELIABLE?</span><h2>Validated statistical results have not been attached to this demonstration.</h2><p>The app will state the conclusion in plain language after the experiment output is connected. It will not invent a probability or significance result.</p></div></section><section className="tested panel"><span>TESTED, DID NOT HELP</span><div><Tag>Full person-specific measure</Tag><Tag>Earlier diagonal adaptation</Tag><Tag>Unregularised estimate</Tag></div></section></div>;
}
