import { useEffect, useState } from "react";
import { getHealth } from "../api/client";
import type { Health, ModelMeta } from "../types";
import { useDataMode } from "./dataMode";

export type HealthState = { status: "checking" | "up" | "down"; model: ModelMeta | null; counts: Pick<Health, "mode" | "persons" | "checks"> | null };

/** Calls GET /api/health on start and every few seconds, so the banner clears once the service is started. */
/** `enabled = false` (the Supervisor demo) makes no request at all. */
export default function useHealth(enabled = true, intervalMs = 5000): HealthState {
  const [mode] = useDataMode();
  const [state, setState] = useState<HealthState>({ status: "checking", model: null, counts: null });
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const ping = () => getHealth()
      .then(h => { if (alive) setState({ status: "up", model: h.model, counts: { mode: h.mode, persons: h.persons, checks: h.checks } }); })
      .catch(() => { if (alive) setState(s => ({ ...s, status: "down" })); });
    ping();
    const t = window.setInterval(ping, intervalMs);
    return () => { alive = false; window.clearInterval(t); };
  }, [enabled, intervalMs, mode]);
  return state;
}
