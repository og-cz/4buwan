export default function Signature({ seed = 0, faded = false }: { seed?: number; faded?: boolean }) {
  const d = [
    "M12 56c9-17 13-28 16-1 3 23 10-40 17-2 5 24 14-24 19-1 5 20 13-17 20 1 6 14 14-8 21-1 10 8 20 2 31-5",
    "M12 60c12-8 12-33 19-2 5 24 11-37 18-1 5 23 11-14 17-1 7 18 12-12 21-1 8 11 17-4 24-1 9 4 19 0 28-5",
    "M15 58c8-11 13-28 17 0 4 20 12-31 18-1 4 18 10-10 16-1 8 16 12-10 21-2 9 12 17-3 24-1 13 7 23 5 37-4",
  ][seed % 3];
  return <div className={`signature ${faded ? "faded" : ""}`}><svg viewBox="0 0 160 86" preserveAspectRatio="none"><path d={d} /><path className="under" d={`M${17 + seed * 3} 69c41-7 82 9 126-3`} /></svg></div>;
}
