import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { navTree } from "./nav-content";
import { prevNext } from "./nav-sequence";
import type { DocNode } from "./types";

function titleOf(slug: string): string {
  const visit = (nodes: DocNode[]): string | undefined => {
    for (const n of nodes) {
      if (n.kind === "leaf" && n.slug === slug) return n.title;
      if (n.kind === "group") { const t = visit(n.children); if (t) return t; }
    }
    return undefined;
  };
  return visit(navTree) ?? slug.split("/").pop()!;
}

export function PrevNext({ slug }: { slug: string }) {
  const { prev, next } = prevNext(slug, navTree);
  if (!prev && !next) return null;
  const ease = "cubic-bezier(0.32,0.72,0,1)";
  return (
    <nav className="not-prose mt-16 flex items-stretch justify-between gap-4 border-t border-border/60 pt-8">
      {prev ? (
        <Link to={`/docs/${prev}`} className="group flex items-center gap-3 rounded-xl border border-border px-5 py-3 text-left transition-colors hover:bg-muted" style={{ transitionTimingFunction: ease }}>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted transition-transform duration-300 group-hover:-translate-x-0.5" style={{ transitionTimingFunction: ease }}>
            <ArrowLeft className="size-4" />
          </span>
          <span><span className="block text-xs text-muted-foreground">Previous</span><span className="block text-sm font-medium text-foreground">{titleOf(prev)}</span></span>
        </Link>
      ) : <span />}
      {next ? (
        <Link to={`/docs/${next}`} className="group flex items-center gap-3 rounded-xl border border-border px-5 py-3 text-right transition-colors hover:bg-muted" style={{ transitionTimingFunction: ease }}>
          <span><span className="block text-xs text-muted-foreground">Next</span><span className="block text-sm font-medium text-foreground">{titleOf(next)}</span></span>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted transition-transform duration-300 group-hover:translate-x-0.5" style={{ transitionTimingFunction: ease }}>
            <ArrowRight className="size-4" />
          </span>
        </Link>
      ) : <span />}
    </nav>
  );
}
