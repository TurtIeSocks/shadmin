import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EXTERNAL_LINK } from "@/lib/external-link";

interface MagneticButtonProps {
  href: string;
  children: ReactNode;
  variant?: "aurora" | "ghost" | "white";
  icon?: boolean;
  external?: boolean;
  className?: string;
}

// Pill background + label color per variant.
const PILL: Record<NonNullable<MagneticButtonProps["variant"]>, string> = {
  aurora: "bg-aurora text-white",
  ghost: "glass text-foreground",
  white: "bg-white text-[#1a1830] hover:bg-white/90",
};

// Trailing arrow chip. On the white pill a bg-white/15 chip would vanish, so the
// arrow rides an aurora chip and turns white — keeping button + arrow both white.
const ICON_CHIP: Record<NonNullable<MagneticButtonProps["variant"]>, string> = {
  aurora: "bg-white/15",
  ghost: "bg-white/15",
  white: "bg-aurora text-white",
};

/**
 * Pill CTA with a restrained hover (subtle scale + a small icon nudge) — calm
 * enough for a dashboard/dev-tool audience. (Kept the name for import stability;
 * the cursor-follow "magnetic" effect was dialed back as too much.)
 */
export function MagneticButton({
  href,
  children,
  variant = "aurora",
  icon = true,
  external = false,
  className,
}: MagneticButtonProps) {
  const reduce = useReducedMotion();

  return (
    <motion.a
      href={href}
      {...(external ? EXTERNAL_LINK : {})}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full pl-5 pr-2 py-2 text-sm font-medium",
        PILL[variant],
        className,
      )}
    >
      {children}
      {icon && (
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5",
            ICON_CHIP[variant],
          )}
        >
          <ArrowUpRight className="size-4" />
        </span>
      )}
    </motion.a>
  );
}
