#!/usr/bin/env node
/**
 * Audit every documented public-API React component (per {@link getPublicComponents}
 * intersected with the docs sidebar) for an import reference somewhere under
 * `apps/demo/src/`.
 *
 * The goal: every public component the project documents should be exercised
 * at least once in the demo app. Catches cases where a component ships but is
 * never shown in context.
 *
 * Run via `pnpm run check-demo-coverage` from the `docs/` workspace.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getPublicComponents } from "./public-api.mjs";
import { buildGroupLookup } from "./component-to-group.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");
const demoRoot = resolve(repoRoot, "apps/demo/src");
const lookup = buildGroupLookup();

function walk(dir) {
  /** @type {string[]} */
  const out = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(e)) out.push(full);
  }
  return out;
}

const allDemoSource = walk(demoRoot)
  .map((f) => readFileSync(f, "utf-8"))
  .join("\n");

const components = await getPublicComponents();
const documented = components.filter((item) => lookup.has(item.slug));

/** @type {string[]} */
const failures = [];

for (const item of documented) {
  // Match word-boundary occurrence of the PascalCase component name.
  // Use a regex so renaming-style false-positives (e.g. `MyTextField`) are
  // avoided.
  const re = new RegExp(`\\b${item.componentName}\\b`);
  if (!re.test(allDemoSource)) {
    failures.push(
      `${item.componentName} (${item.sourceDir}/${item.slug}): not referenced under apps/demo/src/`,
    );
  }
}

if (failures.length) {
  console.error(`\n${failures.length} demo coverage failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(
  `OK: ${documented.length} public components referenced in apps/demo/src/.`,
);
