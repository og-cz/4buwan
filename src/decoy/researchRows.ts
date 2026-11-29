import type { PerformanceRow } from "../types";

/** The published development-set results (notebook table_performance.csv), built in so the Researcher view can show
 *  the same Method Comparison and Dataset Check as the Verifier without calling the analysis service. */
export const researchRows: PerformanceRow[] = [
  {"condition": "B global diagonal", "scope": "Bengali", "writers": 45, "AUC": 0.779167, "EER": 0.260185, "FRR_T0": 0.614815, "FAR_T0": 0.094444, "FRR_T1": 0.812963, "FAR_T1": 0.07963},
  {"condition": "B global diagonal", "scope": "CEDAR", "writers": 25, "AUC": 0.824167, "EER": 0.236667, "FRR_T0": 0.733333, "FAR_T0": 0.05, "FRR_T1": 0.836667, "FAR_T1": 0.036667},
  {"condition": "B global diagonal", "scope": "Hindi", "writers": 72, "AUC": 0.814333, "EER": 0.226852, "FRR_T0": 0.707176, "FAR_T0": 0.052083, "FRR_T1": 0.78125, "FAR_T1": 0.037037},
  {"condition": "B global diagonal", "scope": "ALL", "writers": 142, "AUC": 0.80492, "EER": 0.239143, "FRR_T0": 0.682512, "FAR_T0": 0.065141, "FRR_T1": 0.801056, "FAR_T1": 0.050469},
  {"condition": "A per-writer diagonal (v9)", "scope": "Bengali", "writers": 45, "AUC": 0.793827, "EER": 0.226852, "FRR_T0": 0.675926, "FAR_T0": 0.062963, "FRR_T1": 0.861111, "FAR_T1": 0.053704},
  {"condition": "A per-writer diagonal (v9)", "scope": "CEDAR", "writers": 25, "AUC": 0.827222, "EER": 0.215, "FRR_T0": 0.826667, "FAR_T0": 0.033333, "FRR_T1": 0.913333, "FAR_T1": 0.016667},
  {"condition": "A per-writer diagonal (v9)", "scope": "Hindi", "writers": 72, "AUC": 0.811246, "EER": 0.241898, "FRR_T0": 0.767361, "FAR_T0": 0.046296, "FRR_T1": 0.836806, "FAR_T1": 0.025463},
  {"condition": "A per-writer diagonal (v9)", "scope": "ALL", "writers": 142, "AUC": 0.808539, "EER": 0.232394, "FRR_T0": 0.748826, "FAR_T0": 0.049296, "FRR_T1": 0.857981, "FAR_T1": 0.032864},
  {"condition": "E cohort-weighted diagonal (v10)", "scope": "Bengali", "writers": 45, "AUC": 0.769213, "EER": 0.256481, "FRR_T0": 0.568519, "FAR_T0": 0.148148, "FRR_T1": 0.785185, "FAR_T1": 0.105556},
  {"condition": "E cohort-weighted diagonal (v10)", "scope": "CEDAR", "writers": 25, "AUC": 0.820833, "EER": 0.218333, "FRR_T0": 0.763333, "FAR_T0": 0.063333, "FRR_T1": 0.82, "FAR_T1": 0.036667},
  {"condition": "E cohort-weighted diagonal (v10)", "scope": "Hindi", "writers": 72, "AUC": 0.807436, "EER": 0.233218, "FRR_T0": 0.642361, "FAR_T0": 0.111111, "FRR_T1": 0.734954, "FAR_T1": 0.060185},
  {"condition": "E cohort-weighted diagonal (v10)", "scope": "ALL", "writers": 142, "AUC": 0.797682, "EER": 0.237969, "FRR_T0": 0.640258, "FAR_T0": 0.114437, "FRR_T1": 0.765845, "FAR_T1": 0.070423},
  {"condition": "G pooled full covariance", "scope": "Bengali", "writers": 45, "AUC": 0.848302, "EER": 0.191667, "FRR_T0": 0.835185, "FAR_T0": 0.003704, "FRR_T1": 0.946296, "FAR_T1": 0.0},
  {"condition": "G pooled full covariance", "scope": "CEDAR", "writers": 25, "AUC": 0.845, "EER": 0.223333, "FRR_T0": 0.986667, "FAR_T0": 0.0, "FRR_T1": 0.986667, "FAR_T1": 0.0},
  {"condition": "G pooled full covariance", "scope": "Hindi", "writers": 72, "AUC": 0.852141, "EER": 0.195023, "FRR_T0": 0.962963, "FAR_T0": 0.003472, "FRR_T1": 0.97338, "FAR_T1": 0.003472},
  {"condition": "G pooled full covariance", "scope": "ALL", "writers": 142, "AUC": 0.849667, "EER": 0.198944, "FRR_T0": 0.926643, "FAR_T0": 0.002934, "FRR_T1": 0.967136, "FAR_T1": 0.001761},
  {"condition": "J R1-WAW (proposed)", "scope": "Bengali", "writers": 45, "AUC": 0.854475, "EER": 0.20463, "FRR_T0": 0.82963, "FAR_T0": 0.001852, "FRR_T1": 0.942593, "FAR_T1": 0.0},
  {"condition": "J R1-WAW (proposed)", "scope": "CEDAR", "writers": 25, "AUC": 0.845556, "EER": 0.213333, "FRR_T0": 0.966667, "FAR_T0": 0.0, "FRR_T1": 0.97, "FAR_T1": 0.0},
  {"condition": "J R1-WAW (proposed)", "scope": "Hindi", "writers": 72, "AUC": 0.86468, "EER": 0.177083, "FRR_T0": 0.929398, "FAR_T0": 0.006944, "FRR_T1": 0.951389, "FAR_T1": 0.003472},
  {"condition": "J R1-WAW (proposed)", "scope": "ALL", "writers": 142, "AUC": 0.858079, "EER": 0.192195, "FRR_T0": 0.904343, "FAR_T0": 0.004108, "FRR_T1": 0.951878, "FAR_T1": 0.001761},
  {"condition": "D-G trivial control, G-whitened", "scope": "Bengali", "writers": 45, "AUC": 0.930247, "EER": 0.088889, "FRR_T0": 0.581481, "FAR_T0": 0.016667, "FRR_T1": 0.6, "FAR_T1": 0.012963},
  {"condition": "D-G trivial control, G-whitened", "scope": "CEDAR", "writers": 25, "AUC": 0.8025, "EER": 0.223333, "FRR_T0": 0.796667, "FAR_T0": 0.04, "FRR_T1": 0.816667, "FAR_T1": 0.063333},
  {"condition": "D-G trivial control, G-whitened", "scope": "Hindi", "writers": 72, "AUC": 0.786748, "EER": 0.247106, "FRR_T0": 0.678241, "FAR_T0": 0.082176, "FRR_T1": 0.721065, "FAR_T1": 0.072917},
  {"condition": "D-G trivial control, G-whitened", "scope": "ALL", "writers": 142, "AUC": 0.834996, "EER": 0.192782, "FRR_T0": 0.668427, "FAR_T0": 0.053991, "FRR_T1": 0.699531, "FAR_T1": 0.05223},
];
