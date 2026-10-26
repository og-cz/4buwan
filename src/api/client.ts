import type {
  CheckDetail, CheckSummary, Decision, Health, PerformanceRow, PersonDetail, PersonSummary, Preprocessed,
  Quality, ResearchResults, Stats, Strictness, UncertainZone, Verdict, VerifyResult,
} from "../types";

/** The only place in the app that calls fetch(). */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new ApiError("The analysis service is not running.", 0);
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status}).`;
    try {
      const body: unknown = await res.json();
      if (body && typeof body === "object" && "detail" in body && typeof body.detail === "string") detail = body.detail;
    } catch { /* not JSON */ }
    throw new ApiError(detail, res.status);
  }
  return (await res.json()) as T;
}

function form(fields: Record<string, string | Blob | Blob[]>): FormData {
  const f = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) value.forEach(v => f.append(key, v));
    else f.append(key, value);
  }
  return f;
}

const post = <T>(path: string, fields: Record<string, string | Blob | Blob[]> = {}) => request<T>(path, { method: "POST", body: form(fields) });
const query = (params: Record<string, string | undefined>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `?${s}` : "";
};

export const getHealth = () => request<Health>("/api/health");
export const checkQuality = (file: File) => post<Quality>("/api/quality", { file });
export const preprocess = (file: Blob) => post<Preprocessed>("/api/preprocess", { file });

export const listPersons = (q = "") => request<PersonSummary[]>(`/api/persons${query({ q })}`);
export const getPerson = (id: string) => request<PersonDetail>(`/api/persons/${id}`);
export const enrolPerson = (name: string, externalId: string, files: File[]) =>
  post<PersonDetail>("/api/persons", { name, external_id: externalId, files });
export const archivePerson = (id: string) => post<{ ok: boolean }>(`/api/persons/${id}/archive`);
export const deletePerson = (id: string) => request<{ ok: boolean }>(`/api/persons/${id}`, { method: "DELETE" });
export const sampleUrl = (id: string, index: number) => `/api/persons/${id}/samples/${index}`;

export type VerifyInput = { personId: string; file: File; strictness: Strictness; uncertain: UncertainZone; caseTitle: string; notes: string };
export const verify = (v: VerifyInput) => post<VerifyResult>("/api/verify", {
  person_id: v.personId, file: v.file, strictness: v.strictness, uncertain: v.uncertain, case_title: v.caseTitle, notes: v.notes,
});

export const listChecks = (personId?: string, verdict?: Verdict) => request<CheckSummary[]>(`/api/checks${query({ person_id: personId, verdict })}`);
export const getCheck = (id: string) => request<CheckDetail>(`/api/checks/${id}`);
export const checkImageUrl = (id: string) => `/api/checks/${id}/image`;
export const recordDecision = (id: string, decision: Exclude<Decision, "Pending">, note: string) =>
  post<{ ok: boolean }>(`/api/checks/${id}/decision`, { decision, note });
/** Any image served by the API (samples, questioned images), as a Blob for preprocessing or measuring. */
export const getImageBlob = async (url: string): Promise<Blob> => {
  let res: Response;
  try { res = await fetch(url); } catch { throw new ApiError("The analysis service is not running.", 0); }
  if (!res.ok) throw new ApiError("Image not found.", res.status);
  return res.blob();
};
/** The stored questioned image, as a Blob (used to rebuild the preprocessing trace of a saved Case). */
export const getCheckImage = (id: string): Promise<Blob> => getImageBlob(checkImageUrl(id));

export const getResearchResults = () => request<ResearchResults>("/api/research/results");
export const getPerformance = () => request<PerformanceRow[]>("/api/research/performance");
export const getStats = (from?: string, to?: string) => request<Stats>(`/api/stats${query({ from, to })}`);
