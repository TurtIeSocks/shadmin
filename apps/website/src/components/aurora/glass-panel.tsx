import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: ReactNode;
  bezel?: boolean;
  /**
   * Glass fidelity (from glass.css): 1 = flat L1 (tiny chips/pills), 2 = specular
   * + inner depth + sheen (the default for any visible panel), 3 = + SVG
   * refraction (hero only; needs the #glass-refract filter mounted at the root).
   */
  level?: 1 | 2 | 3;
  className?: string;
}

// Cumulative level classes, mirroring glass.css stacking.
const LEVEL: Record<1 | 2 | 3, string> = {
  1: "glass",
  2: "glass glass--l2",
  3: "glass glass--l2 glass--l3",
};

export function GlassPanel({
  children,
  bezel = false,
  level = 2,
  className,
}: GlassPanelProps) {
  if (bezel) {
    return (
      <div className="bezel h-full">
        <div
          className={cn(
            LEVEL[level],
            "rounded-[calc(2rem-0.5rem)] h-full",
            className,
          )}
        >
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className={cn(LEVEL[level], "rounded-2xl", className)}>{children}</div>
  );
}
