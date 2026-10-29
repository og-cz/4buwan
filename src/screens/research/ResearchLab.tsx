import { useState } from "react";
import { getPerformance, getResearchResults } from "../../api/client";
import { ErrorState, SkeletonPanel } from "../../components/States";
import useAsync from "../../state/useAsync";
import type { ModelMeta } from "../../types";
import DatasetCheck from "./DatasetCheck";
import MethodComparison from "./MethodComparison";
import ModelCard from "./ModelCard";

type Tab = "methods" | "dataset" | "model";
const tabs: [Tab, string][] = [["methods", "Method comparison"], ["dataset", "Dataset check"], ["model", "Model card"]];

export default function ResearchLab({ model }: { model: ModelMeta | null }) {
  const [tab, setTab] = useState<Tab>("methods");
  const perf = useAsync(() => getPerformance(), []);
  const results = useAsync(() => getResearchResults(), []);
  const error = perf.error ?? results.error;
  return <div className="research-lab">
    <div className="research-tabs">{tabs.map(([k, label]) => <button key={k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>{label}</button>)}</div>
    {perf.loading || results.loading ? <SkeletonPanel />
      : error || !perf.data || !results.data ? <ErrorState message={error ?? "No research results."} retry={() => { perf.reload(); results.reload(); }} />
      : tab === "methods" ? <MethodComparison rows={perf.data} />
      : tab === "dataset" ? <DatasetCheck rows={perf.data} />
      : <ModelCard model={model} results={results.data} />}
  </div>;
}
