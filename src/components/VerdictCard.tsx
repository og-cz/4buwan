import type { ReactNode } from "react";
import ConfidenceBar from "./ConfidenceBar";
import Icon from "./Icon";
import type { VerifyResult } from "../types";

const nextStep: Record<VerifyResult["verdict"], string> = {
  "LIKELY GENUINE": "Accept, or record a decision.",
  "LIKELY FORGED": "Do not accept. Ask for ID or another sample.",
  UNCERTAIN: "Ask for another sample and check it too.",
};

type Props = { result: VerifyResult; label?: string; uncertainAction?: ReactNode; actions?: ReactNode };

export default function VerdictCard({ result, label = "ADVISORY VERDICT", uncertainAction, actions }: Props) {
  const genuine = result.verdict === "LIKELY GENUINE", uncertain = result.verdict === "UNCERTAIN";
  return <>
    <div className="result-top"><span className={`verdict-icon ${genuine ? "good" : uncertain ? "warn" : "bad"}`}><Icon name={genuine ? "check" : "alert"} size={26} /></span><div><span>{label}</span><strong>{result.verdict}</strong><small>{result.reason}</small></div></div>
    <ConfidenceBar result={result} />
    <div className="next-steps"><strong>Recommended next step</strong><p className="next-step-text">{nextStep[result.verdict]}</p>{uncertain && uncertainAction && <div>{uncertainAction}</div>}</div>
    {actions && <div className="result-actions">{actions}</div>}
    <p className="advice"><Icon name="help" size={14} />The tool advises; a human makes the final decision.</p>
  </>;
}
