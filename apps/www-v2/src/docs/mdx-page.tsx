import type { ComponentType } from "react";
import { useParams } from "react-router";
import { installFor } from "./registry";
import { InstallCommand } from "./mdx/install-command";

interface GuideModule {
  default: ComponentType;
  frontmatter?: { title?: string; description?: string };
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

export default function MdxPage() {
  const slug = (useParams()["*"] ?? "").replace(/\/+$/, "");
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
  const install = installFor(slug);
  const Content = mod.default;
  return (
    <article className="prose prose-neutral dark:prose-invert">
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
