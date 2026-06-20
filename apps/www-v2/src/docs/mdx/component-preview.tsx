/**
 * ComponentPreview — live component preview embedded in MDX docs.
 *
 * Usage in MDX:
 *   <ComponentPreview slug="components/button/basic" />
 *
 * Demos live at: src/docs/content/<slug>/demos/<name>.tsx
 * Each demo file must have a default export that is a React component.
 */
import { useState, type ReactNode } from "react";
import { cn } from "shadmin/lib/utils";

// Eager-load all demo files so the registry is available at runtime.
// The glob pattern must be a string literal for Vite to parse it statically.
const demoModules = import.meta.glob<{ default: () => ReactNode }>(
  "../content/**/demos/*.tsx",
  { eager: true },
);

/** Convert slug + demo name → glob key */
function slugToKey(slug: string, demo = "basic"): string {
  return `../content/${slug}/demos/${demo}.tsx`;
}

interface ComponentPreviewProps {
  /** Path relative to content/, without /demos/<name>.tsx.  e.g. "components/button" */
  slug: string;
  /** Demo variant name (default: "basic") */
  demo?: string;
  /** Optional extra className for the preview wrapper */
  className?: string;
}

export function ComponentPreview({
  slug,
  demo = "basic",
  className,
}: ComponentPreviewProps) {
  const [tab, setTab] = useState<"preview" | "code">("preview");

  const key = slugToKey(slug, demo);
  const mod = demoModules[key];

  if (!mod) {
    return (
      <div className="my-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Demo not found: <code className="font-mono">{key}</code>
      </div>
    );
  }

  const DemoComponent = mod.default;

  return (
    <div
      className={cn(
        "my-6 overflow-hidden rounded-xl border border-border/50",
        className,
      )}
    >
      {/* Tab bar */}
      <div className="flex border-b border-border/40 bg-muted/30">
        {(["preview", "code"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Preview panel */}
      {tab === "preview" && (
        <div className="flex min-h-32 items-center justify-center p-8">
          <DemoComponent />
        </div>
      )}

      {/* Code panel — stub: shows demo filename */}
      {tab === "code" && (
        <div className="p-4 text-sm text-muted-foreground font-mono">
          {/* TODO: add source display via raw import */}
          {key.replace(/^\.\.\/content\//, "src/docs/content/")}
        </div>
      )}
    </div>
  );
}

export default ComponentPreview;
