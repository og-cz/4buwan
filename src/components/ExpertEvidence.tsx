import type { ReactNode } from "react";
import { preprocess, sampleUrl } from "../api/client";
import useAsync from "../state/useAsync";
import ComparisonBars from "./charts/ComparisonBars";
import MeasureProfile from "./charts/MeasureProfile";
import ScoreDistribution from "./charts/ScoreDistribution";
import SimilarityHeatmap from "./charts/SimilarityHeatmap";
import HogPanel from "./viewer/HogPanel";
import TracePanel from "./viewer/TracePanel";
import { signed } from "../format";
import { OUR_METHOD } from "../methods";
import type { MethodName, PersonDetail, VerifyResult } from "../types";

const methods: [MethodName, string][] = [["Our method", OUR_METHOD], ["Shared yardstick", "Shared yardstick"], ["Standard method", "Standard method"]];

function Card({ code, title, what, span, children }: { code: string; title: string; what: string; span?: "rows" | "cols"; children: ReactNode }) {
  return <article className={`panel analysis-card ${span === "rows" ? "measure-card" : span === "cols" ? "span-cols" : ""}`}><div className="panel-head"><div><span>{code} · {title}</span><h2>{what}</h2></div></div>{children}</article>;
}

type Props = { result: VerifyResult; person: PersonDetail; questioned: Blob | null; reference?: number };

export default function ExpertEvidence({ result, person, questioned, reference }: Props) {
  const trace = useAsync(() => questioned ? preprocess(questioned) : Promise.resolve(null), [questioned]);
  const best = result.comparisons.reduce((a, b) => b.value > a.value ? b : a, result.comparisons[0]);
  const chosen = reference ?? best.reference;
  return <section className="expert-section"><div className="expert-heading"><div><span>ANALYSIS</span><h2>Analysis evidence</h2></div><p>Exact values and technical panels for examination and audit.</p></div><div className="expert-grid">
    <Card code="A" title="SCORE VS DECISION LINE" what="This signature's score against the person's own genuine scores">
      <ScoreDistribution looScores={result.loo_scores} score={result.score} line={result.decision_line} low={result.uncertain_low} high={result.uncertain_high} />
    </Card>
    <Card code="B" title="12 COMPARISONS" what="Model output for the questioned signature paired with each Reference Sample">
      <ComparisonBars comparisons={result.comparisons} matches={result.matches} majorityAccept={result.majority_rule_accept} />
    </Card>
    <Card code="C" title="17 DIFFERENCE MEASURES" what="Questioned values against the person's genuine range" span="rows">
      <MeasureProfile measures={result.measures} pairStats={person.pair_stats} />
    </Card>
    <Card code="D" title="SIMILARITY MATRIX" what="12 references and the questioned signature">
      <SimilarityHeatmap matrix={result.similarity_matrix} questioned />
    </Card>
    <Card code="E" title="STROKE-DIRECTION MAP" what="HOG maps of the cleaned questioned signature and the selected reference" span="cols">
      {trace.data ? <HogPanel questionedHog={trace.data.hog} personId={person.id} reference={chosen} /> : <p className="chart-note">{trace.error ?? (questioned ? "Preparing…" : "The questioned image is not available.")}</p>}
    </Card>
    <Card code="F" title="PREPROCESSING TRACE" what="The five image stages the model sees" span="cols">
      {trace.data ? <TracePanel data={trace.data} /> : <p className="chart-note">{trace.error ?? "Preparing…"}</p>}
    </Card>
    <Card code="G" title="PROFILE PARAMETERS" what="Read-only model record for this check">
      <dl className="parameters-list">
        <div><dt>Signature Consistency</dt><dd>{result.consistency.value.toFixed(3)}× population · {result.consistency.label}</dd></div>
        <div><dt>nu</dt><dd>{result.settings.nu}</dd></div><div><dt>gamma</dt><dd>{result.settings.gamma}</dd></div>
        <div><dt>rank</dt><dd>{result.settings.rank}</dd></div><div><dt>Reference pairs</dt><dd>{result.settings.pairs}</dd></div>
        <div><dt>Model</dt><dd>R1-WAW, model version {result.settings.model_version}</dd></div>
      </dl>
      <p className="chart-note">{result.consistency.text}</p><p className="chart-note policy-line">Policy: {result.policy}</p>
    </Card>
    <Card code="H" title="METHOD COMPARISON" what="The same check scored by the three methods">
      <div className="table-scroll"><table><thead><tr><th>METHOD</th><th>CODE</th><th>SCORE</th><th>MATCHES</th></tr></thead><tbody>{methods.map(([m, label], i) => { const r = result.method_comparison[m]; return r ? <tr key={m}><td><span className="num">0{i + 1}</span> {label}</td><td>{r.code}</td><td className="num">{signed(r.score)}</td><td className="num">{r.matches} of 12</td></tr> : null; })}</tbody></table></div>
      <p className="chart-note">Scores are on different scales; compare verdicts, not raw numbers.</p>
    </Card>
  </div></section>;
}
