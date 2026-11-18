import { useSyncExternalStore } from "react";

/** Whether the yellow DEMO bar is shown at the top of every role. On by default; turned off in Settings. */
const KEY = "signature-desk.demo-bar";
const listeners = new Set<() => void>();

function read(): boolean {
  try { return window.localStorage.getItem(KEY) !== "off"; } catch { return true; }
}

let current = read();

export function setDemoBar(show: boolean) {
  current = show;
  try { window.localStorage.setItem(KEY, show ? "on" : "off"); } catch { /* storage unavailable: keep in memory */ }
  listeners.forEach(l => l());
}

export function useDemoBar(): [boolean, (show: boolean) => void] {
  const show = useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => current);
  return [show, setDemoBar];
}
