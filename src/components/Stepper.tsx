import Icon from "./Icon";

type Props = { steps: string[]; current: number; onStep: (n: number) => void; canOpen: (n: number) => boolean };

export default function Stepper({ steps, current, onStep, canOpen }: Props) {
  return <div className="wizard-steps">{steps.map((s, i) => {
    const n = i + 1;
    return <button className={current === n ? "active" : current > n ? "done" : ""} disabled={!canOpen(n)} onClick={() => onStep(n)} key={s}><i>{current > n ? <Icon name="check" size={12} /> : n}</i><span>{s}</span></button>;
  })}</div>;
}
