import Tag from "./Tag";
import { verdictTone } from "../format";
import type { Verdict } from "../types";

export default function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return <Tag tone={verdictTone(verdict)}>{verdict}</Tag>;
}
