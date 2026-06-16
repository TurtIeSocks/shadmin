import { cn } from "@/lib/utils";

// macOS traffic-light colors, shared by the code-editor and terminal mockups.
const DOTS = ["#ed6a5e", "#f4bf4f", "#61c554"] as const;

/**
 * Window title-bar chrome: three traffic-light dots + an optional label. Sits
 * at the top of the faux app-window mockups (code editor, terminal).
 */
export function WindowChrome({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {DOTS.map((color) => (
        <span
          key={color}
          className="size-3 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      ))}
      {label && (
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
