import { Fragment, type ComponentType } from "react";
import { Link, Navigate, useParams } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "shadmin/components/ui/breadcrumb";
import { CategoryIndex } from "./category-index";
import { navTree } from "./nav-content";
import { findGroup } from "./nav-sequence";
import { installFor } from "./registry";
import { InstallCommand } from "./mdx/install-command";

interface GuideModule {
  default: ComponentType;
  frontmatter?: { title?: string; description?: string; registry?: string };
}
const guides = import.meta.glob<GuideModule>("./content/**/*.mdx", {
  eager: true,
});

const bySlug = new Map(
  Object.entries(guides).map(([k, m]) => [
    k
      .replace(/^\.\/content\//, "")
      .replace(/\.mdx$/, "")
      .replace(/\/index$/, ""),
    m,
  ]),
);

function titleForLeaf(slug: string): string | undefined {
  // walk the tree for a leaf with this slug
  const visit = (nodes: (typeof navTree)[number]["children"]): string | undefined => {
    for (const n of nodes) {
      if (n.kind === "leaf" && n.slug === slug) return n.title;
      if (n.kind === "group") { const t = visit(n.children); if (t) return t; }
    }
    return undefined;
  };
  for (const sec of navTree) { if (sec.dir === slug.split("/")[0]) { const t = visit(sec.children); if (t) return t; } }
  return undefined;
}

export default function MdxPage() {
  const slug = (useParams()["*"] ?? "").replace(/\/+$/, "");

  // A bare section slug (e.g. /docs/viewing) renders that category's index.
  const section = navTree.find((g) => g.dir === slug);
  if (section) return <CategoryIndex section={section} />;

  // A bare split-page group URL (e.g. /docs/page-components/edit) redirects to its index.
  const group = findGroup(navTree, slug);
  if (group?.indexSlug) return <Navigate to={`/docs/${group.indexSlug}`} replace />;

  const mod = bySlug.get(slug);
  if (!mod) {
    return (
      <div className="py-12">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">
          No doc for <code>/docs/{slug}</code>.
        </p>
      </div>
    );
  }
  const title = mod.frontmatter?.title;
  const description = mod.frontmatter?.description;
  const install = installFor(mod.frontmatter?.registry);
  const Content = mod.default;
  const parts = slug.split("/");
  const crumbs = parts.slice(0, -1).map((_, i) => {
    const dir = parts.slice(0, i + 1).join("/");
    if (i === 0) {
      const sec = navTree.find((g) => g.dir === dir);
      return sec ? { to: `/docs/${dir}`, label: sec.title } : null;
    }
    const g = findGroup(navTree, dir);
    return g?.indexSlug ? { to: `/docs/${g.indexSlug}`, label: g.title } : null;
  }).filter(Boolean) as { to: string; label: string }[];
  const leafTitle = title ?? titleForLeaf(slug);
  return (
    <article className="prose prose-neutral dark:prose-invert">
      <Breadcrumb className="not-prose mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/docs">Docs</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {crumbs.map((crumb) => (
            <Fragment key={crumb.to}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={crumb.to}>{crumb.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}
          {leafTitle && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{leafTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      {title && (
        <h1 className="mb-2 text-3xl font-bold tracking-tight">{title}</h1>
      )}
      {description && (
        <p className="mb-6 text-lg text-muted-foreground">{description}</p>
      )}
      {install && (
        <div className="not-prose mb-8">
          <p className="mb-2 text-sm font-semibold">Installation</p>
          <InstallCommand install={install} />
        </div>
      )}
      <Content />
    </article>
  );
}
