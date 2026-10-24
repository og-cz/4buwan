import { useEffect, useState } from "react";
import { getHealth } from "../api/client";
import type { ModelMeta } from "../types";

export type HealthState = { status: "checking" | "up" | "down"; model: ModelMeta | null };

/** Calls GET /api/health on start and every few seconds, so the banner clears once the service is started. */
export default function useHealth(intervalMs = 5000): HealthState {
  const [state, setState] = useState<HealthState>({ status: "checking", model: null });
  useEffect(() => {
    let alive = true;
    const ping = () => getHealth()
      .then(h => { if (alive) setState({ status: "up", model: h.model }); })
      .catch(() => { if (alive) setState(s => ({ status: "down", model: s.model })); });
    ping();
    const t = window.setInterval(ping, intervalMs);
    return () => { alive = false; window.clearInterval(t); };
  }, [intervalMs]);
  return state;
}
