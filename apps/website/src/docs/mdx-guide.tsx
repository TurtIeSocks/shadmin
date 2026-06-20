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
import { usePageTitle } from "@/hooks/use-page-title";

interface GuideModule {
  default: React.ComponentType;
  frontmatter?: { title?: string; [key: string]: unknown };
}

type GuideMap = Record<string, GuideModule>;

interface MdxGuideProps {
  guides: GuideMap;
}

const itemByName = new Map(manifest.items.map((item) => [item.name, item]));

// Map glob keys ("./docs/content/x.mdx", "./docs/content/supabase/x.mdx") to
// exact slugs ("x", "supabase/x") so lookup can't ambiguously match a basename
// shared by a root and a nested page (e.g. login-page vs supabase/login-page).
// Cached by the guides object identity (stable module-level glob).
let cachedGuides: GuideMap | null = null;
let cachedSlugMap: Map<string, GuideModule> | null = null;
function slugMap(guides: GuideMap): Map<string, GuideModule> {
  if (guides !== cachedGuides || !cachedSlugMap) {
    cachedSlugMap = new Map(
      Object.entries(guides).map(([key, mod]) => [
        key.replace(/^\.\/docs\/content\//, "").replace(/\.mdx$/, ""),
        mod,
      ]),
    );
    cachedGuides = guides;
  }
  return cachedSlugMap;
}

export function MdxGuide({ guides }: MdxGuideProps) {
  // The docs MDX route is a splat ("*"), so the slug is params["*"], e.g.
  // "array-field" or "supabase/getting-started".
  const slug = useParams()["*"] ?? "";

  const mod = slugMap(guides).get(slug);
  const title = mod?.frontmatter?.title;
  usePageTitle(mod ? (title ?? slug) : "Page not found");

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
