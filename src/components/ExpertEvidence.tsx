import type { ReactNode } from "react";
import { preprocess, sampleUrl } from "../api/client";
import useAsync from "../state/useAsync";
import ComparisonBars from "./charts/ComparisonBars";
import MeasureProfile from "./charts/MeasureProfile";
import ScoreDistribution from "./charts/ScoreDistribution";
import SimilarityHeatmap from "./charts/SimilarityHeatmap";
import SignatureImage from "./SignatureImage";
import { pad2, signed } from "../format";
import type { MethodName, PersonDetail, VerifyResult } from "../types";

const stageNames = ["Original", "Inverted", "Background removed", "Cropped and padded", "100 × 100"] as const;
const methods: MethodName[] = ["Standard method", "Shared yardstick", "Our method"];

function Card({ code, title, what, wide, children }: { code: string; title: string; what: string; wide?: boolean; children: ReactNode }) {
  return <article className={`panel analysis-card ${wide ? "measure-card" : ""}`}><div className="panel-head"><div><span>{code} · {title}</span><h2>{what}</h2></div></div>{children}</article>;
}

type Props = { result: VerifyResult; person: PersonDetail; questioned: Blob | null };

export default function ExpertEvidence({ result, person, questioned }: Props) {
  const trace = useAsync(() => questioned ? preprocess(questioned) : Promise.resolve(null), [questioned]);
  const best = result.comparisons.reduce((a, b) => b.value > a.value ? b : a, result.comparisons[0]);
  return <section className="expert-section"><div className="expert-heading"><div><span>EXPERT VIEW</span><h2>Analysis evidence</h2></div><p>Exact values and technical panels for examination and audit.</p></div><div className="expert-grid">
    <Card code="A" title="SCORE VS DECISION LINE" what="This signature's score against the person's own genuine scores">
      <ScoreDistribution looScores={result.loo_scores} score={result.score} line={result.decision_line} low={result.uncertain_low} high={result.uncertain_high} />
    </Card>
    <Card code="B" title="12 COMPARISONS" what="Model output for the questioned signature paired with each Reference Sample">
      <ComparisonBars comparisons={result.comparisons} matches={result.matches} majorityAccept={result.majority_rule_accept} />
    </Card>
    <Card code="C" title="17 DIFFERENCE MEASURES" what="Questioned values against the person's genuine range" wide>
      <MeasureProfile measures={result.measures} pairStats={person.pair_stats} />
    </Card>
    <Card code="D" title="SIMILARITY MATRIX" what="12 references and the questioned signature">
      <SimilarityHeatmap matrix={result.similarity_matrix} questioned />
    </Card>
    <Card code="E" title="STROKE-DIRECTION MAP" what="HOG picture of the cleaned questioned signature beside its most similar reference">
      {trace.data ? <div className="trace hog-pair"><div><SignatureImage src={trace.data.hog} alt="Stroke-direction map" /><span>Questioned · HOG</span></div><div><SignatureImage src={sampleUrl(person.id, best.reference)} alt={`Reference ${best.reference}`} /><span>Reference {pad2(best.reference)}</span></div></div> : <p className="chart-note">{trace.error ?? (questioned ? "Preparing…" : "The questioned image is not available.")}</p>}
    </Card>
    <Card code="F" title="PREPROCESSING TRACE" what="The five image stages the model sees">
      {trace.data ? <div className="trace">{(["S0", "S1", "S2", "S3", "S4"] as const).map((k, i) => <div key={k}><SignatureImage src={trace.data!.stages[k]} alt={stageNames[i]} /><span>{stageNames[i]}</span></div>)}</div> : <p className="chart-note">{trace.error ?? "Preparing…"}</p>}
    </Card>
    <Card code="G" title="PROFILE PARAMETERS" what="Read-only model record for this check">
      <dl className="parameters-list">
        <div><dt>Signature Consistency</dt><dd>{result.consistency.value.toFixed(3)}× population · {result.consistency.label}</dd></div>
        <div><dt>nu</dt><dd>{result.settings.nu}</dd></div><div><dt>gamma</dt><dd>{result.settings.gamma}</dd></div>
        <div><dt>rank</dt><dd>{result.settings.rank}</dd></div><div><dt>Reference pairs</dt><dd>{result.settings.pairs}</dd></div>
        <div><dt>Model</dt><dd>{result.settings.model_version}</dd></div>
      </dl>
      <p className="chart-note">{result.consistency.text}</p><p className="chart-note policy-line">Policy: {result.policy}</p>
    </Card>
    <Card code="H" title="METHOD COMPARISON" what="The same check scored by the three methods">
      <div className="table-scroll"><table><thead><tr><th>METHOD</th><th>CODE</th><th>SCORE</th><th>MATCHES</th></tr></thead><tbody>{methods.map(m => { const r = result.method_comparison[m]; return r ? <tr key={m}><td>{m}</td><td>{r.code}</td><td>{signed(r.score)}</td><td>{r.matches} of 12</td></tr> : null; })}</tbody></table></div>
      <p className="chart-note">Scores are on different scales; compare verdicts, not raw numbers.</p>
    </Card>
  </div></section>;
}
