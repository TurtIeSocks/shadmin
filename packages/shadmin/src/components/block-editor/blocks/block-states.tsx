import { AlertTriangle, MousePointerClick } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function BlockEmpty({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
      <MousePointerClick className="size-4" /> {label}
    </div>
  );
}

export function BlockSkeleton() {
  return <Skeleton className="h-16 w-full rounded-md" />;
}

export function BlockError({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      <AlertTriangle className="size-4" /> {label}
    </div>
  );
}
