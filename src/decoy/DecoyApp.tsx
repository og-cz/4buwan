import { useEffect, useState, type ReactNode } from "react";
import DemoBar from "../components/DemoBar";
import Shell from "../components/Shell";
import type { NavItem } from "../components/NavList";
import type { IconName } from "../components/Icon";
import type { Role } from "../navigation";
import { DecoyEnrol, DecoyProfile, DecoyVerify } from "./DecoyExamine";
import { DecoyHistory, DecoyReviewQueue, DecoyStaff } from "./DecoyRecords";
import { DecoyDataset, DecoyMethods } from "./DecoyResearch";
import { DecoyDashboard, DecoyHelp, DecoySettings } from "./DecoyExtras";

type DecoyScreen = "Dashboard" | "Verify" | "Client Profile" | "Enrol" | "History" | "Review Queue" | "Staff Accounts" | "Method Comparison" | "Dataset Check" | "Settings" | "Help";

const icons: Record<Exclude<DecoyScreen, "Client Profile">, IconName> = {
  Dashboard: "home", Verify: "verify", Enrol: "enrol", History: "history", "Review Queue": "review", "Staff Accounts": "staff",
  "Method Comparison": "compare", "Dataset Check": "audit", Settings: "settings", Help: "help",
};

/** Modules of each demo role (from the 4buwan-ui design, plus Dashboard, Settings and Help). */
const roleScreens: Record<Exclude<Role, "Verifier">, Exclude<DecoyScreen, "Client Profile">[]> = {
  Supervisor: ["Dashboard", "Verify", "Review Queue", "Enrol", "History", "Staff Accounts", "Settings", "Help"],
  Researcher: ["Dashboard", "Verify", "Review Queue", "Enrol", "History", "Method Comparison", "Dataset Check", "Staff Accounts", "Settings", "Help"],
};
/** Sidebar categories, the same names as the Verifier's. */
const groups: Record<Exclude<DecoyScreen, "Client Profile">, string> = {
  Dashboard: "Examine", Verify: "Examine", "Review Queue": "Examine", Enrol: "Library", History: "Evidence",
  "Method Comparison": "Research", "Dataset Check": "Research", "Staff Accounts": "Admin", Settings: "System", Help: "System",
};

/** Supervisor and Researcher demos: every module is clickable, but nothing uses the model or any stored data. */
export default function DecoyApp({ role, user, logout }: { role: Exclude<Role, "Verifier">; user: string; logout: () => void }) {
  const [screen, setScreen] = useState<DecoyScreen>("Dashboard");
  const go = (s: DecoyScreen) => { setScreen(s); window.scrollTo(0, 0); };
  const active = screen === "Client Profile" ? "Verify" : screen;
  useEffect(() => { document.title = `4buwan | ${screen}`; }, [screen]);
  let page: ReactNode;
  switch (screen) {
    case "Verify": page = <DecoyVerify onProfile={() => go("Client Profile")} onEnrol={() => go("Enrol")} />; break;
    case "Client Profile": page = <DecoyProfile canDelete verify={() => go("Verify")} reenrol={() => go("Enrol")} />; break;
    case "Enrol": page = <DecoyEnrol />; break;
    case "History": page = <DecoyHistory />; break;
    case "Review Queue": page = <DecoyReviewQueue />; break;
    case "Staff Accounts": page = <DecoyStaff />; break;
    case "Method Comparison": page = <DecoyMethods />; break;
    case "Dataset Check": page = <DecoyDataset />; break;
    case "Settings": page = <DecoySettings />; break;
    case "Help": page = <DecoyHelp />; break;
    default: page = <DecoyDashboard openReview={() => go("Review Queue")} openHistory={() => go("History")} />;
  }
  const items: NavItem[] = roleScreens[role].map(s => ({ key: s, label: s, icon: icons[s], group: groups[s], bottom: s === "Help" }));
  return <Shell demo={role} user={user} items={items} active={active} onNav={key => go(key as DecoyScreen)} crumb={screen}
    strip={<DemoBar decoy>This {role} view is a decoy for demonstration. It does not use the verification model or any stored data; everything shown is example content.</DemoBar>}
    note={{ title: "Demonstration", text: "Example content only. Nothing is saved." }}
    footer="Demonstration view. No model or stored data is used." logout={logout}>
    {page}
  </Shell>;
}
