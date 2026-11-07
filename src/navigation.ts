import type { IconName } from "./components/Icon";

export type Preset = "Examiner" | "Supervisor";

export type Screen =
  | "Workbench" | "Dashboard" | "Verify" | "Compare" | "Review Queue" | "Cases" | "CaseDetail"
  | "Reference Library" | "Person Profile" | "Enrol" | "Batch Check"
  | "Evidence Reports" | "Evidence Report" | "Research Lab" | "Reports" | "Settings" | "Help";

export type RouteParams = { personId?: string; caseId?: string; label?: string };
export type Route = { screen: Screen } & RouteParams;
export type Go = (screen: Screen, params?: RouteParams) => void;

/** One main sidebar item of the Examiner demo. It owns several screens; merged modules show tabs. */
export type Section = { key: string; label: string; icon: IconName; home: Screen; screens: Screen[]; tabs?: [Screen, string][]; bottom?: boolean };

/** Examiner demo: exactly 8 main items. Every earlier screen lives under one of them. */
export const examinerSections: Section[] = [
  { key: "workbench", label: "Workbench", icon: "home", home: "Workbench", screens: ["Workbench", "Dashboard", "Reports", "Settings"],
    tabs: [["Workbench", "Overview"], ["Dashboard", "Statistics"], ["Reports", "Activity over time"], ["Settings", "Settings"]] },
  { key: "cases", label: "Cases & Review", icon: "history", home: "Cases", screens: ["Cases", "Review Queue", "CaseDetail"],
    tabs: [["Cases", "All cases"], ["Review Queue", "Review queue"]] },
  { key: "examination", label: "Examination", icon: "verify", home: "Verify", screens: ["Verify", "Compare"],
    tabs: [["Verify", "Verify against a profile"], ["Compare", "Compare images"]] },
  { key: "profiles", label: "Profiles & Library", icon: "user", home: "Reference Library", screens: ["Reference Library", "Person Profile", "Enrol"],
    tabs: [["Reference Library", "Enrolled profiles"], ["Enrol", "Enrol a person"]] },
  { key: "batch", label: "Batch Check", icon: "compare", home: "Batch Check", screens: ["Batch Check"] },
  { key: "reports", label: "Evidence Reports", icon: "file", home: "Evidence Reports", screens: ["Evidence Reports", "Evidence Report"] },
  { key: "research", label: "Research Lab", icon: "ruler", home: "Research Lab", screens: ["Research Lab"] },
  { key: "help", label: "Help", icon: "help", home: "Help", screens: ["Help"], bottom: true },
];

export const sectionOf = (screen: Screen): Section => examinerSections.find(s => s.screens.includes(screen)) ?? examinerSections[0];

const screenNames: Partial<Record<Screen, string>> = {
  Workbench: "Workbench", Dashboard: "Statistics", Reports: "Activity over time", Settings: "Settings", Cases: "Cases",
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
