import type { ReactNode } from "react";
import { useDemoBar } from "../state/demoBar";

/** The yellow strip under the top bar that says what the current role is. Hidden when turned off in Settings. */
export default function DemoBar({ children }: { children: ReactNode }) {
  const [show] = useDemoBar();
  if (!show) return null;
  return <div className="sample-strip demo-bar" role="note"><strong>DEMO</strong><span>{children}</span></div>;
}

/** The Settings switch for the bar, the same in every role. */
export function DemoBarSwitch() {
  const [show, setShow] = useDemoBar();
  return <label className="inline-check demo-switch"><input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} /> Show the yellow DEMO bar at the top of every page</label>;
}

/** Plain notice used on Help and Settings: this build is a demonstration, not the full application. */
export function DemoNotice() {
  return <section className="panel limitations demo-notice"><div><h2>Demonstration build</h2><p>A demonstration of 4buwan, not the full application.</p></div></section>;
}
