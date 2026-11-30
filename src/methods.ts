/** Display names for the three metrics, always listed in this order: ours first. */
export const OUR_METHOD = "Our method · R1-WAW-V";
export const OUR_METHOD_LONG = "R1-WAW-V (Rank-One Writer-Adaptive Whitening, one-sided form)";
/** The research tables report the one-class form of R1-WAW (condition J); the app runs R1-WAW-V. */
export const ONE_CLASS_METHOD = "R1-WAW · one-class SVM";
export const METHOD_NAME = { J: ONE_CLASS_METHOD, G: "Shared yardstick", B: "Standard method" } as const;
export const METHOD_ORDER = ["J", "G", "B"] as const;
