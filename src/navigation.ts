import type { IconName } from "./components/Icon";

export type Preset = "Examiner" | "Supervisor";

export type Screen =
  | "Verify" | "Cases" | "CaseDetail" | "Review Queue" | "Reference Library" | "Person Profile"
  | "Enrol" | "Batch Check" | "Dashboard" | "Reports" | "Research Lab" | "Settings" | "Help" | "Evidence Report";

export type RouteParams = { personId?: string; caseId?: string; label?: string };
export type Route = { screen: Screen } & RouteParams;
export type Go = (screen: Screen, params?: RouteParams) => void;

export type NavScreen = Exclude<Screen, "CaseDetail" | "Person Profile" | "Evidence Report">;

export const navIcons: Record<NavScreen, IconName> = {
  Verify: "verify", Cases: "history", "Review Queue": "review", "Reference Library": "user", Enrol: "enrol",
  "Batch Check": "compare", Dashboard: "audit", Reports: "audit", "Research Lab": "compare", Settings: "settings", Help: "help",
};

export const presetScreens: Record<Preset, NavScreen[]> = {
  Examiner: ["Verify", "Cases", "Reference Library", "Enrol", "Batch Check", "Help"],
  Supervisor: ["Dashboard", "Review Queue", "Cases", "Reference Library", "Verify", "Enrol", "Batch Check", "Reports", "Research Lab", "Settings", "Help"],
};

export type NavGroup = { label: string; items: NavScreen[] };

/** Sidebar sections. Items not in the preset are left out; empty sections are dropped. */
export function navGroups(preset: Preset): NavGroup[] {
  const allowed = new Set(presetScreens[preset]);
  const groups: NavGroup[] = [
    { label: "Examine", items: ["Dashboard", "Verify", "Review Queue", "Cases"] },
    { label: "Library", items: ["Reference Library", "Enrol", "Batch Check"] },
    { label: "Evidence", items: ["Research Lab", "Reports"] },
    { label: "System", items: ["Settings", "Help"] },
  ];
  return groups.map(g => ({ ...g, items: g.items.filter(i => allowed.has(i)) })).filter(g => g.items.length > 0);
}

/** Which sidebar item stays highlighted while a detail page is open. */
export const parentScreen: Partial<Record<Screen, NavScreen>> = {
  CaseDetail: "Cases", "Evidence Report": "Cases", "Person Profile": "Reference Library",
};

/** Browser tab title for a route: "4buwan | <Page>". `label` carries a person's name when the caller knows it. */
export function pageTitle(route: Route | null): string {
  if (!route) return "4buwan | Sign in";
  const { screen, caseId, label } = route;
  const page = screen === "CaseDetail" ? `Case ${caseId ?? ""}`.trim()
    : screen === "Evidence Report" ? `Evidence Report ${caseId ?? ""}`.trim()
    : screen === "Person Profile" ? label ?? "Profile"
    : screen;
  return `4buwan | ${page}`;
}
