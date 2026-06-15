import { cn } from "@/lib/utils";

interface MonacoSkeletonProps {
  height: number | string;
  className?: string;
}

function MonacoSkeleton({ height, className }: MonacoSkeletonProps) {
  return (
    <div
      className={cn("rounded-md border bg-muted/30 animate-pulse", className)}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
      role="status"
      aria-busy="true"
      aria-label="Loading editor"
    />
  );
}

export { MonacoSkeleton, type MonacoSkeletonProps };
