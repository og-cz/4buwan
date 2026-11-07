/**
 * Supervisor demo: a fictional, self-contained dataset. Nothing here comes from the real records or the real model,
 * and nothing is sent to the analysis service. Every number on the Supervisor screens is derived from these records,
 * so counts, percentages and statuses always agree with each other.
 */

export type SimVerdict = "LIKELY GENUINE" | "LIKELY FORGED" | "UNCERTAIN";
export type SimDecision = "Pending" | "Accepted" | "Rejected" | "Needs more evidence";

export type SimClient = { id: string; name: string; samples: number; enrolled: string; consistency: "Very consistent" | "Typical" | "Variable"; seed: number };
export type SimCase = {
  id: string; clientId: string; date: string; title: string;
  /** model classification (simulated) */ verdict: SimVerdict; score: number; confidence: number; comparisons: number[];
  /** human review decision (simulated) */ decision: SimDecision; reviewer: string | null; note: string;
};
export type SimBatch = { id: string; name: string; submitted: string; caseIds: string[]; processed: number };

/** Fixed date of the demo, so the data never changes from day to day. */
export const DEMO_DAY = "2026-10-15";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const NAMES = ["Alma Dizon", "Bernard Lim", "Carmela Ruiz", "Dante Villareal", "Elena Marquez", "Felix Ong", "Gina Torres", "Hector Navarro",
  "Iris Bautista", "Jonah Salcedo", "Karen De Leon", "Luis Ferrer", "Mara Ignacio", "Noel Castillo", "Olivia Ramos", "Paolo Mendoza",
  "Queenie Abad", "Rafael Soriano", "Sofia Valdez", "Tomas Aquino"];
export const REVIEWERS = ["R. Medina (supervisor)", "J. Santos (examiner)", "A. Cruz (examiner)"];

const day = (offset: number) => { const d = new Date(`${DEMO_DAY}T00:00:00Z`); d.setUTCDate(d.getUTCDate() - offset); return d.toISOString().slice(0, 10); };

function build() {
  const r = rng(20261015);
  const clients: SimClient[] = NAMES.map((name, i) => ({
    id: `CL-${2001 + i}`, name, samples: [5, 11, 17].includes(i) ? [8, 10, 6][[5, 11, 17].indexOf(i)] : 12,
    enrolled: day(20 + i * 2), consistency: (["Very consistent", "Typical", "Typical", "Variable"] as const)[Math.floor(r() * 4)], seed: 100 + i,
  }));
  const ready = clients.filter(c => c.samples === 12);
  const cases: SimCase[] = Array.from({ length: 48 }, (_, i) => {
    const client = ready[Math.floor(r() * ready.length)];
    const score = Math.round((r() * 0.9 - 0.45) * 1000) / 1000;
    const verdict: SimVerdict = score > 0.06 ? "LIKELY GENUINE" : score < -0.06 ? "LIKELY FORGED" : "UNCERTAIN";
    const confidence = Math.min(95, 50 + Math.round(Math.abs(score) * 120));
    const comparisons = Array.from({ length: 12 }, () => Math.round((score + (r() - 0.5) * 0.3) * 1000) / 1000);
    const age = [0, 0, 1, 1, 1, 2, 2, 3, 4, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 11, 11, 12, 13][Math.floor(r() * 24)];
    const decided = age > 2 && r() > 0.2;
    const decision: SimDecision = !decided ? "Pending"
      : verdict === "UNCERTAIN" ? (r() > 0.5 ? "Needs more evidence" : r() > 0.5 ? "Accepted" : "Rejected")
      : r() > 0.12 ? (verdict === "LIKELY GENUINE" ? "Accepted" : "Rejected") : (verdict === "LIKELY GENUINE" ? "Rejected" : "Accepted");
    return {
      id: `SIM-${String(3001 + i)}`, clientId: client.id, date: day(age), title: `Withdrawal slip ${4100 + i}`,
      verdict, score, confidence, comparisons, decision, reviewer: decided ? REVIEWERS[i % 3] : null,
      note: decision === "Needs more evidence" ? "Asked the client for a second sample." : "",
    };
  });
  const batches: SimBatch[] = [
    { id: "BATCH-07", name: "Branch 2 · morning deposits", submitted: day(1), caseIds: cases.slice(0, 6).map(c => c.id), processed: 6 },
    { id: "BATCH-08", name: "Loan documents · October", submitted: day(0), caseIds: cases.slice(6, 16).map(c => c.id), processed: 7 },
    { id: "BATCH-09", name: "Account updates · queued", submitted: day(0), caseIds: cases.slice(16, 20).map(c => c.id), processed: 0 },
  ];
  return { clients, cases, batches };
}

export const initialData = build();
export type SimData = ReturnType<typeof build>;

/** Every dashboard and report figure is computed here from the records. */
export function stats(data: SimData) {
  const { cases, clients } = data;
  const verdicts = { "LIKELY GENUINE": 0, "LIKELY FORGED": 0, UNCERTAIN: 0 } as Record<SimVerdict, number>;
  const decisions = { Pending: 0, Accepted: 0, Rejected: 0, "Needs more evidence": 0 } as Record<SimDecision, number>;
  cases.forEach(c => { verdicts[c.verdict]++; decisions[c.decision]++; });
  const clear = cases.filter(c => c.verdict !== "UNCERTAIN" && (c.decision === "Accepted" || c.decision === "Rejected"));
  const agree = clear.filter(c => (c.verdict === "LIKELY GENUINE") === (c.decision === "Accepted")).length;
  const perDay = new Map<string, number>();
  cases.forEach(c => perDay.set(c.date, (perDay.get(c.date) ?? 0) + 1));
  return {
    clients: clients.length, ready: clients.filter(c => c.samples === 12).length, incomplete: clients.filter(c => c.samples < 12).length,
    cases: cases.length, verdicts, decisions, reviewQueue: cases.filter(isInReview).length,
    uncertainRate: cases.length ? verdicts.UNCERTAIN / cases.length : 0,
    agreement: clear.length ? agree / clear.length : 0, agreementBase: clear.length, overrides: clear.length - agree,
    perDay: [...perDay.entries()].sort(([a], [b]) => a.localeCompare(b)),
  };
}

/** Review queue: model said Uncertain and no final decision yet, or the reviewer asked for more evidence, or nobody has decided. */
export const isInReview = (c: SimCase) => c.decision === "Pending" || c.decision === "Needs more evidence";

export const clientName = (data: SimData, id: string) => data.clients.find(c => c.id === id)?.name ?? id;
export const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
