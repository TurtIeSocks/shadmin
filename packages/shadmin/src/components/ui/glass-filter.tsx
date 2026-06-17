import type { CSSProperties, ReactElement } from "react";

/**
 * Mounts the SVG filter the glass material references by id. Render once near
 * your app root if you use the `.glass--l3` refraction level (L1/L2 and the
 * `data-glass` skin don't need it):
 *
 * ```tsx
 * import "@/styles/glass.css";
 * import { GlassFilter } from "@/components/ui/glass-filter";
 *
 * <GlassFilter />
 * ```
 *
 * `.glass--l3` consumes `#glass-refract` via `backdrop-filter: … url(#glass-refract)`
 * (Chromium-leaning — Safari/Firefox degrade gracefully to blur+saturate).
 *
 * Pure markup — the displacement/blur is applied in `glass.css`.
 */
export interface GlassFilterProps {
  /** Filter id used by `.glass--l3`. Default `glass-refract`. */
  id?: string;
  /** Displacement strength for the refraction map (L3). Default 32. */
  scale?: number;
}

const HIDDEN_SVG_STYLE: CSSProperties = {
  position: "absolute",
  width: 0,
  height: 0,
  overflow: "hidden",
  pointerEvents: "none",
};

function GlassFilter({
  id = "glass-refract",
  scale = 32,
}: GlassFilterProps): ReactElement {
  return (
    <svg aria-hidden="true" focusable="false" style={HIDDEN_SVG_STYLE}>
      <defs>
        {/* L3 refraction: fractal noise -> displace the backdrop for a lensing edge. */}
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.009 0.013"
            numOctaves={2}
            seed={9}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

export { GlassFilter };
