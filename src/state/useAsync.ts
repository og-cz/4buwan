import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";

export type Async<T> = { data: T | null; error: string | null; loading: boolean; reload: () => void };

/** Runs an API call when the deps change and keeps its data / error / loading state. */
export default function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): Async<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const run = useCallback(fn, deps);
  const last = useRef(run);
  useEffect(() => {
    let alive = true;
    // A reload keeps the current data on screen; only new deps show the loading state.
    if (last.current !== run || data === null) setLoading(true);
    last.current = run;
    setError(null);
    run()
      .then(d => { if (alive) setData(d); })
      .catch((e: unknown) => { if (alive) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [run, tick]);
  return { data, error, loading, reload: () => setTick(t => t + 1) };
}
