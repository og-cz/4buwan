import { useCallback, useRef, useState } from "react";
import { preprocess } from "../../api/client";
import Tag from "../Tag";
import type { Quality } from "../../types";
import ViewerToolbar from "./ViewerToolbar";
import { FIT, fitSize, Layer, useBox, usePanZoom, type Size, type View } from "./viewerCore";

export type ViewerSource = { src: string; label: string; fileName?: string; quality?: Quality | null; load?: () => Promise<Blob> };

type Props = ViewerSource & { view?: View; onView?: (v: View) => void; className?: string };

/** Large signature view: paper canvas, hover toolbar and a caption with label, file name, pixel size and quality. */
export default function SignatureViewer({ src, label, fileName, quality, load, view: controlled, onView, className = "" }: Props) {
  const [own, setOwn] = useState<View>(FIT);
  const view = controlled ?? own;
  const setView = useCallback((v: View) => (onView ?? setOwn)(v), [onView]);
  const canvas = useRef<HTMLDivElement>(null);
  const box = useBox(canvas);
  usePanZoom(canvas, view, setView);
  const [natural, setNatural] = useState<Size>({ w: 0, h: 0 });
  const [cleaned, setCleaned] = useState<string | null>(null);
  const [showCleaned, setShowCleaned] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggleCleaned() {
    if (showCleaned) { setShowCleaned(false); return; }
    if (!cleaned && load) {
      setBusy(true);
      try { setCleaned((await preprocess(await load())).stages.S4); } catch { setBusy(false); return; }
      setBusy(false);
    }
    setShowCleaned(true);
  }

  const shown = showCleaned && cleaned ? cleaned : src;
  const fitted = fitSize(natural, box, view.rotate);
  const oneToOne = fitted.w ? natural.w / fitted.w : 1;
  return <figure className={`signature-viewer ${className}`}>
    <div className="viewer-canvas" ref={canvas} tabIndex={0} aria-label={`${label}. Scroll to zoom, drag to pan.`} style={{ cursor: view.zoom > 1 ? "grab" : "zoom-in" }}>
      <Layer key={shown} src={shown} alt={label} view={view} box={box} onNatural={setNatural} />
      <ViewerToolbar view={view} setView={setView} oneToOne={oneToOne} cleaned={showCleaned} onCleaned={load ? () => void toggleCleaned() : undefined} cleanedBusy={busy} />
    </div>
    <figcaption className="viewer-caption"><strong>{label}{showCleaned ? " · cleaned 100 × 100" : ""}</strong>{fileName && <span className="viewer-file">{fileName}</span>}{natural.w > 0 && <span className="num">{natural.w} × {natural.h} px</span>}{quality && <Tag tone={quality.ok ? "ready" : "bad"}>{quality.ok ? "Quality good" : "Quality issue"}</Tag>}</figcaption>
  </figure>;
}
