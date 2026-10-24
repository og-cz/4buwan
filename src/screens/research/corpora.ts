import type { PerformanceRow } from "../../types";

export type Corpus = "ALL" | "CEDAR" | "Bengali" | "Hindi";
export const corpora: [Corpus, string][] = [["ALL", "All"], ["CEDAR", "CEDAR"], ["Bengali", "Bengali"], ["Hindi", "Hindi"]];

/** Condition labels exactly as written in the notebook's table_performance.csv. */
export const CONDITIONS = {
  standard: "B global diagonal",
  shared: "G pooled full covariance",
  ours: "J rank-1 writer-adaptive (proposed)",
  perWriter: "A per-writer diagonal (v9)",
  cohort: "E cohort-weighted diagonal (v10)",
  shortcut: "D-G trivial control, G-whitened",
} as const;

export const find = (rows: PerformanceRow[], condition: string, scope: Corpus) =>
  rows.find(r => r.condition === condition && r.scope === scope);
