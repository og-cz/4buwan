import { checkImageUrl, getCheck, getPerson, logReport, sampleUrl } from "../api/client";
import Button from "../components/Button";
import ConfidenceBar from "../components/ConfidenceBar";
import ComparisonBars from "../components/charts/ComparisonBars";
import MeasureProfile from "../components/charts/MeasureProfile";
import ScoreDistribution from "../components/charts/ScoreDistribution";
import PageHeader from "../components/PageHeader";
import SignatureImage from "../components/SignatureImage";
import { ErrorState, Loading } from "../components/States";
import { formatDate, pad2 } from "../format";
import type { Go } from "../navigation";
import useAsync from "../state/useAsync";
import { useSettings, useTerms } from "../state/settings";
import { LIMITATIONS } from "../limitations";


export default function EvidenceReport({ caseId, go }: { caseId?: string; go: Go }) {
  const settings = useSettings();
  const t = useTerms();
  const check = useAsync(() => caseId ? getCheck(caseId) : Promise.reject(new Error("No case selected.")), [caseId]);
  const personId = check.data?.person_id;
  const person = useAsync(() => personId ? getPerson(personId) : Promise.resolve(null), [personId]);

  if (check.loading) return <div className="page"><Loading title="Preparing Evidence Report" /></div>;
  if (check.error || !check.data) return <div className="page"><ErrorState message={check.error ?? "Not found."} retry={check.reload} /></div>;
  const c = check.data, r = c.result, p = person.data;

  return <div className="page evidence-report">
    <div className="no-print"><PageHeader title="Evidence Report" description={`Case ${c.id}. Print or save as PDF from the print dialog.`} action={<div className="header-actions"><Button secondary onClick={() => go("CaseDetail", { caseId: c.id })}>Back to Case</Button><Button icon="print" onClick={() => { void logReport(c.id).catch(() => undefined); window.print(); }}>Print or save as PDF</Button></div>} /></div>
    <section className="panel report-sheet">
      <header className="report-head">{settings.orgLogo && <img src={settings.orgLogo} alt="" />}<div><span>{(settings.orgName || "Signature Desk").toUpperCase()} · EVIDENCE REPORT</span><h1>{c.case_title || `Case ${c.id}`}</h1></div></header>
      <dl className="parameters-list report-facts">
        <div><dt>Case ID</dt><dd>{c.id}</dd></div><div><dt>Date</dt><dd>{formatDate(c.created, true)}</dd></div>
        <div><dt>{t.person}</dt><dd>{p ? `${p.name} (${p.external_id || "—"})` : "Deleted profile"}</dd></div><div><dt>Recorded decision</dt><dd>{c.decision}</dd></div>
      </dl>
      <div className="report-images"><div><span>QUESTIONED SIGNATURE</span><SignatureImage src={checkImageUrl(c.id)} alt="Questioned signature" /></div>{p && <div className="report-refs"><span>REFERENCE SAMPLES</span><div>{Array.from({ length: 12 }, (_, i) => <div key={i}><SignatureImage src={sampleUrl(p.id, i + 1)} alt={`Reference ${i + 1}`} /><small>R{pad2(i + 1)}</small></div>)}</div></div>}</div>
      <div className="report-verdict"><span>ADVISORY VERDICT</span><strong>{r.verdict}</strong><p>{r.reason}</p><ConfidenceBar result={r} /></div>
      <h2>A · Score against the Decision Line</h2><ScoreDistribution looScores={r.loo_scores} score={r.score} line={r.decision_line} low={r.uncertain_low} high={r.uncertain_high} />
      <h2>B · Comparison with each Reference Sample</h2><ComparisonBars comparisons={r.comparisons} matches={r.matches} majorityAccept={r.majority_rule_accept} />
      {p && <><h2>C · 17 Difference Measures</h2><MeasureProfile measures={r.measures} pairStats={p.pair_stats} /></>}
      <h2>Settings</h2>
      <dl className="parameters-list">
        <div><dt>Model</dt><dd>{r.settings.model_version}</dd></div><div><dt>Signature Consistency</dt><dd>{r.consistency.value.toFixed(3)} · {r.consistency.label}</dd></div>
        <div><dt>nu / gamma / rank</dt><dd>{r.settings.nu} / {r.settings.gamma} / {r.settings.rank}</dd></div><div><dt>Reference pairs</dt><dd>{r.settings.pairs}</dd></div>
        <div><dt>Policy</dt><dd>{r.policy}</dd></div><div><dt>Image quality</dt><dd>{r.quality?.ok ? "Good" : "—"}</dd></div>
      </dl>
      <h2>Limitations</h2><p className="report-text">{LIMITATIONS}</p>
      <div className="signature-line"><div><i /><span>Examiner signature</span></div><div><i /><span>Name and date</span></div></div>
    </section>
  </div>;
}
