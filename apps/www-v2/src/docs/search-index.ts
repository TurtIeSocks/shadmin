import { navTree } from "./nav-content";

export interface SearchEntry {
  slug: string;
  title: string;
  section: string;
  description: string;
}

// Descriptions for richer matching — globbed from frontmatter at build time.
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

// Flat, build-time search index over every doc page (title + section + description).
export const searchIndex: SearchEntry[] = navTree.flatMap((section) =>
  section.children
    .filter((c) => c.kind === "leaf")
    .map((leaf) => ({
      slug: leaf.slug,
      title: leaf.title,
      section: section.title,
      description: descBySlug.get(leaf.slug) ?? "",
    })),
);

// Pre-grouped by section for display in the command palette.
export const searchBySection: { section: string; entries: SearchEntry[] }[] =
  navTree
    .map((section) => ({
      section: section.title,
      entries: searchIndex.filter((e) => e.section === section.title),
    }))
    .filter((g) => g.entries.length > 0);
