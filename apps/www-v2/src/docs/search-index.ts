import { FEATURES } from "@/demo/features/features-nav";
import { navTree } from "./nav-content";

export interface SearchEntry {
  title: string;
  /** Group label shown on the right of a result row. */
  section: string;
  /** Full destination href. */
  path: string;
  description: string;
}

// Descriptions for richer matching — globbed from frontmatter at build time.
const frontmatter = import.meta.glob<{
  frontmatter?: { description?: string };
}>("./content/**/*.mdx", { eager: true });
const descBySlug = new Map<string, string>();
for (const [key, mod] of Object.entries(frontmatter)) {
  const slug = key
    .replace(/^\.\/content\//, "")
    .replace(/\.mdx$/, "")
    .replace(/\/index$/, "");
  descBySlug.set(slug, mod.frontmatter?.description ?? "");
}

// Docs pages — every leaf in the nav tree → /docs/<slug>.
const docsEntries: SearchEntry[] = navTree.flatMap((section) =>
  section.children
    .filter((c) => c.kind === "leaf")
    .map((leaf) => ({
      title: leaf.title,
      section: section.title,
      path: `/docs/${leaf.slug}`,
      description: descBySlug.get(leaf.slug) ?? "",
    })),
);

// Demo App zone. Hardcoded (importing the resources registry would pull every
// CRUD page component into the docs bundle); keep in sync with demoResources.
const DEMO_APP: { name: string; label: string }[] = [
  { name: "customers", label: "Customers" },
  { name: "categories", label: "Categories" },
  { name: "products", label: "Products" },
  { name: "orders", label: "Orders" },
  { name: "reviews", label: "Reviews" },
  { name: "tags", label: "Tags" },
];
const appEntries: SearchEntry[] = [
  {
    title: "Dashboard",
    section: "Demo · App",
    path: "/demo/app",
    description: "Live demo dashboard — revenue, orders, customers, reviews.",
  },
  ...DEMO_APP.map((r) => ({
    title: r.label,
    section: "Demo · App",
    path: `/demo/app/${r.name}`,
    description: `Browse and manage ${r.label.toLowerCase()} in the live demo.`,
  })),
];

// Demo Features zone — from the lightweight features registry.
const featureEntries: SearchEntry[] = FEATURES.map((f) => ({
  title: f.title,
  section: "Demo · Features",
  path: `/demo/features/${f.slug}`,
  description: f.blurb,
}));

/**
 * Unified, build-time site search index: every docs page plus the demo's App
 * and Features zones. (Gallery components are intentionally omitted — they
 * mirror the docs pages 1:1, which already carry a "View live" link.)
 */
export const searchIndex: SearchEntry[] = [
  ...docsEntries,
  ...appEntries,
  ...featureEntries,
];
