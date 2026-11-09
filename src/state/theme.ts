import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";
const KEY = "signature-desk.theme";
const listeners = new Set<() => void>();

function read(): Theme {
  try { return window.localStorage.getItem(KEY) === "light" ? "light" : "dark"; } catch { return "dark"; }
}

let current: Theme = read();

/** Applies the theme to <html data-theme>. Called once before the first render and on every change. */
export function applyTheme(theme: Theme = current) {
  current = theme;
  document.documentElement.dataset.theme = theme;
  try { window.localStorage.setItem(KEY, theme); } catch { /* storage unavailable */ }
  listeners.forEach(l => l());
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const theme = useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => current);
  return [theme, applyTheme];
}

/** The sign-in page is always dark; the saved theme comes back after sign-in. */
export function showLoginTheme() { document.documentElement.dataset.theme = "dark"; }
