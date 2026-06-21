import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { easeArr } from "./constants";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay before this block's children begin staggering in (seconds). */
  delay?: number;
  /** Render as an inline element instead of the default block. */
  as?: "div" | "section" | "span" | "li" | "ul";
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: easeArr },
  },
};

/**
 * Scroll-reveal container. Fades + lifts + un-blurs its children once when they
 * enter the viewport, staggering them. Respects `prefers-reduced-motion`: when
 * reduced, it renders a static, fully-visible block with no transform/filter.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const Comp = motion[as];

  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delayChildren: delay }}
    >
      {children}
    </Comp>
  );
}

interface RevealItemProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "span" | "li" | "h1" | "h2" | "p" | "a";
}

/**
 * A single staggered child of `Reveal`. Outside a `Reveal` (or under reduced
 * motion) it still renders, just without entrance animation.
 */
export function RevealItem({
  children,
  className,
  as = "div",
}: RevealItemProps) {
  const reduced = useReducedMotion();
  const Comp = motion[as];

  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp className={className} variants={itemVariants}>
      {children}
    </Comp>
  );
}
