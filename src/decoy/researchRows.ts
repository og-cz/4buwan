import type { PerformanceRow } from "../types";

/** The published development-set results (notebook table_performance.csv), built in so the Researcher view can show
 *  the same Method Comparison and Dataset Check as the Verifier without calling the analysis service. */
export const researchRows: PerformanceRow[] = [
  {"condition": "B global diagonal", "scope": "Bengali", "writers": 45, "AUC": 0.702469, "EER": 0.318519, "FRR_T0": 0.298148, "FAR_T0": 0.322222, "FRR_T1": 0.498148, "FAR_T1": 0.281481},
  {"condition": "B global diagonal", "scope": "CEDAR", "writers": 25, "AUC": 0.816111, "EER": 0.223333, "FRR_T0": 0.346667, "FAR_T0": 0.186667, "FRR_T1": 0.383333, "FAR_T1": 0.15},
  {"condition": "B global diagonal", "scope": "Hindi", "writers": 72, "AUC": 0.800733, "EER": 0.232639, "FRR_T0": 0.315972, "FAR_T0": 0.24537, "FRR_T1": 0.384259, "FAR_T1": 0.209491},
  {"condition": "B global diagonal", "scope": "ALL", "writers": 142, "AUC": 0.7723, "EER": 0.258216, "FRR_T0": 0.315728, "FAR_T0": 0.25939, "FRR_T1": 0.420188, "FAR_T1": 0.221831},
  {"condition": "A per-writer diagonal (v9)", "scope": "Bengali", "writers": 45, "AUC": 0.71821, "EER": 0.293519, "FRR_T0": 0.314815, "FAR_T0": 0.288889, "FRR_T1": 0.512963, "FAR_T1": 0.262963},
  {"condition": "A per-writer diagonal (v9)", "scope": "CEDAR", "writers": 25, "AUC": 0.821111, "EER": 0.216667, "FRR_T0": 0.373333, "FAR_T0": 0.173333, "FRR_T1": 0.416667, "FAR_T1": 0.14},
  {"condition": "A per-writer diagonal (v9)", "scope": "Hindi", "writers": 72, "AUC": 0.803578, "EER": 0.229745, "FRR_T0": 0.351852, "FAR_T0": 0.215278, "FRR_T1": 0.420139, "FAR_T1": 0.168981},
  {"condition": "A per-writer diagonal (v9)", "scope": "ALL", "writers": 142, "AUC": 0.779612, "EER": 0.247653, "FRR_T0": 0.343897, "FAR_T0": 0.231221, "FRR_T1": 0.448944, "FAR_T1": 0.193662},
  {"condition": "E cohort-weighted diagonal (v10)", "scope": "Bengali", "writers": 45, "AUC": 0.710031, "EER": 0.337037, "FRR_T0": 0.259259, "FAR_T0": 0.362963, "FRR_T1": 0.45, "FAR_T1": 0.307407},
  {"condition": "E cohort-weighted diagonal (v10)", "scope": "CEDAR", "writers": 25, "AUC": 0.825, "EER": 0.213333, "FRR_T0": 0.343333, "FAR_T0": 0.196667, "FRR_T1": 0.396667, "FAR_T1": 0.146667},
  {"condition": "E cohort-weighted diagonal (v10)", "scope": "Hindi", "writers": 72, "AUC": 0.79239, "EER": 0.239005, "FRR_T0": 0.293981, "FAR_T0": 0.24537, "FRR_T1": 0.369213, "FAR_T1": 0.184028},
  {"condition": "E cohort-weighted diagonal (v10)", "scope": "ALL", "writers": 142, "AUC": 0.772031, "EER": 0.265552, "FRR_T0": 0.291667, "FAR_T0": 0.274061, "FRR_T1": 0.399648, "FAR_T1": 0.216549},
  {"condition": "G pooled full covariance", "scope": "Bengali", "writers": 45, "AUC": 0.795525, "EER": 0.255556, "FRR_T0": 0.47037, "FAR_T0": 0.153704, "FRR_T1": 0.551852, "FAR_T1": 0.144444},
  {"condition": "G pooled full covariance", "scope": "CEDAR", "writers": 25, "AUC": 0.837778, "EER": 0.215, "FRR_T0": 0.64, "FAR_T0": 0.07, "FRR_T1": 0.606667, "FAR_T1": 0.066667},
  {"condition": "G pooled full covariance", "scope": "Hindi", "writers": 72, "AUC": 0.850694, "EER": 0.199074, "FRR_T0": 0.528935, "FAR_T0": 0.087963, "FRR_T1": 0.519676, "FAR_T1": 0.081019},
  {"condition": "G pooled full covariance", "scope": "ALL", "writers": 142, "AUC": 0.830937, "EER": 0.219777, "FRR_T0": 0.52993, "FAR_T0": 0.105634, "FRR_T1": 0.545188, "FAR_T1": 0.098592},
  {"condition": "J rank-1 writer-adaptive (proposed)", "scope": "Bengali", "writers": 45, "AUC": 0.801389, "EER": 0.253704, "FRR_T0": 0.475926, "FAR_T0": 0.146296, "FRR_T1": 0.553704, "FAR_T1": 0.138889},
  {"condition": "J rank-1 writer-adaptive (proposed)", "scope": "CEDAR", "writers": 25, "AUC": 0.838611, "EER": 0.213333, "FRR_T0": 0.643333, "FAR_T0": 0.07, "FRR_T1": 0.606667, "FAR_T1": 0.066667},
  {"condition": "J rank-1 writer-adaptive (proposed)", "scope": "Hindi", "writers": 72, "AUC": 0.858218, "EER": 0.1875, "FRR_T0": 0.53125, "FAR_T0": 0.083333, "FRR_T1": 0.52662, "FAR_T1": 0.082176},
  {"condition": "J rank-1 writer-adaptive (proposed)", "scope": "ALL", "writers": 142, "AUC": 0.836757, "EER": 0.213028, "FRR_T0": 0.533451, "FAR_T0": 0.100939, "FRR_T1": 0.549296, "FAR_T1": 0.097418},
  {"condition": "D-G trivial control, G-whitened", "scope": "Bengali", "writers": 45, "AUC": 0.93642, "EER": 0.07963, "FRR_T0": 0.259259, "FAR_T0": 0.066667, "FRR_T1": 0.253704, "FAR_T1": 0.061111},
  {"condition": "D-G trivial control, G-whitened", "scope": "CEDAR", "writers": 25, "AUC": 0.800278, "EER": 0.213333, "FRR_T0": 0.493333, "FAR_T0": 0.186667, "FRR_T1": 0.516667, "FAR_T1": 0.163333},
  {"condition": "D-G trivial control, G-whitened", "scope": "Hindi", "writers": 72, "AUC": 0.788291, "EER": 0.239583, "FRR_T0": 0.366898, "FAR_T0": 0.207176, "FRR_T1": 0.376157, "FAR_T1": 0.208333},
  {"condition": "D-G trivial control, G-whitened", "scope": "ALL", "writers": 142, "AUC": 0.837344, "EER": 0.184272, "FRR_T0": 0.355047, "FAR_T0": 0.159038, "FRR_T1": 0.362089, "FAR_T1": 0.153756},
];
