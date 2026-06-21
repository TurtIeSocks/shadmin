import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "shadmin/components/ui/breadcrumb";
import { fallbackIcon, SECTION_META } from "./section-meta";
import type { DocGroup, DocLeaf } from "./types";

// Page descriptions for the cards (from frontmatter).
const frontmatter = import.meta.glob<{ frontmatter?: { description?: string } }>(
  "./content/**/*.mdx",
  { eager: true },
);
const descBySlug = new Map<string, string>();
for (const [key, mod] of Object.entries(frontmatter)) {
  const slug = key
    .replace(/^\.\/content\//, "")
    .replace(/\.mdx$/, "")
    .replace(/\/index$/, "");
  descBySlug.set(slug, mod.frontmatter?.description ?? "");
}

const ease = "cubic-bezier(0.32,0.72,0,1)";

// Landing page for a section — reached from the /docs cards / breadcrumb.
export function CategoryIndex({ section }: { section: DocGroup }) {
  const meta = SECTION_META[section.dir];
  const Icon = meta?.icon ?? fallbackIcon;
  const leaves = section.children.filter((c): c is DocLeaf => c.kind === "leaf");

  return (
    <div className="not-prose">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/docs">Docs</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{section.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-foreground">
          <Icon className="size-5" strokeWidth={1.5} />
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {section.title}
        </h1>
      </div>
      {meta?.blurb && (
        <p className="mt-3 max-w-lg text-muted-foreground">{meta.blurb}</p>
      )}

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {leaves.map((leaf, i) => {
          const desc = descBySlug.get(leaf.slug);
          return (
            <Link
              key={leaf.slug}
              to={`/docs/${leaf.slug}`}
              className="group block rounded-xl border border-border/60 bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:bg-muted/40"
              style={{
                transitionTimingFunction: ease,
                animation: `docs-rise 0.5s ${ease} both`,
                animationDelay: `${Math.min(i, 12) * 30}ms`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{leaf.title}</span>
                <ArrowUpRight
                  className="ml-auto size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                  strokeWidth={1.5}
                  style={{ transitionTimingFunction: ease }}
                />
              </div>
              {desc && (
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                  {desc}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
