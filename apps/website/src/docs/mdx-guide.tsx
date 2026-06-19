/**
 * MdxGuide — renders a guide MDX file by :slug route param.
 *
 * import.meta.glob eagerly loads all .mdx files in ./content/.
 * remark-mdx-frontmatter exports frontmatter as a named export `frontmatter`.
 */
import { useParams } from "react-router-dom";

interface GuideModule {
  default: React.ComponentType;
  frontmatter?: { title?: string; [key: string]: unknown };
}

type GuideMap = Record<string, GuideModule>;

interface MdxGuideProps {
  guides: GuideMap;
}

export function MdxGuide({ guides }: MdxGuideProps) {
  const { slug } = useParams<{ slug: string }>();

  // Match by basename — robust to the glob's path prefix (the glob is defined
  // in app.tsx so keys look like "./docs/content/install.mdx").
  const entry = Object.entries(guides).find(
    ([key]) => key.replace(/\.mdx$/, "").endsWith(`/${slug}`),
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

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      {title && (
        <h1 className="text-3xl font-bold tracking-tight mb-6">{title}</h1>
      )}
      <Content />
    </article>
  );
}
