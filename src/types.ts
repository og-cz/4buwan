/** Response types of the Signature Desk API (backend/app/main.py). */

export type Verdict = "LIKELY GENUINE" | "LIKELY FORGED" | "UNCERTAIN";
export type Decision = "Pending" | "Accepted" | "Rejected" | "Needs more evidence";
export type Strictness = "Lenient" | "Standard" | "Strict";
export type UncertainZone = "Narrow" | "Standard" | "Wide";

export type Percentiles = { p5: number; p10: number; p25: number; p50: number; p75: number; p90: number; p95: number };

export type ModelSettings = {
  nu: number; gamma: string; rank: number; n_enrol: number; pairs: number; measures: number;
  hog_dim: number; image: string; hog: string;
};

export type ModelMeta = {
  model_version: string; built_from: string; corpora: Record<string, number>; feature_config_hash: string;
  constants_sha1: string; exported: string; settings: ModelSettings; consistency_percentiles: Percentiles;
};

export type Health = { ok: boolean; model: ModelMeta };

export type QualityIssue = { code: string; message: string };
export type Quality = { ok: boolean; ink_fraction: number; issues: QualityIssue[] };

export type Consistency = { value: number; label: string; text: string; population: Percentiles };

export type PersonSummary = {
  id: string; name: string; external_id: string; status: string; created: string;
  consistency: Consistency; n_checks: number;
};

export type MeasureStats = { min: number; q25: number; median: number; q75: number; max: number };

export type PersonDetail = {
  id: string; name: string; external_id: string; status: string; created: string;
  consistency: Consistency; pairs: number; loo_scores: number[];
  pair_stats: Record<string, MeasureStats>; reference_similarity: number[][];
  samples?: string[];
};

export type Comparison = { reference: number; value: number };
export type MeasureValues = { name: string; questioned: number[] };
export type MethodScore = { code: string; score: number; matches: number };
export type MethodName = "Standard method" | "Shared yardstick" | "Our method";

export type VerifyResult = {
  case_id: string; verdict: Verdict; confidence: number; position: number; score: number;
  decision_line: number; uncertain_low: number; uncertain_high: number; matches: number;
  majority_rule_accept: boolean; reason: string; policy: string; comparisons: Comparison[];
  measures: MeasureValues[]; similarity_matrix: number[][]; loo_scores: number[];
  method_comparison: Record<MethodName, MethodScore>; consistency: Consistency;
  settings: { nu: number; gamma: string; rank: number; pairs: number; model_version: string };
  quality: Quality;
};

export type CheckSummary = {
  id: string; person_id: string; name: string | null; created: string; verdict: Verdict;
  confidence: number; decision: Decision; case_title: string;
};

export type TimelineEvent = { at: string; kind: string; detail: string };

export type CheckDetail = {
  id: string; person_id: string; created: string; case_title: string; notes: string;
  decision: Decision; timeline: TimelineEvent[]; result: VerifyResult;
};

export type Preprocessed = { stages: Record<"S0" | "S1" | "S2" | "S3" | "S4", string>; hog: string };

export type PerformanceRow = {
  condition: string; scope: string; writers: number; AUC: number; EER: number;
  FRR_T0: number; FAR_T0: number; FRR_T1: number; FAR_T1: number;
};

export type ResearchResults = {
  auc: Record<string, Record<string, number>>;
  split: { development: Record<string, string>; reserved: Record<string, string> };
  checks: Record<string, { status: string; detail: string }>;
};

export type Stats = {
  checks: number; per_day: { date: string; checks: number }[]; verdicts: Record<Verdict, number>;
  uncertain_rate: number | null; pending: number; decided: number; human_agreement: number | null;
  average_confidence: number | null; persons: Record<string, number>;
};

export type Attachment = { id: string; created: string; name: string; note: string; url: string };
export type ReportEntry = { at: string; case_id: string; case_title: string; verdict: Verdict; decision: Decision; name: string | null };
