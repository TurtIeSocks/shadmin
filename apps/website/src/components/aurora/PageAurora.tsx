import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Single page-wide aurora atmosphere. Rendered once, fixed behind all content,
 * so the gradient reads as one continuous wash — no per-section seams.
 *
 * Each orb is a soft radial gradient (fades to transparent) and drifts slowly
 * via a CSS-only keyframe (`aurora-drift`, defined in index.css). Theme-adaptive
 * via the shared --orb-* tokens. Honors prefers-reduced-motion.
 */
const ORBS = [
  { pos: "left-[-12%] top-[-10%] size-[34rem]", orb: 1, dur: "28s", delay: "0s", dx: "36px", dy: "28px" },
  { pos: "right-[-14%] top-[6%] size-[30rem]", orb: 2, dur: "34s", delay: "-7s", dx: "-44px", dy: "36px" },
  { pos: "left-[6%] top-[58%] size-[28rem]", orb: 3, dur: "31s", delay: "-14s", dx: "38px", dy: "-30px" },
  { pos: "right-[0%] bottom-[-10%] size-[32rem]", orb: 4, dur: "26s", delay: "-4s", dx: "-32px", dy: "-38px" },
];

export function PageAurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {ORBS.map((o) => (
        <div
          key={o.pos}
          className={cn("aurora-orb absolute rounded-full blur-[40px]", o.pos)}
          style={
            {
              background: `radial-gradient(circle at center, var(--orb-${o.orb}) 0%, transparent 70%)`,
              animationDuration: o.dur,
              animationDelay: o.delay,
              "--dx": o.dx,
              "--dy": o.dy,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
