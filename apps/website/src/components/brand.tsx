import { cn } from "shadmin/lib/utils";

interface BrandProps {
  className?: string;
  /** Mark size in px (the wordmark scales with the parent font-size). */
  markSize?: number;
}

/**
 * The shadmin wordmark: gradient mark glyph + "shad" (themed) / "min" (gradient).
 * Theme-adaptive — unlike the baked-black lockup SVG, the "shad" text follows
 * `--foreground`, so it reads on both light and dark backgrounds.
 */
export function Brand({ className, markSize = 24 }: BrandProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      <img
        src="/shadmin-mark.svg"
        alt=""
        aria-hidden
        width={markSize}
        height={markSize}
        style={{ width: markSize, height: markSize }}
        className="shrink-0"
      />
      <span className="text-foreground">
        shad<span className="text-brand-gradient">min</span>
      </span>
    </span>
  );
}
