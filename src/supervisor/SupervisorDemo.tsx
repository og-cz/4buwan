import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Brand from "../components/Brand";
import Drawer from "../components/Drawer";
import { DataLabel } from "../components/Shell";
import { useTheme } from "../state/theme";
import { caseMethodResults, checks, datasetResults, decision, differenceMeasures, limitations, methodExplanation, methodFormula, profileParameters, reliableFinding, researchResults, samplePeople } from "./sampleData";

type DataMode = "real" | "sample";
type Screen = "Workbench" | "Dashboard" | "Verify" | "Compare" | "Review Queue" | "Cases" | "Reference Library" | "Enrol" | "Batch Check" | "Evidence Reports" | "Reports" | "Research Lab" | "Settings" | "Help" | "Client Profile";
type Verdict = "LIKELY GENUINE" | "LIKELY FORGED" | "UNCERTAIN";
type IconName = "verify" | "enrol" | "history" | "review" | "staff" | "compare" | "audit" | "search" | "upload" | "check" | "alert" | "help" | "print" | "save" | "logout" | "chevron" | "user" | "scan" | "menu" | "sun" | "moon" | "eye";

const paths: Record<IconName, ReactNode> = {
  verify: <><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" /><path d="M7 13c2-4 3 4 5-2s3 5 5-1" /></>,
  enrol: <><circle cx="10" cy="8" r="4" /><path d="M3 21c1-4.5 3-7 7-7 2 0 3.6.5 4.8 1.5M19 15v7m-3.5-3.5h7" /></>,
  history: <><path d="M4 12a8 8 0 1 0 2-5.7L4 8" /><path d="M4 3v5h5M12 7v5l3 2" /></>,
  review: <><path d="M6 3h12v18H6zM9 8h6m-6 4h6m-6 4h3" /><path d="m15 17 1.5 1.5L20 15" /></>,
  staff: <><circle cx="9" cy="8" r="4" /><path d="M2 21c.8-4.5 3-7 7-7s6.2 2.5 7 7M17 8h5m-2.5-2.5v5" /></>,
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
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19" /></>,
  moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Signature({ seed = 0, faded = false }: { seed?: number; faded?: boolean }) {
  const d = [
    "M12 56c9-17 13-28 16-1 3 23 10-40 17-2 5 24 14-24 19-1 5 20 13-17 20 1 6 14 14-8 21-1 10 8 20 2 31-5",
    "M12 60c12-8 12-33 19-2 5 24 11-37 18-1 5 23 11-14 17-1 7 18 12-12 21-1 8 11 17-4 24-1 9 4 19 0 28-5",
    "M15 58c8-11 13-28 17 0 4 20 12-31 18-1 4 18 10-10 16-1 8 16 12-10 21-2 9 12 17-3 24-1 13 7 23 5 37-4",
  ][seed % 3];
  return <div className={`signature ${faded ? "faded" : ""}`}><svg viewBox="0 0 160 86" preserveAspectRatio="none"><path d={d} /><path className="under" d={`M${17 + seed * 3} 69c41-7 82 9 126-3`} /></svg></div>;
}

function Button({ children, icon, secondary, danger, disabled, onClick }: { children: ReactNode; icon?: IconName; secondary?: boolean; danger?: boolean; disabled?: boolean; onClick?: () => void }) {
  return <button className={`button ${secondary ? "secondary" : ""} ${danger ? "danger" : ""}`} disabled={disabled} onClick={onClick}>{icon && <Icon name={icon} size={15} />}{children}</button>;
}

function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "ready" | "warn" | "bad" | "accent" }) {
  return <span className={`tag ${tone}`}>{tone !== "neutral" && <i />}{children}</span>;
}

const navIcons: Record<Exclude<Screen, "Client Profile">, IconName> = {
  Workbench: "audit", Dashboard: "audit", Verify: "verify", Compare: "compare", "Review Queue": "review", Cases: "history", "Reference Library": "user", Enrol: "enrol", "Batch Check": "compare", "Evidence Reports": "print", Reports: "audit", "Research Lab": "compare", Settings: "staff", Help: "help",
};
type NavScreen = Exclude<Screen, "Client Profile">;
const supervisorGroups: { label: string; items: NavScreen[] }[] = [
  { label: "OVERVIEW", items: ["Dashboard", "Reports"] },
  { label: "EXAMINE", items: ["Verify", "Compare", "Batch Check"] },
  { label: "RECORDS", items: ["Cases", "Reference Library"] },
  { label: "REFERENCE", items: ["Research Lab", "Help"] },
  { label: "SYSTEM", items: ["Settings"] },
];
const parentOf: Partial<Record<Screen, NavScreen>> = { "Review Queue": "Cases", "Evidence Reports": "Cases", "Client Profile": "Reference Library", Enrol: "Reference Library" };
const hubTabs: Partial<Record<NavScreen, [Screen, string][]>> = {
  Cases: [["Cases", "All cases"], ["Review Queue", "Review queue"], ["Evidence Reports", "Evidence reports"]],
  "Reference Library": [["Reference Library", "People"], ["Enrol", "Enrol a person"]],
};
function HubTabs({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  const tabs = hubTabs[(parentOf[screen] ?? screen) as NavScreen];
  if (!tabs || !tabs.some(([t]) => t === screen)) return null;
  return <div className="research-tabs hub-tabs" role="tablist">{tabs.map(([t, label]) => <button key={t} role="tab" aria-selected={screen === t} className={screen === t ? "active" : ""} onClick={() => setScreen(t)}>{label}</button>)}</div>;
}

function Shell({ screen, setScreen, logout, children }: { screen: Screen; setScreen: (s: Screen) => void; logout: () => void; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const [theme, setTheme] = useTheme();
  useEffect(() => { document.title = `4buwan | ${screen}`; }, [screen]);
  const active = parentOf[screen] ?? screen;
  const nav = (after?: () => void) => <nav aria-label="Modules">{supervisorGroups.map(g => <div className="nav-group" key={g.label}><div className="nav-label">{g.label}</div>{g.items.map(item => <button className={active === item ? "active" : ""} aria-current={active === item ? "page" : undefined} onClick={() => { setScreen(item); after?.(); }} key={item} aria-label={item} title={item} data-label={item}><Icon name={navIcons[item]} /><span>{item}</span></button>)}</div>)}</nav>;
  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand"><Brand size={32} label="Signature Desk" /><button className="brand-toggle" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand menu" : "Collapse menu"} title={collapsed ? "Expand menu" : "Collapse menu"}><Icon name="menu" size={18} /></button></div>
      <div className="office"><span>Workspace</span><strong>Supervisor demo</strong></div>
      {nav()}
      <div className="privacy-side"><Icon name="audit" size={18} /><p><strong>Private office system</strong>Access and changes are logged.</p></div>
    </aside>
    <main className="main">
      <header className="topbar">
        <button className="icon-button mobile-only" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer}><Icon name="menu" size={18} /></button>
        <div className="crumbs"><span className="desktop-only">Signature Desk</span><b className="desktop-only">/</b><strong>{screen}</strong></div>
        <div className="top-tools"><div className="desktop-only"><DataLabel sample /></div><button className="icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} title={theme === "dark" ? "Light theme" : "Dark theme"}><Icon name={theme === "dark" ? "sun" : "moon"} size={18} /></button><div className="staff-menu"><span aria-hidden="true">SD</span><div className="desktop-only"><strong>Supervisor demo</strong><small>Signed in</small></div><button className="icon-button" onClick={logout} title="Log out" aria-label="Log out"><Icon name="logout" size={18} /></button></div></div>
      </header>
      <div className="sample-strip">Sample data — signatures from the public CEDAR dataset used in the research. Not real clients.</div>
      <div className="content"><HubTabs screen={screen} setScreen={setScreen} />{children}</div>
      <footer>Signatures are stored on this computer only. Every check is logged.</footer>
    </main>
    <Drawer open={drawer} onClose={closeDrawer} label="Menu">
      <Brand size={32} label="Signature Desk" />
      <div className="drawer-section"><span className="nav-label">Data</span><DataLabel sample /></div>
      <div className="drawer-section"><span className="nav-label">Workspace</span><strong>Supervisor demo</strong></div>
      {nav(closeDrawer)}
    </Drawer>
  </div>;
}

function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="page-header"><div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function ClientSearch({ onSelect }: { onSelect: (ready: boolean) => void }) {
  const [search, setSearch] = useState("");
  const visible = samplePeople.filter(c => `${c.name} ${c.id}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="client-search">
    <div className="search-box"><Icon name="search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client name or ID" /><span>{visible.length} clients</span></div>
    <div className="client-results">{visible.map(c => <button key={c.id} onClick={() => onSelect(true)}><span className="avatar">{c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span><div><strong>{c.name}</strong><small>{c.id}</small></div><Tag tone="ready">{c.status.toUpperCase()}</Tag><div className="enrolled"><span>CONSISTENCY</span><strong>{c.consistency.toFixed(3)} · {c.label}</strong></div><Icon name="chevron" size={15} /></button>)}</div>
  </section>;
}

function ConsistencyGauge() {
  return <div className="consistency"><div className="gauge-labels"><span>Very consistent</span><span>Typical range</span><span>Variable</span></div><div className="gauge"><i /><em style={{left:"61%"}}/><b style={{left:"61%"}}/></div><div className="client-marker" style={{marginLeft:"54%"}}><span>SAMPLE PERSON 05</span><strong>1.183 · Variable</strong></div></div>;
}

function Profile({ verify, reenrol, expert }: { verify: () => void; reenrol: () => void; expert: boolean }) {
  return <div className="page"><PageHeader title="Sample Person 05" description="Person CEDAR-005 · Signature Profile ready" action={<div className="header-actions"><Button secondary onClick={reenrol}>Update samples</Button><Button secondary>Archive</Button><Button danger>Delete</Button><Button icon="verify" onClick={verify}>Verify a signature</Button></div>} />
    <div className="profile-layout"><section className="panel"><div className="panel-head"><div><span>REFERENCE SIGNATURES</span><h2>12 genuine samples</h2></div><Tag tone="ready">PROFILE READY</Tag></div><div className="reference-grid">{Array.from({ length: 12 }, (_, i) => <div key={i}><Signature seed={i} /><span>Reference {String(i + 1).padStart(2, "0")}</span></div>)}</div></section>
      <section className="panel profile-summary"><div className="panel-head"><div><span>SIGNATURE CONSISTENCY</span><h2>How much this Person's signature naturally changes</h2></div></div><ConsistencyGauge /><div className="plain-explanation"><Icon name="help" /><p>This Person is Variable, so checks are more tolerant than for a very consistent signer.</p></div><dl><div><dt>Dataset</dt><dd>CEDAR</dd></div><div><dt>Reference Samples</dt><dd>12</dd></div><div><dt>Checks</dt><dd>3</dd></div><div><dt>Profile status</dt><dd><Tag tone="ready">READY</Tag></dd></div>{expert && <><div><dt>Reference pairs</dt><dd>66</dd></div><div><dt>Consistency value</dt><dd>1.183</dd></div></>}</dl></section></div>
  </div>;
}

function Verify({ onProfile, onEnrol, expert, dataMode }: { onProfile: () => void; onEnrol: () => void; expert: boolean; dataMode: DataMode }) {
  const [client, setClient] = useState<"none" | "ready" | "blocked">("none");
  const [file, setFile] = useState("");
  const [state, setState] = useState<"empty" | "loading" | "result">("empty");
  const [verdict, setVerdict] = useState<Verdict>("LIKELY GENUINE");
  const selectedCheck = checks.find(c => c.verdict === verdict) ?? checks[0];
  const input = useRef<HTMLInputElement>(null);
  function run() { if (!file) return; setState("loading"); window.setTimeout(() => setState("result"), 900); }
  if (client === "none") return <div className="page"><PageHeader title="Verify a signature" description="Start by finding the Person whose signature you want to check." /><ClientSearch onSelect={ready => setClient(ready ? "ready" : "blocked")} /></div>;
  if (client === "blocked") return <div className="page"><PageHeader title="Verify a signature" description="This Person cannot be checked yet." /><section className="panel blocked-verify"><span><Icon name="alert" size={24} /></span><div><Tag tone="warn">PROFILE NOT READY</Tag><h2>Complete this Signature Profile first</h2><p>Verification needs 12 accepted genuine Reference Samples. No forged samples are required.</p><div><Button secondary onClick={() => setClient("none")}>Choose another Person</Button><Button icon="enrol" onClick={onEnrol}>Complete enrolment</Button></div></div></section></div>;
  return <div className="page"><PageHeader title="Verification workspace" description="Compare one Questioned Signature against a Person's 12 genuine Reference Samples." action={<button className="client-chip" onClick={onProfile}><span>05</span><div><strong>Sample Person 05</strong><small>CEDAR-005 · Signature Profile ready</small></div><Icon name="chevron" size={14} /></button>} />
    <div className="verify-grid">
      <section className="panel query-panel"><div className="panel-head"><div><span>CASE</span><h2>Check details</h2></div></div><label className="compact-field"><span>CASE REFERENCE</span><input defaultValue="CASE-2025-0184" /></label><label className="compact-field"><span>NOTES</span><textarea placeholder="Optional examination notes" /></label><input ref={input} className="hidden" type="file" accept="image/*" onChange={e => { setFile(e.target.files?.[0]?.name || "signature.png"); setState("empty"); }} /><button className={`upload-area ${file ? "loaded" : ""}`} onClick={() => input.current?.click()}>{file ? <><Signature seed={1} /><span>{file}</span></> : <><i><Icon name="upload" /></i><strong>Add Questioned Signature</strong><small>Drop, upload, scan, or crop a document</small></>}</button>{file && <div className="quality-check"><Icon name="check" size={13} /><span><strong>Image quality: Good</strong>Clear ink · one signature · usable size</span></div>}<div className="demo-outcomes"><span>DEMO RESULT</span>{(["LIKELY GENUINE", "UNCERTAIN", "LIKELY FORGED"] as Verdict[]).map(v => <button className={verdict === v ? "active" : ""} onClick={() => setVerdict(v)} key={v}>{v.replace("LIKELY ", "")}</button>)}</div><Button icon="scan" disabled={!file || state === "loading"} onClick={run}>{state === "loading" ? "Running verification…" : "Run verification"}</Button>{!file && <p className="input-hint">Verification is disabled until a clear image is added.</p>}</section>
      <section className="panel evidence-panel"><div className="panel-head"><div><span>EVIDENCE</span><h2>Questioned and Reference Samples</h2></div><Tag tone={file ? "ready" : "neutral"}>{file ? "IMAGE READY" : "AWAITING IMAGE"}</Tag></div><div className="evidence-viewer"><div><span>QUESTIONED SIGNATURE</span>{file ? <Signature seed={1} /> : <div className="evidence-empty"><Icon name="upload" /><small>Add an image in the Case panel</small></div>}</div><div><span>SELECTED REFERENCE · 04</span><Signature seed={1} /></div></div><div className="viewer-tools"><label><input type="checkbox" /> Overlay</label><label><input type="checkbox" defaultChecked /> Zoom/pan synchronised</label><label><input type="checkbox" /> Show cleaned image</label></div><div className="reference-strip">{Array.from({ length: 12 }, (_, i) => <button className={i === 3 ? "active" : ""} key={i}><Signature seed={i} /><span>R{String(i + 1).padStart(2, "0")}</span></button>)}</div></section>
      <section className={`panel result-card ${state === "result" ? verdict.toLowerCase().replace(" ", "-") : ""}`}>{state === "loading" ? <div className="loading"><i /><strong>Comparing with 12 Reference Samples</strong><span>Measuring this Person's natural variation.</span></div> : state === "result" ? <Result check={selectedCheck} dataMode={dataMode} /> : <div className="empty-result"><Icon name="verify" size={30} /><strong>No Verdict yet</strong><span>Run verification to see Confidence, reason, and next step.</span></div>}</section>
    </div>
    {state === "result" && <section className="panel comparison"><div className="panel-head"><div><span>SIMPLE EVIDENCE</span><h2>Most and least similar Reference Samples</h2></div></div><div className="comparison-signatures"><div><span>QUESTIONED SIGNATURE</span><Signature seed={1} /></div><div className="similar"><span>MOST SIMILAR · REFERENCE 04</span><Signature seed={1} /></div><div className="different"><span>LEAST SIMILAR · REFERENCE 10</span><Signature seed={2} /></div></div></section>}
    {expert && state === "result" && <ExpertEvidence check={selectedCheck} />}
  </div>;
}

function ExpertEvidence({ check }: { check: typeof checks[number] }) {
  const measures = differenceMeasures;
  const methodRows = caseMethodResults[check.id];
  return <section className="expert-section"><div className="expert-heading"><div><span>EXPERT VIEW</span><h2>Analysis evidence</h2></div><p>Exact values and technical panels for examination and audit.</p></div><div className="expert-grid">
    <article className="panel analysis-card"><div className="panel-head"><div><span>A · SCORE VS DECISION LINE</span><h2>Genuine reference score distribution</h2></div><Icon name="help" size={14} /></div><div className="distribution"><i /><em /><b /></div><div className="exact-values"><div><span>SCORE</span><strong>{check.score > 0 ? "+" : ""}{check.score.toFixed(3)}</strong></div><div><span>DECISION LINE</span><strong>{decision.line.toFixed(3)}</strong></div><div><span>DISTANCE</span><strong>{(check.score-decision.line).toFixed(3)}</strong></div></div></article>
    <article className="panel analysis-card"><div className="panel-head"><div><span>B · 12 COMPARISONS</span><h2>Per-reference model output</h2></div><Icon name="help" size={14} /></div><div className="comparison-bars">{check.comparisons.map((v,i)=><div key={i}><span>R{i+1}</span><i><em className={v < 0 ? "negative-bar" : ""} style={{height:`${Math.max(8,Math.abs(v)*180)}%`}}/></i><strong>{v.toFixed(3)}</strong></div>)}</div></article>
    <article className="panel analysis-card measure-card"><div className="panel-head"><div><span>C · 17 DIFFERENCE MEASURES</span><h2>Questioned value against genuine range</h2></div><Icon name="help" size={14} /></div><div className="measure-profile">{measures.map((m,i)=><div key={m}><span>{m}</span><i><em style={{left:`${25+(i*7)%35}%`,width:"34%"}}/><b style={{left:`${35+(i*11)%50}%`}}/></i></div>)}</div></article>
    <article className="panel analysis-card"><div className="panel-head"><div><span>D · SIMILARITY MATRIX</span><h2>12 references + questioned</h2></div><Icon name="help" size={14} /></div><div className="heatmap">{Array.from({length:169},(_,i)=><i key={i} style={{opacity:.18+((i*17)%70)/100}}/>)}</div></article>
    <article className="panel analysis-card"><div className="panel-head"><div><span>E · STROKE-DIRECTION MAP</span><h2>Questioned and most similar reference</h2></div></div><div className="hog-comparison"><div className="hog-box"><i/><i/><i/><i/><i/><i/><span>Questioned</span></div><div className="hog-box"><i/><i/><i/><i/><i/><i/><span>Reference 04</span></div></div><p className="analysis-note">Difference view is a browser visual aid, not a model output.</p></article>
    <article className="panel analysis-card"><div className="panel-head"><div><span>F · PREPROCESSING TRACE</span><h2>Five image stages</h2></div></div><div className="trace">{["Original","Inverted","Background removed","Crop + pad","100 × 100"].map((x,i)=><div key={x}><Signature seed={1} faded={i===0}/><span>{x}</span></div>)}</div></article>
    <article className="panel analysis-card"><div className="panel-head"><div><span>G · PROFILE PARAMETERS</span><h2>Read-only model record</h2></div></div><dl className="parameters-list">{Object.entries(profileParameters).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></article>
    <article className="panel analysis-card method-case"><div className="panel-head"><div><span>H · METHOD COMPARISON FOR THIS CASE</span><h2>Verdicts across three methods</h2></div></div><table><thead><tr><th>METHOD</th><th>CODE</th><th>SCORE</th><th>MATCHES</th></tr></thead><tbody>{methodRows.map(r=><tr key={r.code}><td>{r.method}</td><td>{r.code}</td><td>{r.score>0?"+":""}{r.score.toFixed(3)}</td><td>{r.matches}</td></tr>)}</tbody></table><p className="analysis-note">Scores are on different scales; compare verdicts, not raw numbers.</p></article>
  </div></section>;
}

function Result({ check, dataMode }: { check: typeof checks[number]; dataMode: DataMode }) {
  const uncertain = check.verdict === "UNCERTAIN", genuine = check.verdict === "LIKELY GENUINE";
  return <><div className="result-top"><span className={`verdict-icon ${genuine ? "good" : uncertain ? "warn" : "bad"}`}><Icon name={genuine ? "check" : "alert"} size={26} /></span><div><span>ADVISORY VERDICT</span><strong>{check.verdict}</strong><small>{check.reason}</small></div></div>{dataMode === "sample" && <div className="known-answer">Known answer (sample data): {check.known}</div>}<div className="confidence"><div><span>Different</span><span>Uncertain Zone</span><span>Similar</span></div><i><em /><b style={{ left: `${check.confidence}%` }} /></i><p>Confidence {check.confidence} of 100. How far the score is from the Decision Line, capped at 95. Not a probability.</p></div><div className="next-steps"><strong>Recommended next step</strong><p>{check.next}</p>{uncertain && <Button secondary icon="enrol">Request another sample</Button>}</div><div className="result-actions"><Button secondary icon="save">Open Case</Button><Button secondary icon="print">Export Evidence Report</Button><Button secondary icon="verify">New Check</Button></div><p className="advice"><Icon name="help" size={14} />The tool advises; a human makes the final decision.</p></>;
}

function Enrol() {
  const [step, setStep] = useState(1);
  const [accepted, setAccepted] = useState(9);
  const [loading, setLoading] = useState(false);
  function next() { if (step === 4) { setLoading(true); window.setTimeout(() => setLoading(false), 1000); } else setStep(step + 1); }
  return <div className="page"><PageHeader title="Enrol a client" description="Create a signature profile using 12 genuine signatures. Forged samples are never needed." /><div className="wizard-steps">{["Client details", "Add signatures", "Preview cleaning", "Create profile"].map((s, i) => <button className={step === i + 1 ? "active" : step > i + 1 ? "done" : ""} onClick={() => setStep(i + 1)} key={s}><i>{step > i + 1 ? <Icon name="check" size={12} /> : i + 1}</i><span>{s}</span></button>)}</div>
    <section className="panel wizard-panel">{step === 1 && <div className="form-step"><div className="step-title"><span>STEP 1 OF 4</span><h2>Client details</h2><p>Enter the name and ID used by your office.</p></div><div className="form-grid"><label><span>FULL NAME</span><input defaultValue="Amira Rahman" /></label><label><span>CLIENT ID</span><input defaultValue="CL-0047" /></label><label><span>CONTACT (OPTIONAL)</span><input placeholder="Phone or email" /></label></div></div>}
      {step === 2 && <div><div className="step-title"><span>STEP 2 OF 4</span><h2>Add 12 genuine signatures</h2><p>Scan, upload, or drop each signature. Every image is checked immediately.</p></div><div className="enrol-counter"><strong>{accepted} of 12 accepted</strong><span>{12 - accepted} more needed</span><i><em style={{ width: `${accepted / 12 * 100}%` }} /></i></div><div className="sample-grid">{Array.from({ length: 12 }, (_, i) => <button className={i < accepted ? "accepted" : i === accepted ? "rejected" : ""} onClick={() => i >= accepted && setAccepted(Math.min(12, accepted + 1))} key={i}>{i < accepted ? <><Signature seed={i} /><span><Icon name="check" size={10} />Accepted</span></> : i === accepted ? <><Icon name="alert" /><strong>Too faint</strong><small>Scan again with darker ink</small></> : <><Icon name="upload" /><strong>Sample {i + 1}</strong><small>Add signature</small></>}</button>)}</div></div>}
      {step === 3 && <div><div className="step-title"><span>STEP 3 OF 4 · OPTIONAL</span><h2>Preview image cleaning</h2><p>See how the system removes the background and prepares one signature.</p></div><div className="cleaning-strip">{["Original", "Background removed", "Cropped", "Resized"].map((s, i) => <div key={s}><span>{s}</span><Signature seed={1} faded={i === 0} /><small>{i === 3 ? "Standard size" : "Preview"}</small></div>)}</div><div className="plain-explanation"><Icon name="help" /><p>Cleaning makes signatures from different scanners easier to compare. It does not change the handwriting.</p></div></div>}
      {step === 4 && <div className="create-profile"><div className="step-title"><span>STEP 4 OF 4</span><h2>{loading ? "Creating signature profile…" : "Ready to create profile"}</h2><p>The profile learns how much this client's genuine signatures naturally vary.</p></div>{loading ? <div className="profile-progress"><i /><strong>Checking 66 signature pairs</strong><span>Please keep this window open.</span></div> : <><ConsistencyGauge /><div className="profile-ready"><Icon name="check" /><div><strong>12 accepted samples</strong><span>Ready to create this client's signature profile.</span></div></div></>}</div>}
      <div className="wizard-actions"><Button secondary disabled={step === 1} onClick={() => setStep(step - 1)}>Back</Button><Button icon={step === 4 ? "check" : "chevron"} disabled={step === 2 && accepted < 12} onClick={next}>{step === 4 ? "Create profile" : "Continue"}</Button></div></section></div>;
}

const historyRows = [
  ["Today, 14:32", "Amira Rahman", "Alex Lee", "Likely genuine", "Accepted"],
  ["Today, 11:08", "Leo Villanueva", "Alex Lee", "Uncertain", "Pending"],
  ["Yesterday, 16:41", "Daniel Cruz", "M. Reyes", "Likely forged", "Rejected"],
  ["12 Feb, 09:14", "Amira Rahman", "S. Tan", "Likely genuine", "Accepted"],
];

function History({ application = false }: { application?: boolean }) {
  return <div className="page"><PageHeader title={application ? "Verification history" : "Cases"} description={application ? "Every saved verification, model Verdict, override, and staff action." : "Saved Checks, evidence, final human decisions, notes, and action history."} /><div className="filters"><label><span>DATE</span><select><option>Last 30 days</option></select></label><label><span>STAFF</span><select><option>All staff</option></select></label><label><span>RESULT</span><select><option>All results</option></select></label><div><Icon name="search" /><input placeholder="Search client" /></div></div><section className="panel table-panel"><table><thead><tr>{["DATE & TIME", "PERSON", "EXAMINER", "VERDICT", "FINAL DECISION", ""].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{historyRows.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{i === 3 ? <Tag tone={c.includes("genuine") ? "ready" : c === "Uncertain" ? "warn" : "bad"}>{c.toUpperCase()}</Tag> : c}</td>)}<td><Icon name="chevron" size={14} /></td></tr>)}</tbody></table></section></div>;
}

function ApplicationDashboard({ openReview, openHistory }: { openReview: () => void; openHistory: () => void }) {
  return <div className="page"><PageHeader title="Dashboard" description="Checks per day, Verdict mix, uncertainty, and human agreement." /><div className="application-metrics">{[["Checks today","25","TODAY"],["Likely genuine","18","72%"],["Uncertain","3","12%"],["Human agreement","92.6%","30 DAYS"]].map((m,i)=><section className="panel" key={m[0]}><span>{m[0]}</span><strong>{m[1]}</strong><Tag tone={i===2?"warn":i===1?"ready":"neutral"}>{m[2]}</Tag></section>)}</div><div className="application-dashboard-grid"><section className="panel"><div className="panel-head"><div><span>RECENT CHECKS</span><h2>Latest model activity</h2></div><Button secondary onClick={openHistory}>Open Cases</Button></div><table><thead><tr><th>TIME</th><th>PERSON</th><th>VERDICT</th><th>CONFIDENCE</th></tr></thead><tbody>{checks.map((c,i)=><tr key={c.id}><td>{["14:32","11:08","09:41"][i]}</td><td>Sample Person 05</td><td><Tag tone={c.verdict==="LIKELY GENUINE"?"ready":c.verdict==="LIKELY FORGED"?"bad":"warn"}>{c.verdict}</Tag></td><td>{c.confidence}</td></tr>)}</tbody></table></section><section className="panel dashboard-review"><div className="panel-head"><div><span>REVIEW QUEUE</span><h2>3 items waiting</h2></div></div><p>Uncertain and Pending Checks are ordered oldest first.</p><Button icon="review" onClick={openReview}>Open Review Queue</Button></section></div></div>;
}

function ReviewQueue() {
  return <div className="page"><PageHeader title="Review Queue" description="Uncertain results and verifications sent for a recorded decision." action={<Tag tone="warn">3 WAITING</Tag>} /><div className="review-list">{[["Amira Rahman","Today, 11:08","Score falls inside the uncertain zone."],["Daniel Cruz","Yesterday, 15:22","Second sample differs from the first attempt."],["Maya Santos","11 Feb, 10:04","Staff requested technical review."]].map((r,i)=><section className="panel review-item" key={r[0]}><div className="review-person"><span>{r[0].split(" ").map(n=>n[0]).join("")}</span><div><strong>{r[0]}</strong><small>{r[1]} · Submitted by Alex Lee</small></div><Tag tone="warn">UNCERTAIN</Tag></div><div className="review-evidence"><div><span>QUESTIONED SIGNATURE</span><Signature seed={i+1}/></div><p><Icon name="alert"/>{r[2]}</p></div><label><span>REQUIRED REVIEW NOTE</span><input placeholder="Explain the recorded decision…"/></label><div className="review-actions"><Button secondary icon="check">Approve as genuine</Button><Button secondary icon="alert">Mark as forged</Button><Button secondary icon="enrol">Ask for new sample</Button></div></section>)}</div></div>;
}

function Curve({ variant }: { variant: number }) {
  const d = ["M15 170C44 122 84 87 126 58s72-31 105-37", "M15 170C40 102 79 66 122 43s76-20 109-22", "M15 170C38 90 76 53 120 34s78-12 111-13"][variant];
  return <svg className="curve" viewBox="0 0 250 190"><path className="grid" d="M15 20v150h220M15 130h220M15 90h220M15 50h220M70 20v150M125 20v150M180 20v150" /><path className="chance" d="m15 170 220-150" /><path className="line" d={d} /></svg>;
}

function MethodComparison() {
  const [dataset, setDataset] = useState<keyof typeof researchResults>("All");
  const r = researchResults[dataset];
  const methods = [["Our method - R1-WAW","Proposed",r.our[0],r.our[1]],["Shared yardstick","Existing technique",r.shared[0],r.shared[1]],["Standard method","Conventional baseline",r.standard[0],r.standard[1]]] as const;
  return <div className="page"><PageHeader title="Method comparison" description={`Research results for ${r.writers} development writers.`} /><div className="dataset-tabs">{(["All","CEDAR","Bengali","Hindi"] as const).map(d => <button className={dataset === d ? "active" : ""} onClick={() => setDataset(d)} key={d}>{d}</button>)}</div><div className="method-grid">{methods.map((m, i) => <section className={`panel method-card ${i === 0 ? "ours" : ""}`} key={m[0]}><div className="method-title"><span>{String(i + 1).padStart(2, "0")}</span><div><h2>{m[0]}</h2><p>{m[1]}</p></div>{i === 0 && <Tag tone="accent">PROPOSED</Tag>}</div><Curve variant={2-i} /><div className="method-values"><div><span>SEPARATION SCORE (AUC)</span><strong>{m[2].toFixed(3)}</strong><small>1.0 perfect · 0.5 guessing</small></div><div><span>EQUAL ERROR RATE</span><strong>{m[3]}</strong></div></div></section>)}</div><section className="reliability panel"><Icon name="help" /><div><span>IS THE IMPROVEMENT RELIABLE?</span><h2>Small but statistically reliable on the development writers.</h2><p>{reliableFinding}</p></div></section><section className="tested panel"><span>TESTED - DID NOT HELP</span><div><Tag>A per-writer diagonal - AUC 0.780</Tag><Tag>E cohort-weighted diagonal - AUC 0.772</Tag></div></section><section className="panel model-card"><h2>What R1-WAW does</h2><p>{methodExplanation}</p><code>{methodFormula}</code></section></div>;
}

function DatasetCheck() {
  const [dataset,setDataset]=useState<keyof typeof datasetResults>("All");
  const r=datasetResults[dataset];
  return <div className="page"><PageHeader title="Dataset check" description="Can this dataset be solved without reading the handwriting at all?" /><div className="dataset-tabs">{(["All","CEDAR","Bengali","Hindi"] as const).map(d=><button className={dataset===d?"active":""} onClick={()=>setDataset(d)} key={d}>{d}</button>)}</div><div className="facts-grid dataset-side"><section className="panel fact-card"><span>OUR METHOD</span><h2>Uses handwriting evidence</h2><strong>{r.our.toFixed(3)}</strong><small>SEPARATION SCORE</small></section><section className="panel fact-card"><span>SIMPLE IMAGE FACTS ONLY</span><h2>No handwriting</h2><strong>{r.simple.toFixed(3)}</strong><small>SEPARATION SCORE</small></section><section className="panel fact-card"><span>VERDICT</span><h2>{r.verdict}</h2><Tag tone={dataset==="Bengali"?"bad":"warn"}>{dataset.toUpperCase()}</Tag></section></div><section className="panel limitations"><Icon name="alert"/><div><h2>Dataset warning</h2><p>These public datasets contain cues unrelated to handwriting. Bengali results should not be read as signature verification.</p></div></section></div>;
}

function Library({ openProfile, enrol }: { openProfile: () => void; enrol: () => void }) {
  return <div className="page"><PageHeader title="Reference Library" description="People with stored Signature Profiles built from genuine Reference Samples." action={<Button icon="enrol" onClick={enrol}>Enrol Person</Button>} /><ClientSearch onSelect={ready => ready ? openProfile() : enrol()} /><section className="library-summary"><div><strong>164</strong><span>Ready profiles</span></div><div><strong>7</strong><span>Incomplete</span></div><div><strong>12</strong><span>Need refresh</span></div><div><strong>2,847</strong><span>Checks recorded</span></div></section></div>;
}

function BatchCheck() {
  const [loaded, setLoaded] = useState(false);
  return <div className="page"><PageHeader title="Batch Check" description="Check many Questioned Signatures using a CSV mapping each file to a Person ID." action={loaded && <Button icon="save">Export results</Button>} /><section className="panel batch-upload"><div><Icon name="upload" size={26}/><h2>Upload signatures and mapping CSV</h2><p>Choose image files first, then assign Person IDs automatically or in the table.</p><Button onClick={() => setLoaded(true)}>Load demonstration Batch</Button></div></section>{loaded && <section className="panel table-panel"><div className="batch-progress"><span>24 of 24 complete</span><i><em/></i><Tag tone="ready">BATCH COMPLETE</Tag></div><table><thead><tr><th>FILE</th><th>PERSON</th><th>VERDICT</th><th>CONFIDENCE</th><th>FLAGS</th><th/></tr></thead><tbody>{[["scan_001.png","CL-0047","LIKELY GENUINE","86","—"],["scan_002.png","CL-0103","UNCERTAIN","51","Review image"],["scan_003.png","CL-0138","LIKELY FORGED","79","Shape differs"]].map(r=><tr key={r[0]}>{r.map((c,i)=><td key={i}>{i===2?<Tag tone={c==="LIKELY GENUINE"?"ready":c==="UNCERTAIN"?"warn":"bad"}>{c}</Tag>:c}</td>)}<td><Icon name="chevron" size={14}/></td></tr>)}</tbody></table></section>}</div>;
}

function Reports() {
  return <div className="page"><PageHeader title="Reports" description="Check volume, Verdict mix, uncertainty, human agreement, and average Confidence." action={<Button secondary icon="save">Export report</Button>} /><div className="report-metrics">{[["Checks","428","+12%"],["Uncertain rate","8.2%","−1.4%"],["Human agreement","92.6%","+0.8%"],["Average Confidence","84 / 100","+2"]].map(x=><section className="panel" key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]} this period</small></section>)}</div><section className="panel report-chart"><div className="panel-head"><div><span>CHECKS PER DAY</span><h2>Last 30 days</h2></div></div><div className="report-bars">{[38,54,43,68,61,72,47,56,81,74,63,88,71,79,92,68,84,76,96,83,72,89,91,78,86,94,88,102,96,110].map((v,i)=><i key={i} style={{height:`${v/1.2}%`}}/>)}</div></section></div>;
}

function ResearchLab() {
  const [tab,setTab]=useState<"methods"|"dataset"|"model">("methods");
  return <div className="research-lab"><div className="research-tabs"><button className={tab==="methods"?"active":""} onClick={()=>setTab("methods")}>Method comparison</button><button className={tab==="dataset"?"active":""} onClick={()=>setTab("dataset")}>Dataset check</button><button className={tab==="model"?"active":""} onClick={()=>setTab("model")}>Model card</button></div>{tab==="methods"?<MethodComparison/>:tab==="dataset"?<DatasetCheck/>:<div className="page"><PageHeader title="Model card" description="What the model does, how it was built, and where it can fail."/><section className="panel model-card"><h2>Writer-adaptive one-class signature verification</h2><p>Uses only genuine samples to learn each Person's natural Signature Consistency. It supports human judgement and does not establish identity on its own.</p><dl><div><dt>Reference Samples</dt><dd>12 per Person</dd></div><div><dt>Difference Measures</dt><dd>17</dd></div><div><dt>Reference pairs</dt><dd>66</dd></div><div><dt>Known limitation</dt><dd>Skilled forgeries may remain close to genuine signatures</dd></div></dl></section></div>}</div>;
}

function Settings() {
  return <div className="page"><PageHeader title="Settings" description="Organisation, terminology, decision behaviour, storage, and privacy." action={<Button icon="save">Save Settings</Button>} /><div className="settings-grid"><section className="panel"><div className="panel-head"><div><span>ORGANISATION</span><h2>Workspace identity</h2></div></div><label className="compact-field"><span>ORGANISATION NAME</span><input defaultValue="Riverside Community Cooperative"/></label><label className="compact-field"><span>CALL PEOPLE</span><select><option>Person</option><option>Client</option><option>Member</option><option>Student</option><option>Employee</option></select></label><label className="compact-field"><span>ID LABEL</span><input defaultValue="Person ID"/></label></section><section className="panel"><div className="panel-head"><div><span>DECISIONS</span><h2>Default checking behaviour</h2></div></div><label className="compact-field"><span>STRICTNESS</span><select><option>Standard — balanced trade-off</option><option>Lenient — fewer false rejections</option><option>Strict — fewer false acceptances</option></select></label><label className="compact-field"><span>UNCERTAIN ZONE</span><select><option>Standard</option><option>Narrow</option><option>Wide</option></select></label><label className="compact-field"><span>DEFAULT VIEW</span><select><option>Simple view</option><option>Expert view</option></select></label></section><section className="panel"><div className="panel-head"><div><span>DATA & PRIVACY</span><h2>Retention and backup</h2></div></div><label className="compact-field"><span>RETENTION PERIOD</span><select><option>7 years</option><option>5 years</option><option>Until manually deleted</option></select></label><div className="settings-actions"><Button secondary>Back up data</Button><Button secondary>Restore backup</Button></div></section></div></div>;
}

function Help() {
  return <div className="page"><PageHeader title="Help" description="How Signature Desk works and how to collect reliable evidence."/><div className="help-steps">{[["01","Enrol","Enrol 12 genuine Reference Samples."],["02","Profile","The tool learns how much this person's signature varies."],["03","Verify","Compare the Questioned Signature with all 12 using 17 kinds of difference."],["04","Decide","Review the Verdict and evidence; a human decides."]].map(x=><section className="panel" key={x[0]}><span>{x[0]}</span><Icon name={x[1]==="Enrol"?"enrol":x[1]==="Verify"?"verify":"check"} size={22}/><h2>{x[1]}</h2><p>{x[2]}</p></section>)}</div><section className="panel limitations"><Icon name="alert"/><div><h2>Honest limitations</h2><p>{limitations}</p></div></section></div>;
}

function Workbench({ verify, compare }: { verify: () => void; compare: () => void }) {
  return <div className="page"><PageHeader title="Workbench" description="Your checks, open cases, and common examination actions." action={<div className="header-actions"><Button icon="verify" onClick={verify}>Verify a signature</Button><Button secondary icon="compare" onClick={compare}>Open Compare</Button></div>} /><div className="report-metrics">{[["Checks today","25"],["Open cases","7"],["Uncertain to re-check","3"],["People enrolled","25"]].map(x=><section className="panel" key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong><small>Sample data</small></section>)}</div><section className="panel table-panel"><div className="panel-head"><div><span>MY RECENT CHECKS</span><h2>Latest examinations</h2></div></div><table><thead><tr><th>CASE ID</th><th>PERSON</th><th>VERDICT</th><th>CONFIDENCE</th><th>DECISION</th><th>TIME</th></tr></thead><tbody>{checks.map((c,i)=><tr key={c.id}><td>{c.id}</td><td>Sample Person 05</td><td><Tag tone={c.verdict==="LIKELY GENUINE"?"ready":c.verdict==="UNCERTAIN"?"warn":"bad"}>{c.verdict}</Tag></td><td>{c.confidence} / 100</td><td>{i===0?"Accepted":i===1?"Needs more evidence":"Rejected"}</td><td>{["14:32","11:08","09:41"][i]}</td></tr>)}</tbody></table></section></div>;
}

function Compare() {
  const [loaded,setLoaded]=useState(false);
  return <div className="page"><PageHeader title="Compare signatures" description="Manual comparison. Run Verify for a model verdict." action={<Button secondary icon="save">Attach to case</Button>} /><section className="panel compare-upload"><div className="panel-head"><div><span>2 TO 6 IMAGES</span><h2>Comparison viewer</h2></div><div className="dataset-tabs"><button className="active">Side by side</button><button>Overlay</button><button>Swipe</button></div></div>{!loaded?<button className="batch-upload" onClick={()=>setLoaded(true)}><div><Icon name="upload" size={24}/><h2>Upload signatures to compare</h2><p>Zoom and pan stay synchronised.</p></div></button>:<><div className="manual-viewer"><div><Signature seed={0}/><span>Image A · ruler 0–160 px</span></div><div><Signature seed={2}/><span>Image B · ruler 0–160 px</span></div></div><div className="manual-derived">{[0,2].map((seed,i)=><div key={i}><section><Signature seed={seed}/><span>Cleaned 100 × 100</span></section><section className="hog-box"><i/><i/><i/><i/><i/><i/><span>Stroke-direction map</span></section></div>)}</div></>}</section></div>;
}

function EvidenceReports() {
  return <div className="page"><PageHeader title="Evidence Reports" description="Printable evidence packages exported from saved Cases." action={<Button secondary icon="print">Print selected</Button>} /><section className="panel table-panel"><table><thead><tr><th>CASE ID</th><th>PERSON</th><th>DATE</th><th>VERDICT</th><th>REPORT</th></tr></thead><tbody>{checks.map((c,i)=><tr key={c.id}><td>{c.id}</td><td>Sample Person 05</td><td>{["14 Feb 2025","13 Feb 2025","12 Feb 2025"][i]}</td><td><Tag tone={c.verdict==="LIKELY GENUINE"?"ready":c.verdict==="UNCERTAIN"?"warn":"bad"}>{c.verdict}</Tag></td><td><Button secondary icon="print">Open report</Button></td></tr>)}</tbody></table></section></div>;
}

/** Supervisor demo: the Figma Make screens with fixed sample data. A display preset only; it does not use the analysis service. */
export default function SupervisorDemo({ onLogout }: { onLogout: () => void }) {
  const [screen, setScreen] = useState<Screen>("Dashboard");
  const dataMode: DataMode = "sample";
  const expert = true;
  let page: ReactNode;
  if (screen === "Workbench") page = <Workbench verify={() => setScreen("Verify")} compare={() => setScreen("Compare")} />;
  else if (screen === "Dashboard") page = <ApplicationDashboard openReview={() => setScreen("Review Queue")} openHistory={() => setScreen("Cases")} />;
  else if (screen === "Verify") page = <Verify dataMode={dataMode} expert={expert} onProfile={() => setScreen("Client Profile")} onEnrol={() => setScreen("Enrol")} />;
  else if (screen === "Compare") page = <Compare />;
  else if (screen === "Client Profile") page = <Profile expert={expert} verify={() => setScreen("Verify")} reenrol={() => setScreen("Enrol")} />;
  else if (screen === "Enrol") page = <Enrol />;
  else if (screen === "Cases") page = <History />;
  else if (screen === "Review Queue") page = <ReviewQueue />;
  else if (screen === "Reference Library") page = <Library openProfile={() => setScreen("Client Profile")} enrol={() => setScreen("Enrol")} />;
  else if (screen === "Batch Check") page = <BatchCheck />;
  else if (screen === "Evidence Reports") page = <EvidenceReports />;
  else if (screen === "Reports") page = <Reports />;
  else if (screen === "Research Lab") page = <ResearchLab />;
  else if (screen === "Settings") page = <Settings />;
  else page = <Help />;
  return <Shell screen={screen} setScreen={setScreen} logout={onLogout}>{page}</Shell>;
}
