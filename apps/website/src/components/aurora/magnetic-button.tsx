import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  href: string;
  children: ReactNode;
  variant?: "aurora" | "ghost";
  icon?: boolean;
  external?: boolean;
  className?: string;
}

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
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full pl-5 pr-2 py-2 text-sm font-medium",
        variant === "aurora" ? "bg-aurora text-white" : "glass text-foreground",
        className,
      )}
    >
      {children}
      {icon && (
        <span className="flex size-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5">
          <ArrowUpRight className="size-4" />
        </span>
      )}
    </motion.a>
  );
}
