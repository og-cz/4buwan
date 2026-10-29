import { Fragment } from "react";
import Icon from "../Icon";
import type { Preprocessed } from "../../types";

const stages: [keyof Preprocessed["stages"], string][] = [["S0", "Original"], ["S1", "Inverted"], ["S2", "Background removed"], ["S3", "Cropped and padded"], ["S4", "100 × 100"]];

/** The five stages the model sees, left to right with arrows. Scrolls sideways on narrow screens. */
export default function TracePanel({ data }: { data: Preprocessed }) {
  return <div className="trace-strip">{stages.map(([k, label], i) => <Fragment key={k}>
    {i > 0 && <span className="trace-arrow" aria-hidden="true"><Icon name="chevron" size={18} /></span>}
    <figure className="trace-stage"><div className="trace-img"><img src={data.stages[k]} alt={label} /></div><figcaption>{label}</figcaption></figure>
  </Fragment>)}</div>;
}
