import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

export type View = { zoom: number; x: number; y: number; rotate: number; invert: boolean };
export const FIT: View = { zoom: 1, x: 0, y: 0, rotate: 0, invert: false };
export const MIN_ZOOM = 1, MAX_ZOOM = 8;
export type Size = { w: number; h: number };

export const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

/** Live size of an element. */
export function useBox(ref: RefObject<HTMLElement | null>): Size {
  const [box, setBox] = useState<Size>({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return box;
}

/** Contain inside the box with 6% padding, but never larger than the image's natural size (no blurry upscaling). */
export function fitSize(natural: Size, box: Size, rotate: number, pad = 0.06): Size {
  if (!natural.w || !box.w) return { w: 0, h: 0 };
  const turned = rotate % 180 !== 0;
  const nw = turned ? natural.h : natural.w, nh = turned ? natural.w : natural.h;
  const scale = Math.min((box.w * (1 - 2 * pad)) / nw, (box.h * (1 - 2 * pad)) / nh, 1);
  return { w: natural.w * scale, h: natural.h * scale };
}

type LayerProps = { src: string; alt: string; view: View; box: Size; onNatural?: (s: Size) => void; className?: string; style?: CSSProperties };

/** One image positioned in the centre of the canvas with the shared zoom / pan / rotate transform. */
export function Layer({ src, alt, view, box, onNatural, className = "", style }: LayerProps) {
  const [natural, setNatural] = useState<Size>({ w: 0, h: 0 });
  const size = fitSize(natural, box, view.rotate);
  return <img src={src} alt={alt} draggable={false} className={`viewer-layer ${className}`}
    onLoad={e => { const s = { w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight }; setNatural(s); onNatural?.(s); }}
    style={{ width: size.w || undefined, height: size.h || undefined, transform: `translate(-50%, -50%) translate(${view.x}px, ${view.y}px) scale(${view.zoom}) rotate(${view.rotate}deg)`, filter: view.invert ? "invert(1)" : undefined, ...style }} />;
}

/** Wheel to zoom (towards the pointer), drag to pan. */
export function usePanZoom(ref: RefObject<HTMLElement | null>, view: View, setView: (v: View) => void) {
  const latest = useRef(view);
  latest.current = view;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function wheel(e: WheelEvent) {
      e.preventDefault();
      const v = latest.current, r = el!.getBoundingClientRect();
      const zoom = clampZoom(v.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
      const px = e.clientX - r.left - r.width / 2, py = e.clientY - r.top - r.height / 2, k = zoom / v.zoom;
      setView(zoom === 1 ? { ...v, zoom, x: 0, y: 0 } : { ...v, zoom, x: px - (px - v.x) * k, y: py - (py - v.y) * k });
    }
    let drag: { x: number; y: number; vx: number; vy: number } | null = null;
    function down(e: PointerEvent) {
      if (latest.current.zoom <= 1 || (e.target as HTMLElement).closest("button, input")) return;
      drag = { x: e.clientX, y: e.clientY, vx: latest.current.x, vy: latest.current.y };
      el!.setPointerCapture(e.pointerId);
    }
    function move(e: PointerEvent) {
      if (!drag) return;
      setView({ ...latest.current, x: drag.vx + e.clientX - drag.x, y: drag.vy + e.clientY - drag.y });
    }
    function up() { drag = null; }
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [ref, setView]);
}
