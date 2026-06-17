import type { CSSProperties, ReactElement } from "react";

const HIDDEN: CSSProperties = {
  position: "absolute",
  width: 0,
  height: 0,
  overflow: "hidden",
  pointerEvents: "none",
};

/**
 * Mounts the `#glass-refract` SVG filter that glass.css's `.glass--l3` references
 * (`backdrop-filter: … url(#glass-refract)`). Render once at the app root.
 * Chromium-leaning — Safari/Firefox ignore the url() and degrade to L2 blur.
 */
export function GlassFilter(): ReactElement {
  return (
    <svg aria-hidden="true" focusable="false" style={HIDDEN}>
      <defs>
        <filter id="glass-refract" x="-20%" y="-20%" width="140%" height="140%">
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
            scale={32}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
