import { useSyncExternalStore } from "react";

export type DataMode = "real" | "sample" | "demo";
const KEY = "signature-desk.data-mode";
const listeners = new Set<() => void>();

function read(): DataMode {
  try { const v = window.localStorage.getItem(KEY); return v === "sample" || v === "demo" ? v : "real"; } catch { return "real"; }
}

let current: DataMode = read();

/** The data folder every API request uses (sent as X-Data-Mode). */
export function getDataMode(): DataMode { return current; }

export function setDataMode(mode: DataMode) {
  current = mode;
  try { window.localStorage.setItem(KEY, mode); } catch { /* storage unavailable */ }
  listeners.forEach(l => l());
}

export function useDataMode(): [DataMode, (m: DataMode) => void] {
  const mode = useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => current);
  return [mode, setDataMode];
}

/** Lets other stores (settings) follow the switch. */
export function onDataModeChange(cb: () => void): () => void { listeners.add(cb); return () => listeners.delete(cb); }
