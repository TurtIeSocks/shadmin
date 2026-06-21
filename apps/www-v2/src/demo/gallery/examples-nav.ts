/**
 * examples-nav.ts — glob-based example discovery + coverage radar wiring.
 *
 * exampleModules: lazy component imports, keyed by glob path
 * exampleRawSources: eager ?raw source strings, keyed by glob path
 * exampleSlugs: derived string slugs (e.g. "viewing/text-field")
 * componentDocSlugs: canonical list from the component-category docs
 */

import type { ReactNode } from "react";

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

// Import nav data at module level (Vite-side only).
// docSlugs is already filtered (no intro pages).
import { docSlugs } from "@/docs/nav-content";

/** Docs slugs belonging to component categories — the radar baseline. */
export const componentDocSlugs: string[] = docSlugs.filter((s) =>
  COMPONENT_CATEGORIES.has(s.split("/")[0]),
);
