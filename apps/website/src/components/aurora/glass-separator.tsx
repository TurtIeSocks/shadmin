import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { EASE_FLUID } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Glass separator — a section-to-section divider in the aurora language.
 *
 * Three stacked, GPU-cheap layers:
 *   1. a structural hairline — a real `<hr>` thematic break, tinted by the
 *      shadcn `--border` token so it stays visible on both the near-white light
 *      bg and the near-black dark bg (the `--glass-*` tokens would disappear in
 *      light mode),
 *   2. a center-weighted wash of the signature `--aurora` gradient for colour,
 *   3. a faceted glass "gem" node with a soft radial halo (no blur filter — the
 *      halo is a radial-gradient wash, the same trick PageAurora uses).
 *
 * Motion (the site's stagger-parent idiom): on scroll the line + tint draw
 * outward from the centre (scaleX), then the gem pops a beat later. The reveal
 * is TRIGGERED by the full-size wrapper's `whileInView` and propagates to the
 * DIRECT motion children — the wrapper always has area to observe, and the
 * children must stay direct (an intermediate plain <div> would break framer's
 * variant propagation). Honors prefers-reduced-motion: renders fully static.
 */
interface GlassSeparatorProps {
  /** Render the center glass gem + halo. Default true. */
  node?: boolean;
  className?: string;
}

// Taper the structural hairline to nothing at both ends — no hard edges.
const EDGE_TAPER =
  "[mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]";
// Tighter taper so the aurora colour blooms only toward the centre.
const TINT_TAPER =
  "[mask-image:linear-gradient(to_right,transparent,black_36%,black_64%,transparent)]";

// Orchestrator — establishes the variant root so "hidden"/"show" propagates.
const containerVariants: Variants = { hidden: {}, show: {} };

// Line + tint draw outward from the centre. They animate from scaleX:0 (zero
// width), which is safe here ONLY because the OBSERVER is the parent wrapper,
// not these children — a self-observed zero-width element would never fire.
const lineVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.9, ease: EASE_FLUID },
  },
};

const tintVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 0.6,
    transition: { duration: 0.9, ease: EASE_FLUID },
  },
};

// Gem pops a beat after the line has drawn. x/y:-50% does the centering in
// framer-space so it composes with `scale` (a Tailwind -translate would clash
// with framer's transform).
const gemVariants: Variants = {
  hidden: { scale: 0, opacity: 0, x: "-50%", y: "-50%" },
  show: {
    scale: 1,
    opacity: 1,
    x: "-50%",
    y: "-50%",
    transition: { duration: 0.5, delay: 0.4, ease: EASE_FLUID },
  },
};

export function GlassSeparator({
  node = true,
  className,
}: GlassSeparatorProps) {
  const reduce = useReducedMotion();

  // Trigger on the stable, full-size wrapper — never the collapsing line.
  const parentAnim = reduce
    ? ({ initial: "show" } as const)
    : ({
        initial: "hidden",
        whileInView: "show",
        viewport: { once: true, margin: "-80px" },
      } as const);

  return (
    <motion.div
      {...parentAnim}
      variants={containerVariants}
      className={cn(
        "relative mx-auto w-full max-w-5xl px-6 py-8 md:py-12",
        className,
      )}
    >
      {/* structural hairline — the semantic <hr>, theme-aware border token.
          (top-1/2 leaves it 0.5px below centre — imperceptible on a 1px line,
          and avoids a -translate that would fight framer's scaleX transform.) */}
      <motion.hr
        variants={lineVariants}
        style={{ transformOrigin: "center" }}
        className={cn(
          "absolute inset-x-6 top-1/2 m-0 h-px border-0 bg-border",
          EDGE_TAPER,
        )}
      />
      {/* aurora tint — signature gradient, concentrated toward the centre */}
      <motion.div
        aria-hidden
        variants={tintVariants}
        style={{ transformOrigin: "center", background: "var(--aurora)" }}
        className={cn("absolute inset-x-6 top-1/2 h-px", TINT_TAPER)}
      />

      {node && (
        <motion.div
          aria-hidden
          variants={gemVariants}
          className="pointer-events-none absolute left-1/2 top-1/2 grid place-items-center"
        >
          {/* ambient halo — radial wash, no blur filter (GPU-cheap) */}
          <div
            className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle at center, var(--orb-2) 0%, transparent 70%)",
            }}
          />
          {/* glass gem — aurora-faceted, lit top edge + tight glow */}
          <div
            className="relative size-2.5 rotate-45 rounded-[3px] ring-1 ring-white/30"
            style={{
              background: "var(--aurora)",
              boxShadow:
                "0 0 16px 1px var(--orb-2), inset 0 1px 0 rgba(255,255,255,0.55)",
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
