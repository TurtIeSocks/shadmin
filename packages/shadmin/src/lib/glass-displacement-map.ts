// Generate a radial "lens" displacement map for L3 glass refraction
// (`.glass--lens` in glass.css). The default L3 filter uses feTurbulence (random
// noise) → organic frost; a real lens bends the backdrop hardest at the rim and
// leaves the centre flat. This bakes that edge-lensing into an image where each
// pixel's RED channel encodes an x-displacement and GREEN a y-displacement
// (neutral = 128, range ±127), fed to feDisplacementMap via <feImage>.
//
// The map is SIZE-SPECIFIC: backdrop-filter's filter region does not auto-fit the
// element, so the map's W×H must match it — regenerate on resize (see
// useGlassLens). Adapted from https://kube.io/blog/liquid-glass-css-svg/.

interface RoundedRectSDF {
  /** Signed distance to the rounded rect (negative inside the panel). */
  dist: number;
  /** Outward unit normal x. */
  nx: number;
  /** Outward unit normal y. */
  ny: number;
}

/**
 * Signed distance from (px,py) to a rounded-rect [0,0,w,h] with corner radius r,
 * plus the outward unit normal there (standard rounded-box SDF, Inigo Quilez).
 */
function roundedRectSDF(
  px: number,
  py: number,
  w: number,
  h: number,
  r: number,
): RoundedRectSDF {
  const cx = w / 2;
  const cy = h / 2;
  const qx = Math.abs(px - cx) - (cx - r);
  const qy = Math.abs(py - cy) - (cy - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  const outside = Math.hypot(ax, ay);
  const inside = Math.min(Math.max(qx, qy), 0);
  const dist = outside + inside - r; // < 0 inside the panel

  const sx = Math.sign(px - cx) || 1;
  const sy = Math.sign(py - cy) || 1;
  let nx: number;
  let ny: number;
  if (qx > 0 || qy > 0) {
    const len = outside || 1;
    nx = (sx * ax) / len;
    ny = (sy * ay) / len;
  } else if (qx > qy) {
    nx = sx;
    ny = 0;
  } else {
    nx = 0;
    ny = sy;
  }
  return { dist, nx, ny };
}

/** Smooth 0→1→0 bump across the bezel band (sine hump). t in [0,1]. */
function bump(t: number): number {
  return Math.sin(Math.max(0, Math.min(1, t)) * Math.PI);
}

export interface MakeDisplacementMapOptions {
  /** Element width in px (map is rendered at this size). */
  width: number;
  /** Element height in px. */
  height: number;
  /** Corner radius in px — match the element's border-radius. Default 24. */
  radius?: number;
  /** Width of the refracting rim band in px. Default 24. */
  bezel?: number;
  /** +1 convex (rim pulls the background outward), -1 concave. Default 1. */
  sign?: number;
}

/**
 * Build a displacement-map data URL for a rounded-rect glass surface. Returns a
 * PNG data URL, or `""` on the server (no canvas) — SSR-safe.
 */
export function makeDisplacementMap({
  width,
  height,
  radius = 24,
  bezel = 24,
  sign = 1,
}: MakeDisplacementMapOptions): string {
  if (typeof document === "undefined") return ""; // SSR / no-DOM guard
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(w, h);
  const data = img.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const { dist, nx, ny } = roundedRectSDF(x + 0.5, y + 0.5, w, h, radius);
      const fromEdge = -dist; // >= 0 inside the panel
      let mag = 0;
      if (fromEdge >= 0 && fromEdge < bezel) {
        mag = bump(fromEdge / bezel) * sign; // peaks mid-bezel, 0 at edge + inner bezel
      }
      // Displace along the INWARD normal so the rim samples the background from
      // outside → the classic "fat edge" lensing.
      const dx = -nx * mag;
      const dy = -ny * mag;
      const i = (y * w + x) * 4;
      data[i] = 128 + Math.max(-1, Math.min(1, dx)) * 127; // R = x displacement
      data[i + 1] = 128 + Math.max(-1, Math.min(1, dy)) * 127; // G = y displacement
      data[i + 2] = 128; // B unused (room for chromatic-aberration experiments)
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}
