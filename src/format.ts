import type { Tone } from "./components/Tag";
import type { Decision, Verdict } from "./types";

export const verdictTone = (v: Verdict): Tone => v === "LIKELY GENUINE" ? "ready" : v === "UNCERTAIN" ? "warn" : "bad";
export const decisionTone = (d: Decision): Tone => d === "Accepted" ? "ready" : d === "Rejected" ? "bad" : d === "Pending" ? "neutral" : "warn";
export const statusTone = (s: string): Tone => s === "Ready" ? "ready" : s === "Archived" ? "neutral" : "warn";

export function formatDate(iso: string, withTime = false): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, withTime
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" });
}

export const initials = (name: string) => name.split(/\s+/).map(n => n[0] ?? "").join("").slice(0, 2).toUpperCase();
export const signed = (n: number, digits = 4) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(digits)}`;
export const percent = (n: number | null, digits = 1) => n === null ? "—" : `${(n * 100).toFixed(digits)}%`;
export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Population standard deviation (same definition as numpy.std), used only to place display markers. */
export function spread(values: number[]): number {
  if (!values.length) return 0;
  const m = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length);
}

export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const text = [header, ...rows].map(r => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
