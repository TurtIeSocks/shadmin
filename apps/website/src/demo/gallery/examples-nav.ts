/**
 * examples-nav.ts — glob-based example discovery + coverage radar wiring.
 *
 * exampleModules: lazy component imports, keyed by glob path
 * exampleRawSources: eager ?raw source strings, keyed by glob path
 * exampleSlugs: derived string slugs (e.g. "viewing/text-field")
 * componentDocSlugs: canonical list from the component-category docs
 */

import type { ReactNode } from "react";
import { navTree } from "@/docs/nav-content";
import type { DocGroup, DocNode } from "@/docs/types";

// Lazy component modules — loaded on demand per gallery route.
export const exampleModules = import.meta.glob<{
  default: () => ReactNode;
}>("./examples/**/*.tsx", { eager: false });

// Eager raw source — available immediately for Show-code tab.
export const exampleRawSources = import.meta.glob("./examples/**/*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

/** Strip ./examples/ prefix + .tsx suffix → canonical slug */
function toSlug(key: string): string {
  return key.replace(/^\.\/examples\//, "").replace(/\.tsx$/, "");
}

/** Glob key for a given slug */
export function slugToKey(slug: string): string {
  return `./examples/${slug}.tsx`;
}

/** All example slugs discovered via glob. */
export const exampleSlugs: string[] = Object.keys(exampleModules).map(toSlug);

// ── Component-category doc slugs (the canonical "should-exist" set) ───────────

// Component categories per the brief (viewing, editing, page-components,
// ui-layout, widgets) — derived from the docs navTree so coverage radar
// stays in sync with docs structure without a manual list.
const COMPONENT_CATEGORIES = new Set([
  "viewing",
  "editing",
  "page-components",
  "ui-layout",
  "widgets",
]);

/**
 * The gallery nav is intentionally 2-tier (category → component). The docs split
 * some components (List, Edit, DataTable, SimpleForm) into multiple sub-pages
 * for prose length — but those all render ~the same live component, so the
 * gallery shows ONE example per component instead. Flatten any split-page group
 * to a single leaf (slug = the group's dir, e.g. "page-components/list"); the
 * "View docs →" link still points at the full written breakdown.
 */
function flattenChild(node: DocNode): DocNode {
  return node.kind === "leaf"
    ? node
    : { kind: "leaf", slug: node.dir, title: node.title };
}

export const galleryNav: DocGroup[] = navTree
  .filter((section) => COMPONENT_CATEGORIES.has(section.dir))
  .map((section) => ({
    ...section,
    children: section.children.map(flattenChild),
  }));

/** Flattened component slugs (one per component) — the coverage radar baseline. */
export const componentDocSlugs: string[] = galleryNav.flatMap((section) =>
  section.children.map((c) => (c.kind === "leaf" ? c.slug : c.dir)),
);
