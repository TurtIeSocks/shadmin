import { Link } from "react-router";
import { navTree } from "./nav-content";
import type { DocLeaf } from "./types";

// Docs landing at /docs — an overview that links into each section, so the
// "Docs" nav item resolves to a real page instead of a 404 / "page not found".
export default function DocsIndex() {
  return (
    <article className="prose prose-neutral dark:prose-invert">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Documentation</h1>
      <p className="text-lg text-muted-foreground">
        shadcn-native admin components. Browse a section below, or pick a page
        from the sidebar.
      </p>
      <div className="not-prose mt-8 space-y-6">
        {navTree.map((group) => {
          const leaves = group.children.filter(
            (c): c is DocLeaf => c.kind === "leaf",
          );
          if (leaves.length === 0) return null;
          return (
            <div key={group.dir}>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                {group.title}
              </p>
              <ul className="flex flex-wrap gap-2">
                {leaves.map((leaf) => (
                  <li key={leaf.slug}>
                    <Link
                      to={`/docs/${leaf.slug}`}
                      className="rounded border px-3 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {leaf.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </article>
  );
}
