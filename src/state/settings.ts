import { useSyncExternalStore } from "react";
import type { Strictness, UncertainZone } from "../types";
import { getDataMode, onDataModeChange } from "./dataMode";

export type Term = "Person" | "Client" | "Member" | "Student" | "Employee" | "Custom";
export type View = "Simple" | "Expert";

export type Settings = {
  orgName: string; orgLogo: string; term: Term; customTerm: string; idLabel: string;
  strictness: Strictness; uncertain: UncertainZone; defaultView: View;
};

/** Settings are kept per data mode, so trying things in Sample data never changes the real workspace. */
const key = () => `signature-desk.settings.${getDataMode()}`;
const defaults: Settings = {
  orgName: "", orgLogo: "", term: "Person", customTerm: "", idLabel: "Person ID",
  strictness: "Standard", uncertain: "Standard", defaultView: "Simple",
};

function read(): Settings {
  try {
    const raw = window.localStorage.getItem(key()) ?? (getDataMode() === "real" ? window.localStorage.getItem("signature-desk.settings") : null);
    return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<Settings>) } : defaults;
  } catch {
    return defaults;
  }
}

let current = read();
const listeners = new Set<() => void>();
onDataModeChange(() => { current = read(); listeners.forEach(l => l()); });

export function saveSettings(next: Settings) {
  current = next;
  try { window.localStorage.setItem(key(), JSON.stringify(next)); } catch { /* storage unavailable: keep in memory */ }
  listeners.forEach(l => l());
}

export function getSettings(): Settings { return current; }

export function useSettings(): Settings {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => current);
}

/** The word the organisation uses for a Person, plus the ID label. */
export function useTerms() {
  const s = useSettings();
  const person = s.term === "Custom" ? (s.customTerm.trim() || "Person") : s.term;
  const people = person === "Person" ? "People" : `${person}s`;
  return { person, people, lower: person.toLowerCase(), idLabel: s.idLabel.trim() || "Person ID" };
}

export const strictnessHelp: Record<Strictness, string> = {
  Lenient: "Fewer genuine signatures rejected, more forgeries may pass.",
  Standard: "Balanced trade-off between the two kinds of error.",
  Strict: "Fewer forgeries accepted, more genuine signatures flagged.",
};

export const uncertainHelp: Record<UncertainZone, string> = {
  Narrow: "More clear Verdicts, but more of them can be wrong.",
  Standard: "Balanced number of Uncertain results.",
  Wide: "More Uncertain results, fewer confident mistakes.",
};
