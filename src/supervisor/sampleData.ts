export const samplePeople = [
  { name: "Sample Person 05", id: "CEDAR-005", status: "Ready", consistency: 1.183, label: "Variable" },
  { name: "Sample Person 10", id: "CEDAR-010", status: "Ready", consistency: 0.65, label: "Typical" },
  { name: "Sample Person 16", id: "CEDAR-016", status: "Ready", consistency: 0.48, label: "Very consistent" },
  { name: "Sample Person 17", id: "CEDAR-017", status: "Ready", consistency: 0.74, label: "Typical" },
  { name: "Sample Person 18", id: "CEDAR-018", status: "Ready", consistency: 1.21, label: "Variable" },
  { name: "Sample Person 20", id: "CEDAR-020", status: "Ready", consistency: 1.34, label: "Variable" },
  { name: "Sample Person 21", id: "CEDAR-021", status: "Ready", consistency: 0.81, label: "Typical" },
  { name: "Sample Person 12", id: "CEDAR-012", status: "Ready", consistency: 1.09, label: "Variable" },
];

export const consistencyPopulation = { p05: 0.42, p25: 0.57, median: 0.74, p75: 0.99, p95: 1.95 };

export const checks = [
  {
    id: "C-7F3A21B0", known: "Genuine", verdict: "LIKELY GENUINE", confidence: 95, score: 0.247, matches: "12 of 12",
    reason: "Scores within this person's normal range of genuine signatures.", next: "Accept, or record a decision.",
    comparisons: [0.116, 0.276, 0.307, 0.214, 0.337, 0.259, 0.169, 0.176, 0.404, 0.113, 0.246, 0.345],
  },
  {
    id: "C-2B9D44E1", known: "Genuine", verdict: "UNCERTAIN", confidence: 64, score: -0.119, matches: "1 of 12",
    reason: "Scores at the edge of this person's normal range - ask for another sample.", next: "Request another sample.",
    comparisons: [-0.186, -0.097, -0.018, 0.016, -0.008, -0.202, -0.235, -0.168, -0.001, -0.229, -0.096, -0.208],
  },
  {
    id: "C-91E0C5D7", known: "Forgery", verdict: "LIKELY FORGED", confidence: 95, score: -0.389, matches: "0 of 12",
    reason: "Scores well below this person's normal range of genuine signatures.", next: "Do not accept. Ask for ID or another sample.",
    comparisons: [-0.394, -0.492, -0.141, -0.103, -0.178, -0.589, -0.573, -0.332, -0.542, -0.602, -0.499, -0.226],
  },
] as const;

export const decision = {
  line: -0.154,
  uncertain: [-0.272, -0.036],
  referenceScores: [-0.119, -0.265, 0.064, 0.136, 0.015, 0.020, -0.190, 0.021, 0.064, -0.183, -0.002, 0.004],
};

export const differenceMeasures = ["L1", "L2", "Linf", "cosine", "correlation", "canberra", "braycurtis", "absdiff_std", "absdiff_median", "absdiff_p90", "d_mean", "d_std", "d_max", "d_energy", "chi2", "hist_inter", "d_sum"];

export const profileParameters = {
  consistency: "1.183 x population - Variable", nu: "0.10", gamma: "scale", rank: "1", pairs: "66",
  model: "R1-WAW (J-rank1-v1)", policy: "provisional-v1 (chosen on development writers, not yet validated)",
};

export const caseMethodResults = {
  "C-7F3A21B0": [
    { method: "Our method (R1-WAW)", code: "J", score: 0.247, matches: "12 of 12" },
    { method: "Shared yardstick", code: "G", score: 0.248, matches: "12 of 12" },
    { method: "Standard method", code: "B", score: 0.182, matches: "12 of 12" },
  ],
  "C-2B9D44E1": [
    { method: "Our method (R1-WAW)", code: "J", score: -0.119, matches: "1 of 12" },
    { method: "Shared yardstick", code: "G", score: -0.117, matches: "2 of 12" },
    { method: "Standard method", code: "B", score: -0.069, matches: "3 of 12" },
  ],
  "C-91E0C5D7": [
    { method: "Our method (R1-WAW)", code: "J", score: -0.389, matches: "0 of 12" },
    { method: "Shared yardstick", code: "G", score: -0.388, matches: "0 of 12" },
    { method: "Standard method", code: "B", score: 0.032, matches: "8 of 12" },
  ],
} as const;

export const researchResults = {
  All: { writers: 142, our: [0.837, "21.3%"], shared: [0.831, "22.0%"], standard: [0.772, "25.8%"] },
  CEDAR: { writers: 25, our: [0.839, "21.3%"], shared: [0.838, "21.5%"], standard: [0.816, "22.3%"] },
  Bengali: { writers: 45, our: [0.801, "25.4%"], shared: [0.796, "25.6%"], standard: [0.702, "31.9%"] },
  Hindi: { writers: 72, our: [0.858, "18.8%"], shared: [0.851, "19.9%"], standard: [0.801, "23.3%"] },
} as const;

export const datasetResults = {
  All: { simple: 0.837, our: 0.837, verdict: "No difference" },
  CEDAR: { simple: 0.800, our: 0.839, verdict: "No reliable difference" },
  Hindi: { simple: 0.788, our: 0.858, verdict: "Our method better" },
  Bengali: { simple: 0.936, our: 0.801, verdict: "The shortcut is better" },
} as const;

export const reliableFinding = "Our method's gain over the shared yardstick is small (+0.006) but statistically reliable on the 142 development writers. Most of the improvement over the standard method comes from the shared yardstick, an existing technique.";
export const limitations = "The tool supports, not replaces, human judgement. Skilled forgeries can be close to genuine signatures. At the research decision rule the model rejected 53% of genuine signatures and accepted 10% of forgeries (equal error rate 21%). The decision line used in the app is provisional. All results are on development writers; the one-time check on 172 held-back writers has not been run yet.";
export const methodExplanation = "All writers share one yardstick, except along the main direction in which genuine signatures vary: there the tool uses this person's own spread. A consistent signer gets a tighter boundary; a variable signer a looser one.";
export const methodFormula = "W = W_G + (sigma_w^-1 - lambda_1^-1/2) u1 u1^T";
