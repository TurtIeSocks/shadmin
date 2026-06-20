// Build-time glob wiring (import.meta.glob — Vite only, not node:test).
// Kept separate from nav.ts so pure buildNavTree is testable with node --test.
import type { MetaEntry } from "./types";
import { buildNavTree } from "./nav";

// Eager-glob frontmatter (cheap) for titles; lazy-glob page modules.
const metaModules = import.meta.glob<{ default: MetaEntry[] }>("./content/**/_meta.ts", { eager: true });
const pageModules = import.meta.glob<{ frontmatter?: { title?: string } }>("./content/**/*.mdx", { eager: true });

function toSlug(key: string) {
  return key.replace(/^\.\/content\//, "").replace(/\.mdx$/, "").replace(/\/index$/, "");
}
function toDir(key: string) {
  return key.replace(/^\.\/content\//, "").replace(/\/_meta\.ts$/, "").replace(/^_meta\.ts$/, "");
}

export const docSlugs: string[] = Object.keys(pageModules).map(toSlug);

const collectedMetas: Record<string, MetaEntry[]> = {};
for (const [key, mod] of Object.entries(metaModules)) collectedMetas[toDir(key)] = mod.default;

const titleBySlug = new Map(
  Object.entries(pageModules).map(([k, m]) => [toSlug(k), m.frontmatter?.title]),
);

export { buildNavTree };

export const navTree = buildNavTree(docSlugs, collectedMetas, (slug) =>
  titleBySlug.get(slug) ?? slug.split("/").pop()!,
);
