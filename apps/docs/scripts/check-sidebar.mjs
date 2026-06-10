#!/usr/bin/env node
/**
 * Fails when a Starlight sidebar entry has no matching content file,
 * or when a content file is not referenced by any sidebar entry.
 *
 * Run via `pnpm check-sidebar` from the `docs/` workspace (or `make check-docs`
 * from the repo root).
 */

import { readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(__dirname, "..");
const contentRoot = resolve(docsRoot, "src/content/docs");

const sidebarModule = await import(
  pathToFileURL(resolve(docsRoot, "sidebar.config.mjs")).href
);
const { sidebar } = sidebarModule;

/**
 * Filesystem slugs (e.g. `install`, `supabase/adminguesser`) for every
 * Markdown/MDX file under `src/content/docs/`, excluding the `images/`
 * assets directory.
 */
function collectContentSlugs() {
  /** @type {Set<string>} */
  const slugs = new Set();
  /** @param {string} dir */
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (entry === "images") continue;
        walk(full);
        continue;
      }
      if (!/\.(md|mdx)$/i.test(entry)) continue;
      const rel = relative(contentRoot, full).replace(/\\/g, "/");
      const slug = rel.replace(/\.(md|mdx)$/i, "").toLowerCase();
      slugs.add(slug);
    }
  }
  walk(contentRoot);
  return slugs;
}

/**
 * Slugs referenced from the sidebar config (strings + object `link` fields),
 * recursing into nested groups. External `http(s)://` links and group headers
 * are skipped.
 */
function collectSidebarSlugs() {
  /** @type {Set<string>} */
  const slugs = new Set();
  /** @param {unknown} item */
  function visit(item) {
    if (typeof item === "string") {
      slugs.add(item.toLowerCase());
      return;
    }
    if (!item || typeof item !== "object") return;
    const obj = /** @type {Record<string, unknown>} */ (item);
    if (typeof obj.link === "string") {
      const link = obj.link;
      if (/^https?:\/\//i.test(link)) return;
      slugs.add(link.toLowerCase().replace(/^\/+/, "").replace(/\/+$/, ""));
      return;
    }
    if (Array.isArray(obj.items)) {
      for (const sub of obj.items) visit(sub);
    }
  }
  for (const top of sidebar) visit(top);
  return slugs;
}

const contentSlugs = collectContentSlugs();
const sidebarSlugs = collectSidebarSlugs();

const orphanFiles = [...contentSlugs]
  .filter((s) => !sidebarSlugs.has(s))
  .sort();
const brokenSidebar = [...sidebarSlugs]
  .filter((s) => !contentSlugs.has(s))
  .sort();

let failed = false;

if (orphanFiles.length > 0) {
  failed = true;
  console.error(
    `\n${orphanFiles.length} content file(s) not referenced in sidebar:`,
  );
  for (const slug of orphanFiles) console.error(`  - ${slug}`);
}

if (brokenSidebar.length > 0) {
  failed = true;
  console.error(
    `\n${brokenSidebar.length} sidebar entr${brokenSidebar.length === 1 ? "y has" : "ies have"} no matching content file:`,
  );
  for (const slug of brokenSidebar) console.error(`  - ${slug}`);
}

if (failed) {
  console.error(
    "\nFix by adding the orphan to docs/sidebar.config.mjs, or removing the stale sidebar entry / content file.",
  );
  process.exit(1);
}

console.log(`OK: ${contentSlugs.size} content files match sidebar entries.`);
