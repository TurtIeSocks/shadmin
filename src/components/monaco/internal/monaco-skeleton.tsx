import { cn } from "@/lib/utils";

export const MonacoSkeleton = ({
  height,
  className,
}: {
  height: number | string;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-md border bg-muted/30 animate-pulse",
      className,
    )}
    style={{ height: typeof height === "number" ? `${height}px` : height }}
    aria-busy="true"
    aria-label="Loading editor"
  />
);
