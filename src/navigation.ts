import type { IconName } from "./components/Icon";



export type Screen =
  | "Dashboard" | "Verify" | "Compare" | "Review Queue" | "Cases" | "CaseDetail"
  | "Reference Library" | "Person Profile" | "Enrol" | "Import"
  | "Evidence Reports" | "Evidence Report" | "Research Lab" | "Reports" | "Settings" | "Help";

export type RouteParams = { personId?: string; caseId?: string; label?: string };
export type Route = { screen: Screen } & RouteParams;
export type Go = (screen: Screen, params?: RouteParams) => void;

export type Role = "Verifier" | "Supervisor" | "Researcher";

/** The Verifier's sidebar: one item per page, grouped in categories. Detail pages (a case, a report, a profile)
 *  belong to the item listed in `screens`, which stays highlighted while they are open. */
export type VerifierModule = { key: string; label: string; icon: IconName; group: string; home: Screen; screens: Screen[]; bottom?: boolean };
export const verifierModules: VerifierModule[] = [
  { key: "dashboard", label: "Dashboard", icon: "home", group: "Examine", home: "Dashboard", screens: ["Dashboard"] },
  { key: "verify", label: "Verify", icon: "verify", group: "Examine", home: "Verify", screens: ["Verify"] },
  { key: "compare", label: "Compare", icon: "compare", group: "Examine", home: "Compare", screens: ["Compare"] },
  { key: "queue", label: "Review Queue", icon: "review", group: "Examine", home: "Review Queue", screens: ["Review Queue"] },
  { key: "profiles", label: "Profiles", icon: "user", group: "Library", home: "Reference Library", screens: ["Reference Library", "Person Profile"] },
  { key: "enrol", label: "Enrol", icon: "enrol", group: "Library", home: "Enrol", screens: ["Enrol"] },
  { key: "import", label: "Import", icon: "upload", group: "Library", home: "Import", screens: ["Import"] },
  { key: "history", label: "History", icon: "history", group: "Evidence", home: "Cases", screens: ["Cases", "CaseDetail"] },
  { key: "reports", label: "Evidence Reports", icon: "file", group: "Evidence", home: "Evidence Reports", screens: ["Evidence Reports", "Evidence Report"] },
  { key: "statistics", label: "Statistics", icon: "audit", group: "Evidence", home: "Reports", screens: ["Reports"] },
  { key: "research", label: "Research Lab", icon: "ruler", group: "Evidence", home: "Research Lab", screens: ["Research Lab"] },
  { key: "settings", label: "Settings", icon: "settings", group: "System", home: "Settings", screens: ["Settings"] },
  { key: "help", label: "Help", icon: "help", group: "System", home: "Help", screens: ["Help"], bottom: true },
];

export const moduleOf = (screen: Screen): VerifierModule => verifierModules.find(m => m.screens.includes(screen)) ?? verifierModules[1];

const screenNames: Partial<Record<Screen, string>> = {
  Dashboard: "Dashboard", Reports: "Statistics", Settings: "Settings", Cases: "History",
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
