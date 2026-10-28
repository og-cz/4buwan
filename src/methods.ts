/** Display names for the three metrics, always listed in this order: ours first. */
export const OUR_METHOD = "Our method · R1-WAW";
export const OUR_METHOD_LONG = "R1-WAW (Rank-One Writer-Adaptive Whitening)";
export const METHOD_NAME = { J: OUR_METHOD, G: "Shared yardstick", B: "Standard method" } as const;
export const METHOD_ORDER = ["J", "G", "B"] as const;
