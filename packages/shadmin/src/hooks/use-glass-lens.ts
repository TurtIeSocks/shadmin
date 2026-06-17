import { type Ref, useEffect, useRef, useState } from "react";
import { makeDisplacementMap } from "@/lib/glass-displacement-map";

export interface GlassLensOptions {
  /** Corner radius in px — match the element's border-radius. Default 18. */
  radius?: number;
  /** Width of the refracting rim band in px. Default 24. */
  bezel?: number;
  /** +1 convex (rim pulls the background outward), -1 concave. Default 1. */
  sign?: number;
}

export interface GlassLensState<T extends HTMLElement> {
  /** Put this on the `.glass--lens` element — it is measured to size the map. */
  ref: Ref<T>;
  /** The generated displacement-map data URL ("" until measured / on the server). */
  map: string;
  /** The element's current border-box size, in px. */
  size: { width: number; height: number };
}

/**
 * Measure a `.glass--lens` element and generate a radial displacement map sized
 * to it, rebuilding on resize. Client-only (empty map during SSR). Pair the
 * returned `ref` with a `<GlassLensFilter>` fed the returned `map`/`size`.
 *
 * @example
 * const { ref, map, size } = useGlassLens<HTMLDivElement>({ radius: 18, bezel: 26 });
 * return (
 *   <>
 *     <GlassLensFilter href={map} width={size.width} height={size.height} />
 *     <div ref={ref} className="glass glass--l2 glass--lens">…</div>
 *   </>
 * );
 */
export function useGlassLens<T extends HTMLElement = HTMLElement>(
  options: GlassLensOptions = {},
): GlassLensState<T> {
  const { radius = 18, bezel = 24, sign = 1 } = options;
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [map, setMap] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect(); // border-box — matches the filter region
      setSize({ width: Math.round(r.width), height: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!size.width || !size.height) return;
    setMap(
      makeDisplacementMap({
        width: size.width,
        height: size.height,
        radius,
        bezel,
        sign,
      }),
    );
  }, [size.width, size.height, radius, bezel, sign]);

  return { ref: ref as Ref<T>, map, size };
}
