import { spread } from "../format";
import type { VerifyResult } from "../types";

/** Same display scale the API uses for `position`: 100 / (1 + e^(-2z)), z in units of the person's genuine-score spread. */
function toPosition(value: number, line: number, s: number) {
  return 100 / (1 + Math.exp(-2 * (value - line) / (s || 1e-6)));
}

export default function ConfidenceBar({ result }: { result: VerifyResult }) {
  const s = spread(result.loo_scores);
  const low = toPosition(result.uncertain_low, result.decision_line, s);
  const high = toPosition(result.uncertain_high, result.decision_line, s);
  return <div className="confidence">
    <div><span>Different</span><span>Uncertain Zone</span><span>Similar</span></div>
    <i><em style={{ left: `${low}%`, width: `${high - low}%` }} /><b className="decision-mark" style={{ left: "50%" }} title="Decision Line" /><b style={{ left: `calc(${result.position}% - 1.5px)` }} title="This signature" /></i>
    <p>Confidence: {result.confidence} of 100. The shaded area is the Uncertain Zone; the thin line is the Decision Line.</p>
  </div>;
}
