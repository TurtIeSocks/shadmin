import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Aurora "icon chip" — a centered glyph (usually a white Lucide icon) on the
 * aurora gradient. Size and corner radius are supplied by the caller via
 * `className` (e.g. `size-10 rounded-xl`), since they vary per placement.
 */
export function AuroraBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-aurora",
        className,
      )}
    >
      {children}
    </span>
  );
}
