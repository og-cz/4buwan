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

/** Sidebar modules, one MODULES list as in the original design. Both presets have every core module. */
export const presetScreens: Record<Preset, NavScreen[]> = {
  Examiner: ["Workbench", "Verify", "Compare", "Review Queue", "Cases", "Reference Library", "Enrol", "Batch Check", "Evidence Reports", "Research Lab", "Help"],
  Supervisor: ["Dashboard", "Verify", "Compare", "Review Queue", "Cases", "Reference Library", "Enrol", "Batch Check", "Evidence Reports", "Research Lab", "Reports", "Settings", "Help"],
};

/** Which sidebar item stays highlighted while a sub-screen or detail page is open. */
export const parentScreen: Partial<Record<Screen, NavScreen>> = {
  CaseDetail: "Cases", "Evidence Report": "Evidence Reports", "Person Profile": "Reference Library",
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
