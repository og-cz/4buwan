import type { IconName } from "./components/Icon";

export type Preset = "Examiner" | "Supervisor";

export type Screen =
  | "Verify" | "Cases" | "CaseDetail" | "Review Queue" | "Reference Library" | "Person Profile"
  | "Enrol" | "Batch Check" | "Dashboard" | "Reports" | "Research Lab" | "Settings" | "Help" | "Evidence Report";

export type Route = { screen: Screen; personId?: string; caseId?: string };
export type Go = (screen: Screen, params?: { personId?: string; caseId?: string }) => void;

export type NavScreen = Exclude<Screen, "CaseDetail" | "Person Profile" | "Evidence Report">;

export const navIcons: Record<NavScreen, IconName> = {
  Verify: "verify", Cases: "history", "Review Queue": "review", "Reference Library": "user", Enrol: "enrol",
  "Batch Check": "compare", Dashboard: "audit", Reports: "audit", "Research Lab": "compare", Settings: "settings", Help: "help",
};

export const presetScreens: Record<Preset, NavScreen[]> = {
  Examiner: ["Verify", "Cases", "Reference Library", "Enrol", "Batch Check", "Help"],
  Supervisor: ["Dashboard", "Review Queue", "Cases", "Reference Library", "Verify", "Enrol", "Batch Check", "Reports", "Research Lab", "Settings", "Help"],
};

/** Which sidebar item stays highlighted while a detail page is open. */
export const parentScreen: Partial<Record<Screen, NavScreen>> = {
  CaseDetail: "Cases", "Evidence Report": "Cases", "Person Profile": "Reference Library",
};
