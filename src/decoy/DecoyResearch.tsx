import { useState } from "react";
import Button from "../components/Button";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Tag from "../components/Tag";

function Curve({ variant }: { variant: number }) {
  const d = ["M15 170C44 122 84 87 126 58s72-31 105-37", "M15 170C40 102 79 66 122 43s76-20 109-22", "M15 170C38 90 76 53 120 34s78-12 111-13"][variant];
  return <svg className="curve" viewBox="0 0 250 190"><path className="grid" d="M15 20v150h220M15 130h220M15 90h220M15 50h220M70 20v150M125 20v150M180 20v150" /><path className="chance" d="m15 170 220-150" /><path className="line" d={d} /></svg>;
}

/** Demo: method comparison with example values. */
export function DecoyMethods() {
  const [dataset, setDataset] = useState("CEDAR");
  const methods = [["Standard method", "The conventional approach", "0.842", "14.8%"], ["Shared yardstick", "One measure for everyone", "0.901", "9.7%"], ["Our method", "Adapts to each person", "0.918", "8.6%"]];
  return <div className="page"><PageHeader title="Method comparison" description="Research view: compare how well each method separates genuine and forged signatures." />
    <div className="dataset-tabs">{["CEDAR", "BHSig260 Bengali", "BHSig260 Hindi"].map(d => <button className={dataset === d ? "active" : ""} onClick={() => setDataset(d)} key={d}>{d}</button>)}</div>
    <div className="method-grid">{methods.map((m, i) => <section className={`panel method-card ${i === 2 ? "ours" : ""}`} key={m[0]}><div className="method-title"><span>{String(i + 1).padStart(2, "0")}</span><div><h2>{m[0]}</h2><p>{m[1]}</p></div>{i === 2 && <Tag tone="accent">CURRENT</Tag>}</div><Curve variant={i} /><div className="method-values"><div><span>SEPARATION SCORE</span><strong>{m[2]}</strong><small>1.0 perfect · 0.5 guessing</small></div><div><span>ERROR RATE</span><strong>{m[3]}</strong></div></div></section>)}</div>
    <section className="reliability panel"><Icon name="help" /><div><span>IS THE IMPROVEMENT RELIABLE?</span><h2>Validated statistical results have not been attached to this demonstration.</h2><p>The app will state the conclusion in plain language after the experiment output is connected. It will not invent a probability or significance result.</p></div></section>
    <section className="tested panel"><span>TESTED, DID NOT HELP</span><div><Tag>Full person-specific measure</Tag><Tag>Earlier diagonal adaptation</Tag><Tag>Unregularised estimate</Tag></div></section>
  </div>;
}

/** Demo: dataset check with example values. */
export function DecoyDataset() {
  const [stage, setStage] = useState(0);
  const facts: [string, number][] = [["Brightness", .87], ["Amount of ink", .78], ["Image dimensions", .91]];
  const drop = [0, .03, .24, .3, .38][stage];
  return <div className="page"><PageHeader title="Dataset check" description="Can this dataset be solved without reading the handwriting at all?" action={<Tag tone="neutral">RESEARCHER VIEW</Tag>} />
    <div className="dataset-toolbar"><label><span>DATASET</span><select><option>BHSig260 Bengali</option><option>BHSig260 Hindi</option><option>CEDAR</option></select></label><div><span>IMAGE CLEANING STAGE</span><section>{["Original", "Gray", "Cleaned", "Cropped", "Resized"].map((s, i) => <button className={stage === i ? "active" : ""} onClick={() => setStage(i)} key={s}>{s}</button>)}</section></div><Button icon="audit">Run dataset check</Button></div>
    <div className="facts-grid">{facts.map(([name, base], i) => { const v = Math.max(.51, base - drop); return <section className="panel fact-card" key={name}><span>SIMPLE IMAGE FACT {i + 1}</span><h2>{name}</h2><strong>{v.toFixed(2)}</strong><small>SEPARATION SCORE</small><div className="fact-meter"><i /><em style={{ width: `${(v - .5) * 200}%` }} /></div><div><span>0.50 guessing</span><span>1.00 perfect</span></div><Tag tone={v > .65 ? "bad" : "ready"}>{v > .65 ? "SHORTCUT PRESENT" : "NEAR GUESSING"}</Tag></section>; })}</div>
    <section className="panel plain-verdict"><div><Icon name="audit" size={24} /></div><section><span>PLAIN VERDICT</span><h2>{stage < 3 ? "The shortcut does too well at this stage." : "Our method clearly does better after full image cleaning."}</h2><p>{stage < 3 ? "Simple facts about the image can separate genuine and forged samples without reading the handwriting. Do not trust handwriting results at this stage." : "After resizing, the simple image facts fall close to guessing while the handwriting method remains useful."}</p></section><div><span>OUR METHOD</span><strong>0.918</strong><small>vs simple facts {Math.max(.51, .91 - drop).toFixed(2)}</small></div></section>
  </div>;
}
