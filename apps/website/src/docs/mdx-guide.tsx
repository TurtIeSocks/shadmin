/**
 * MdxGuide — renders a guide MDX file by the docs splat route param.
 *
 * import.meta.glob eagerly loads all .mdx files under ./docs/content/ (incl.
 * nested, e.g. supabase/*). remark-mdx-frontmatter exports the frontmatter as a
 * named export `frontmatter`.
 *
 * When the slug matches a registry item, a shadcn install block is merged in
 * above the prose (install + docs on one page).
 */
import { useParams } from "react-router-dom";
import { InstallCommand } from "./install-command";
import { manifest } from "./manifest";
import { MdxErrorBoundary } from "./mdx-error-boundary";

interface GuideModule {
  default: React.ComponentType;
  frontmatter?: { title?: string; [key: string]: unknown };
}

type GuideMap = Record<string, GuideModule>;

interface MdxGuideProps {
  guides: GuideMap;
}

const itemByName = new Map(manifest.items.map((item) => [item.name, item]));

export function MdxGuide({ guides }: MdxGuideProps) {
  // The docs MDX route is a splat ("*"), so the slug is params["*"], e.g.
  // "array-field" or "supabase/getting-started".
  const slug = useParams()["*"] ?? "";

  // Match by full sub-path — the glob keys look like "./docs/content/x.mdx"
  // or "./docs/content/supabase/x.mdx".
  const entry = Object.entries(guides).find(([key]) =>
    key.replace(/\.mdx$/, "").endsWith(`/${slug}`),
  );
  const mod = entry?.[1];

  if (!mod) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground">
          No guide found for <code className="font-mono">/docs/{slug}</code>.
        </p>
      </div>
    );
  }

  const Content = mod.default;
  const title = mod.frontmatter?.title;
  const item = itemByName.get(slug);

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      {title && (
        <h1 className="text-3xl font-bold tracking-tight mb-6">{title}</h1>
      )}
      {item && (
        <div className="not-prose mb-8">
          <p className="text-sm font-semibold mb-2 text-foreground">
            Installation
          </p>
          <InstallCommand install={item.install} />
        </div>
      )}
      <MdxErrorBoundary resetKey={slug}>
        <Content />
      </MdxErrorBoundary>
    </article>
  );
}
