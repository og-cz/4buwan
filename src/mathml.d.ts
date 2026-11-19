import type { HTMLAttributes } from "react";

/** MathML elements used for formulas (rendered natively by the browser). React's types do not list them. */
type MathProps = HTMLAttributes<HTMLElement> & { display?: "block" | "inline"; mathvariant?: string; lspace?: string; rspace?: string };

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      math: MathProps; mrow: MathProps; mi: MathProps; mn: MathProps; mo: MathProps;
      msub: MathProps; msup: MathProps; msubsup: MathProps;
    }
  }
}
