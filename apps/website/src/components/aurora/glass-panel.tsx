import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: ReactNode;
  bezel?: boolean;
  className?: string;
}

export function GlassPanel({
  children,
  bezel = false,
  className,
}: GlassPanelProps) {
  if (bezel) {
    return (
      <div className="bezel h-full">
        <div
          className={cn("glass rounded-[calc(2rem-0.5rem)] h-full", className)}
        >
          {children}
        </div>
      </div>
    );
  }
  return <div className={cn("glass rounded-2xl", className)}>{children}</div>;
}
