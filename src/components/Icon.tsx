import type { ReactNode } from "react";

export type IconName = "verify" | "enrol" | "history" | "review" | "settings" | "compare" | "audit" | "search" | "upload" | "check" | "alert" | "help" | "print" | "save" | "logout" | "chevron" | "user" | "scan" | "menu";

const paths: Record<IconName, ReactNode> = {
  verify: <><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" /><path d="M7 13c2-4 3 4 5-2s3 5 5-1" /></>,
  enrol: <><circle cx="10" cy="8" r="4" /><path d="M3 21c1-4.5 3-7 7-7 2 0 3.6.5 4.8 1.5M19 15v7m-3.5-3.5h7" /></>,
  history: <><path d="M4 12a8 8 0 1 0 2-5.7L4 8" /><path d="M4 3v5h5M12 7v5l3 2" /></>,
  review: <><path d="M6 3h12v18H6zM9 8h6m-6 4h6m-6 4h3" /><path d="m15 17 1.5 1.5L20 15" /></>,
  settings: <><circle cx="9" cy="8" r="4" /><path d="M2 21c.8-4.5 3-7 7-7s6.2 2.5 7 7M17 8h5m-2.5-2.5v5" /></>,
  compare: <><path d="M8 3 4 7l4 4M4 7h14M16 21l4-4-4-4M20 17H6" /></>,
  audit: <><path d="M12 2 4 5v6c0 5 3 9 8 11 5-2 8-6 8-11V5z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
  search: <><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6" /></>,
  upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 15v5h16v-5" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  alert: <><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 9v4m0 3h.01" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.7 2.7 0 1 1 4.2 2.2c-1.2.8-1.7 1.3-1.7 2.3M12 17h.01" /></>,
  print: <><path d="M6 9V3h12v6M6 17H4V9h16v8h-2M7 14h10v7H7z" /></>,
  save: <><path d="M5 3h12l2 2v16H5zM8 3v6h8V3M8 21v-7h8v7" /></>,
  logout: <><path d="M10 4H4v16h6M14 8l4 4-4 4m4-4H8" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4.5 3.5-7 8-7s7 2.5 8 7" /></>,
  scan: <><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" /><path d="M8 12h8" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
};

export default function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
