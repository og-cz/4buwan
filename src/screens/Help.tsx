import Icon, { type IconName } from "../components/Icon";
import PageHeader from "../components/PageHeader";
import { useTerms } from "../state/settings";

export default function Help() {
  const t = useTerms();
  const steps: [string, string, IconName, string][] = [
    ["01", "Enrol", "enrol", `Enrol 12 genuine signatures of the ${t.lower}. No forged samples are needed.`],
    ["02", "Profile", "user", `The tool learns how much this ${t.lower}'s signature naturally varies (Signature Consistency).`],
    ["03", "Verify", "verify", "A Questioned Signature is compared with each of the 12 using 17 kinds of difference and scored by a model trained only on genuine signatures."],
    ["04", "Decide", "check", "A human reviews the Verdict and the evidence, then records the decision."],
  ];
  const glossary: [string, string][] = [
    ["R1-WAW", "Our method: Rank-One Writer-Adaptive Whitening. It uses a yardstick shared by many writers and adapts it to the person along one direction, the one where people differ most."],
    ["Reference Sample", "One of the 12 genuine signatures stored for a person."],
    ["Signature Consistency", "The person's spread along the main direction divided by the population's spread. Below 1 means more consistent, so checks are stricter."],
    ["Verdict", "Likely genuine, Likely forged or Uncertain. It is advice, not a decision."],
    ["Confidence", "How far the score is from the Decision Line, from 50 (on the line) to 95. It is not a probability."],
    ["Decision Line", "The score below which a signature is called forged. It sits below this person's typical genuine score."],
    ["Uncertain Zone", "Scores close to the Decision Line. Ask for another sample."],
    ["Comparison", "The model output for the questioned signature paired with one Reference Sample."],
    ["Difference Measure", "One of 17 ways two signatures are compared (distances, angle, correlation and summary values)."],
  ];
  return <div className="page"><PageHeader title="Help" description="How Signature Desk works and how to collect reliable evidence." />
    <div className="help-steps">{steps.map(x => <section className="panel" key={x[0]}><span>{x[0]}</span><Icon name={x[2]} size={22} /><h2>{x[1]}</h2><p>{x[3]}</p></section>)}</div>
    <section className="panel model-card"><h2>Glossary</h2><dl>{glossary.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></section>
    <section className="panel limitations"><Icon name="alert" /><div><h2>Honest limitations</h2><p>Signature Desk supports, not replaces, human judgement. Skilled forgeries can be close to genuine signatures. Poor scans can hide useful handwriting detail. Expect some wrong Verdicts: use Uncertain and a second sample when the evidence is not clear.</p></div></section>
  </div>;
}
