import { GlassPanel } from "@/components/aurora/glass-panel";
import { cn } from "@/lib/utils";

/**
 * Small glass pill showing a brand logo + label — used for backend and hosting
 * provider lists. Omit `src` for a label-only chip (renders muted, no image).
 */
export function LogoChip({
  name,
  src,
  className,
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  return (
    <GlassPanel
      className={cn(
        "inline-flex items-center px-3 py-1.5 text-sm font-semibold",
        src ? "text-foreground" : "text-muted-foreground",
        className,
      )}
    >
      {src && (
        <img
          alt={name}
          src={src}
          width={16}
          height={16}
          className="mr-2 inline-block"
        />
      )}
      {name}
    </GlassPanel>
  );
}
