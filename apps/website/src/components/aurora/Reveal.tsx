import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { revealUp, staggerParent } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  stagger?: boolean;
  className?: string;
}

export function Reveal({ children, stagger = false, className }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={stagger ? staggerParent : revealUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={revealUp}>
      {children}
    </motion.div>
  );
}
