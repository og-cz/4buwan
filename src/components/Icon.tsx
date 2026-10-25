import type { ReactNode } from "react";

export type IconName = "verify" | "enrol" | "history" | "review" | "settings" | "compare" | "audit" | "search" | "upload" | "check" | "alert" | "help" | "print" | "save" | "logout" | "chevron" | "user" | "scan" | "menu" | "sun" | "moon" | "close" | "eye" | "eyeOff" | "plus" | "minus" | "rotate" | "fit" | "invert" | "layers" | "swipe" | "pin" | "ruler" | "paperclip" | "home" | "file" | "keyboard";

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
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  rotate: <><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></>,
  fit: <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />,
  invert: <><circle cx="12" cy="12" r="9" /><path d="M12 3v18a9 9 0 0 0 0-18Z" fill="currentColor" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>,
  swipe: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M12 3v18" /></>,
  pin: <><path d="M12 21s-6-5.6-6-11a6 6 0 1 1 12 0c0 5.4-6 11-6 11Z" /><circle cx="12" cy="10" r="2" /></>,
  ruler: <><path d="M3 17 17 3l4 4L7 21l-4-4Z" /><path d="m7 13 2 2M10 10l2 2M13 7l2 2" /></>,
  paperclip: <path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7" />,
  home: <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></>,
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 13h6M9 17h4" /></>,
  keyboard: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></>,
};

export default function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
