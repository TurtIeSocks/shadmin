#!/usr/bin/env node
/**
 * Audit every public-API React component (per {@link getPublicComponents}) for
 * a sibling Storybook story file under `packages/admin-kit/src/components/<sourceDir>/<slug>.stories.tsx`
 * (colocated next to the component and its spec).
 *
 * Fails (exit 1) when any documented component is missing its story file, still
 * uses the deprecated `CoverageStory` placeholder, lacks an `export const Basic`,
 * is under 30 lines (likely a thin stub), or has a Storybook `title:` that does
 * not match the docs sidebar group prefix (e.g. `Data Display/AccessDenied`).
 *
 * Run via `pnpm run check-stories` from the `docs/` workspace.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getPublicComponents } from "./public-api.mjs";
import { buildGroupLookup } from "./component-to-group.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");
const lookup = buildGroupLookup();

const components = await getPublicComponents();
/** @type {string[]} */
const failures = [];

// Intersect with sidebar so only documented components require a story.
// Internal infrastructure (Context, Provider, helper exports) is intentionally
// skipped — matches the convention established by check-docs.mjs.
const documented = components.filter((item) => lookup.has(item.slug));

for (const item of documented) {
  const storyPath = resolve(
    repoRoot,
    `packages/admin-kit/src/components/${item.sourceDir}/${item.slug}.stories.tsx`,
  );
  if (!existsSync(storyPath)) {
    failures.push(
      `${item.componentName} (${item.sourceDir}/${item.slug}): missing story file`,
    );
    continue;
  }
  const body = readFileSync(storyPath, "utf-8");

  if (body.includes("CoverageStory") || body.includes("_coverage-story")) {
    failures.push(
      `${item.componentName} (${item.sourceDir}/${item.slug}): still imports CoverageStory placeholder`,
    );
  }
  if (!/export const Basic/.test(body)) {
    failures.push(
      `${item.componentName} (${item.sourceDir}/${item.slug}): missing 'export const Basic'`,
    );
  }
  if (body.split("\n").length < 30) {
    failures.push(
      `${item.componentName} (${item.sourceDir}/${item.slug}): story file < 30 lines (likely thin)`,
    );
  }
  const expectedGroup = lookup.get(item.slug);
  if (expectedGroup) {
    // Scope to the `export default {…}` block so seed records that happen
    // to have a `title` field (e.g. fake calendar events) don't get
    // mistaken for the Storybook default-export title. Handles both
    // single-line (`export default { title: "X" };`) and multi-line forms.
    const defaultExportBlock = body.match(/export default \{[\s\S]*?\}/)?.[0];
    const titleMatch = defaultExportBlock?.match(/title:\s*['"]([^'"]+)['"]/);
    if (!titleMatch || !titleMatch[1].startsWith(`${expectedGroup}/`)) {
      failures.push(
        `${item.componentName} (${item.sourceDir}/${item.slug}): title prefix doesn't match sidebar group '${expectedGroup}'`,
      );
    }
  }
}

if (failures.length) {
  console.error(`\n${failures.length} story check failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`OK: ${documented.length} stories pass checks.`);
