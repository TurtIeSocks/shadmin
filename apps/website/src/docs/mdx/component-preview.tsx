/**
 * ComponentPreview — live component preview embedded in MDX docs.
 *
 * Usage in MDX:
 *   <ComponentPreview name="components/button/basic" />
 *
 * `name` format: "<component-dir>/<demo-file>" e.g. "components/button/basic"
 * Demos live at: src/docs/content/<component-dir>/demos/<demo-file>.tsx
 * Each demo file must have a default export that is a React component.
 */
import { useState, type ReactNode } from "react";
import { ShikiHighlighter } from "react-shiki";
import { cn } from "shadmin/lib/utils";
import { SHIKI_THEME } from "@/lib/shiki-theme";

// Demo modules + their raw source, globbed from content.
const demoModules = import.meta.glob<{ default: () => ReactNode }>(
  "../content/**/demos/*.tsx",
  { eager: true },
);

const demoSources = import.meta.glob("../content/**/demos/*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

/** Convert name "<component-dir>/<demo>" → glob key */
function keyFor(name: string): string | undefined {
  // name = "components/button/basic" → key = "../content/components/button/demos/basic.tsx"
  const parts = name.split("/");
  const demoFile = parts.pop()!;
  const componentDir = parts.join("/");
  const key = `../content/${componentDir}/demos/${demoFile}.tsx`;
  if (demoModules[key]) return key;
  // Fallback: try matching just the last segment as demo filename
  return Object.keys(demoModules).find((k) =>
    k.endsWith(`/demos/${demoFile}.tsx`),
  );
}

interface ComponentPreviewProps {
  /** Path: "<component-dir>/<demo-file>" e.g. "components/button/basic" */
  name: string;
  /** Optional extra className for the preview wrapper */
  className?: string;
}

export function ComponentPreview({ name, className }: ComponentPreviewProps) {
  const [tab, setTab] = useState<"preview" | "code">("preview");

  const key = keyFor(name);
  if (!key) {
    return (
      <div className="my-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Demo not found: <code className="font-mono">{name}</code>
      </div>
    );
  }

  const DemoComponent = demoModules[key].default;
  const source = demoSources[key] ?? "";

  return (
    <div
      className={cn(
        "not-prose my-6 overflow-hidden rounded-xl border border-border/50",
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

      {/* Code panel — react-shiki syntax highlighted source */}
      {tab === "code" && (
        <div className="overflow-x-auto text-sm">
          <ShikiHighlighter
            language="tsx"
            theme={SHIKI_THEME}
            addDefaultStyles={false}
            className="!bg-transparent p-4"
          >
            {source}
          </ShikiHighlighter>
        </div>
      )}
    </div>
  );
}

export default ComponentPreview;
