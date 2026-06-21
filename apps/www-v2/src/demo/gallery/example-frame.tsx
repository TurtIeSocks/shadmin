/**
 * ExampleFrame — preview + show-code frame for gallery examples.
 * Mirrors the ComponentPreview look from docs/mdx/component-preview.tsx.
 */
import { Suspense, type ReactNode } from "react";
import { Link } from "react-router";
import { ShikiHighlighter } from "react-shiki";
import { cn } from "shadmin/lib/utils";
import { Tabs, TabItem } from "@/docs/mdx/tabs";

interface ExampleFrameProps {
  /** The slug, e.g. "viewing/text-field" */
  slug: string;
  /** Lazily-resolved component (already resolved via lazy import) */
  component: ReactNode;
  /** Raw source string for the code tab */
  source: string;
  /** Optional title override; defaults to last slug segment titleized */
  title?: string;
  className?: string;
}

function titleize(s: string): string {
  return s
    .split("/")
    .pop()!
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ExampleFrame({
  slug,
  component,
  source,
  title,
  className,
}: ExampleFrameProps) {
  const displayTitle = title ?? titleize(slug);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{displayTitle}</h2>
        <Link
          to={`/docs/${slug}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View docs →
        </Link>
      </div>

      {/* Preview + code tabs — same outer shell as ComponentPreview */}
      <div
        className={cn(
          "not-prose overflow-hidden rounded-xl border border-border/50",
        )}
      >
        <Tabs>
          <TabItem label="Preview">
            <div className="flex min-h-32 items-center justify-center p-8">
              <Suspense
                fallback={
                  <div className="text-sm text-muted-foreground">Loading…</div>
                }
              >
                {component}
              </Suspense>
            </div>
          </TabItem>
          <TabItem label="Code">
            <div className="overflow-x-auto text-sm">
              <ShikiHighlighter
                language="tsx"
                theme={{ light: "github-light", dark: "github-dark" }}
                addDefaultStyles={false}
                className="!bg-transparent p-4"
              >
                {source}
              </ShikiHighlighter>
            </div>
          </TabItem>
        </Tabs>
      </div>
    </div>
  );
}
