import type { ReactNode } from "react";

export type Tone = "neutral" | "ready" | "warn" | "bad" | "accent";

export default function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`tag ${tone}`}>{tone !== "neutral" && <i />}{children}</span>;
}
