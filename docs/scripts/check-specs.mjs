#!/usr/bin/env node
/**
 * Audit every documented public-API React component (per {@link getPublicComponents}
 * intersected with the docs sidebar — matches the precedent of check-docs and
 * check-stories) for a sibling spec file under
 * `src/components/<sourceDir>/<slug>.spec.tsx`.
 *
 * Fails (exit 1) when any documented component is missing its spec file, still
 * contains the placeholder `expect(true).toBe(true)` pattern, or does not import
 * from the colocated sibling stories file `./<slug>.stories`.
 *
 * Run via `pnpm run check-specs` from the `docs/` workspace.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getPublicComponents } from "./public-api.mjs";
import { buildGroupLookup } from "./component-to-group.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");
const lookup = buildGroupLookup();

const components = await getPublicComponents();
const documented = components.filter((item) => lookup.has(item.slug));

/** @type {string[]} */
const failures = [];

for (const item of documented) {
  const specPath = resolve(
    repoRoot,
    `src/components/${item.sourceDir}/${item.slug}.spec.tsx`,
  );
  if (!existsSync(specPath)) {
    failures.push(
      `${item.componentName} (${item.sourceDir}/${item.slug}): missing spec file`,
    );
    continue;
  }
  const body = readFileSync(specPath, "utf-8");

  if (body.includes("expect(true).toBe(true)")) {
    failures.push(
      `${item.componentName} (${item.sourceDir}/${item.slug}): contains tautological expect(true).toBe(true)`,
    );
  }
  const importsStory =
    body.includes(`./${item.slug}.stories`) ||
    body.includes(`@/components/${item.sourceDir}/${item.slug}.stories`);
  if (!importsStory) {
    failures.push(
      `${item.componentName} (${item.sourceDir}/${item.slug}): does not import from colocated stories file`,
    );
  }
}

if (failures.length) {
  console.error(`\n${failures.length} spec check failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`OK: ${documented.length} specs pass checks.`);
