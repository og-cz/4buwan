import { useEffect, useState } from "react";
import { getImageBlob, preprocess, sampleUrl } from "../../api/client";
import useAsync from "../../state/useAsync";
import { pad2 } from "../../format";

/** Pixel-wise |questioned − reference| of the two stroke-direction maps (display only). */
function useDifference(a: string | undefined, b: string | undefined): string | null {
  const [out, setOut] = useState<string | null>(null);
  useEffect(() => {
    if (!a || !b) { setOut(null); return; }
    let alive = true;
    const load = (src: string) => new Promise<HTMLImageElement>((res, rej) => { const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = src; });
    Promise.all([load(a), load(b)]).then(([ia, ib]) => {
      const w = ia.naturalWidth, h = ia.naturalHeight, c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(ia, 0, 0); const da = ctx.getImageData(0, 0, w, h);
      ctx.drawImage(ib, 0, 0, w, h); const db = ctx.getImageData(0, 0, w, h);
      for (let i = 0; i < da.data.length; i += 4) { const d = Math.abs(da.data[i] - db.data[i]); da.data[i] = da.data[i + 1] = da.data[i + 2] = d; }
      ctx.putImageData(da, 0, 0);
      if (alive) setOut(c.toDataURL());
    }).catch(() => alive && setOut(null));
    return () => { alive = false; };
  }, [a, b]);
  return out;
}

/** Stroke-direction (HOG) maps in square boxes: questioned, the chosen reference, and their difference. */
export default function HogPanel({ questionedHog, personId, reference }: { questionedHog?: string; personId: string; reference: number }) {
  const ref = useAsync(() => getImageBlob(sampleUrl(personId, reference)).then(preprocess), [personId, reference]);
  const diff = useDifference(questionedHog, ref.data?.hog);
  const tiles: [string, string | null | undefined][] = [["Questioned", questionedHog], [`Reference ${pad2(reference)}`, ref.data?.hog], ["Difference", diff]];
  return <div className="hog-grid">{tiles.map(([label, src]) => <figure key={label} className="hog-tile"><div className="hog-img">{src ? <img src={src} alt={`${label} stroke-direction map`} /> : <span className="skeleton" />}</div><figcaption>{label}</figcaption></figure>)}</div>;
}
