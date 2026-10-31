import type { IconName } from "./components/Icon";

export type Preset = "Examiner" | "Supervisor";

export type Screen =
  | "Workbench" | "Dashboard" | "Verify" | "Compare" | "Review Queue" | "Cases" | "CaseDetail"
  | "Reference Library" | "Person Profile" | "Enrol" | "Batch Check"
  | "Evidence Reports" | "Evidence Report" | "Research Lab" | "Reports" | "Settings" | "Help";

export type RouteParams = { personId?: string; caseId?: string; label?: string };
export type Route = { screen: Screen } & RouteParams;
export type Go = (screen: Screen, params?: RouteParams) => void;

export type NavScreen = Exclude<Screen, "CaseDetail" | "Person Profile" | "Evidence Report">;

export const navIcons: Record<NavScreen, IconName> = {
  Workbench: "home", Dashboard: "audit", Verify: "verify", Compare: "layers", "Review Queue": "review", Cases: "history",
  "Reference Library": "user", Enrol: "enrol", "Batch Check": "compare", "Evidence Reports": "file",
  "Research Lab": "ruler", Reports: "audit", Settings: "settings", Help: "help",
};

export type NavGroup = { label: string; items: NavScreen[] };

/** Examiner sidebar: grouped modules. Review Queue and Evidence Reports live as tabs inside Cases; Enrol is a tab of Reference Library. */
export const examinerGroups: NavGroup[] = [
  { label: "EXAMINE", items: ["Workbench", "Verify", "Compare", "Batch Check"] },
  { label: "RECORDS", items: ["Cases", "Reference Library"] },
  { label: "REFERENCE", items: ["Research Lab", "Help"] },
];

export const presetScreens: Record<Preset, NavScreen[]> = {
  Examiner: examinerGroups.flatMap(g => g.items),
  Supervisor: ["Dashboard", "Verify", "Compare", "Cases", "Reference Library", "Batch Check", "Research Lab", "Reports", "Settings", "Help"],
};

/** Tabs shown at the top of a module that groups several screens. */
export const hubTabs: Partial<Record<NavScreen, [NavScreen, string][]>> = {
  Cases: [["Cases", "All cases"], ["Review Queue", "Review queue"], ["Evidence Reports", "Evidence reports"]],
  "Reference Library": [["Reference Library", "People"], ["Enrol", "Enrol a person"]],
};

/** Which sidebar item stays highlighted while a sub-screen or detail page is open. */
export const parentScreen: Partial<Record<Screen, NavScreen>> = {
  CaseDetail: "Cases", "Review Queue": "Cases", "Evidence Reports": "Cases", "Evidence Report": "Cases",
  "Person Profile": "Reference Library", Enrol: "Reference Library",
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
