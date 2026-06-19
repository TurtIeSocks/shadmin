/**
 * Glass-framed code block wrapping react-shiki.
 * Handles fenced code meta: title, lang, diff.
 */
import { ShikiHighlighter } from "react-shiki";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cn } from "@/lib/utils";

/** Parse meta string: title="foo.ts" lang="json" diff */
function parseCodeMeta(meta: string): {
  title?: string;
  lang?: string;
  diff?: boolean;
} {
  const result: { title?: string; lang?: string; diff?: boolean } = {};
  const titleMatch = /title=["']([^"']+)["']/.exec(meta);
  if (titleMatch) result.title = titleMatch[1];
  const langMatch = /lang=["']([^"']+)["']/.exec(meta);
  if (langMatch) result.lang = langMatch[1];
  if (/\bdiff\b/.test(meta)) result.diff = true;
  return result;
}

interface CodeBlockProps {
  /** Language identifier from fenced code (e.g. "tsx", "diff") */
  language?: string;
  /** Filename chip shown above the code */
  title?: string;
  /** Whether this is a diff block */
  diff?: boolean;
  /** The code string */
  children: string;
  className?: string;
}

const THEME = {
  light: "github-light",
  dark: "github-dark",
} as const;

export function CodeBlock({
  language,
  title,
  diff: _diff,
  children,
  className,
}: CodeBlockProps) {
  const lang = language ?? "text";

  return (
    <div
      className={cn(
        "glass my-4 overflow-hidden rounded-lg border border-border/40",
        className,
      )}
    >
      {title && (
        <div className="flex items-center gap-2 border-b border-border/30 bg-muted/30 px-4 py-2">
          <span className="text-xs text-muted-foreground font-mono">
            {title}
          </span>
        </div>
      )}
      <div className="overflow-x-auto text-sm">
        <ShikiHighlighter
          language={lang}
          theme={THEME}
          addDefaultStyles={false}
          className="!bg-transparent p-4"
        >
          {children}
        </ShikiHighlighter>
      </div>
    </div>
  );
}

// ── Glue: parse MDX's pre/code structure ─────────────────────────────────────

interface PreProps extends ComponentPropsWithoutRef<"pre"> {
  children?: React.ReactNode;
}

type CodeElementProps = {
  className?: string;
  "data-meta"?: string;
  children?: string;
  [key: string]: unknown;
};

/**
 * Replacement for <pre> in MDX. Reads data-meta attr set by remarkCodeMeta.
 */
export function MdxPre({ children, ...rest }: PreProps) {
  // MDX renders: <pre><code className="language-tsx" data-meta="title=...">…</code></pre>
  if (!children || typeof children !== "object") {
    return <pre {...rest}>{children}</pre>;
  }

  const code = children as ReactElement<CodeElementProps>;
  const codeProps: CodeElementProps =
    (code as ReactElement<CodeElementProps>).props ?? {};
  const rawChildren = codeProps["children"];
  const text = typeof rawChildren === "string" ? rawChildren : "";

  // Language from className="language-tsx"
  const className =
    typeof codeProps["className"] === "string" ? codeProps["className"] : "";
  const langMatch = /language-(\S+)/.exec(className);
  const lang = langMatch ? langMatch[1] : undefined;

  // Meta attrs from remarkCodeMeta plugin
  const meta =
    typeof codeProps["data-meta"] === "string" ? codeProps["data-meta"] : "";
  const { title, lang: metaLang, diff } = parseCodeMeta(meta);

  // Trim trailing newline that remark adds
  const codeText = text.replace(/\n$/, "");

  return (
    <CodeBlock language={metaLang ?? lang} title={title} diff={diff}>
      {codeText}
    </CodeBlock>
  );
}

export default CodeBlock;
