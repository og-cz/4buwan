import type { IconName } from "./components/Icon";



export type Screen =
  | "Workbench" | "Dashboard" | "Verify" | "Compare" | "Review Queue" | "Cases" | "CaseDetail"
  | "Reference Library" | "Person Profile" | "Enrol" | "Batch Check"
  | "Evidence Reports" | "Evidence Report" | "Research Lab" | "Reports" | "Settings" | "Help";

export type RouteParams = { personId?: string; caseId?: string; label?: string };
export type Route = { screen: Screen } & RouteParams;
export type Go = (screen: Screen, params?: RouteParams) => void;

export type Role = "Verifier" | "Supervisor" | "Researcher";

/** The Verifier's sidebar: the working system. Each item owns the screens that open from it. */
export type VerifierModule = { key: string; label: string; icon: IconName; home: Screen; screens: Screen[]; bottom?: boolean };
export const verifierModules: VerifierModule[] = [
  { key: "dashboard", label: "Dashboard", icon: "home", home: "Dashboard", screens: ["Dashboard", "Workbench", "Reports"] },
  { key: "verify", label: "Verify", icon: "verify", home: "Verify", screens: ["Verify", "Person Profile", "Reference Library", "Compare"] },
  { key: "enrol", label: "Enrol", icon: "enrol", home: "Enrol", screens: ["Enrol"] },
  { key: "history", label: "History", icon: "history", home: "Cases", screens: ["Cases", "Review Queue", "CaseDetail", "Evidence Reports", "Evidence Report", "Batch Check"] },
  { key: "research", label: "Research Lab", icon: "ruler", home: "Research Lab", screens: ["Research Lab"] },
  { key: "settings", label: "Settings", icon: "settings", home: "Settings", screens: ["Settings"] },
  { key: "help", label: "Help", icon: "help", home: "Help", screens: ["Help"], bottom: true },
];

export const moduleOf = (screen: Screen): VerifierModule => verifierModules.find(m => m.screens.includes(screen)) ?? verifierModules[1];

const screenNames: Partial<Record<Screen, string>> = {
  Workbench: "Workbench", Dashboard: "Statistics", Reports: "Activity over time", Settings: "Settings", Cases: "History",
  "Review Queue": "Review queue", Verify: "Verify", Compare: "Compare", "Reference Library": "Profiles", Enrol: "Enrol",
};

/** Browser tab title for a route: "4buwan | <Page>". `label` carries a person's name when the caller knows it. */
export function pageTitle(route: Route | null): string {
  if (!route) return "4buwan | Sign in";
  const { screen, caseId, label } = route;
  const page = screen === "CaseDetail" ? `Case ${caseId ?? ""}`.trim()
    : screen === "Evidence Report" ? `Evidence Report ${caseId ?? ""}`.trim()
    : screen === "Person Profile" ? label ?? "Profile"
    : screenNames[screen] ?? screen;
  return `4buwan | ${page}`;
}
