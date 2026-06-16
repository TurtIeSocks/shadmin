import { readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentRoot = resolve(__dirname, "../src/content/docs");

// Compound abbreviations whose default PascalCase → kebab split is wrong.
// Map source PascalCase → desired kebab string.
const ABBREVIATION_OVERRIDES = {
  BBox: "bbox",
  GeoJson: "geojson",
};

function pascalToKebab(name) {
  let s = name;
  for (const [pascal, kebab] of Object.entries(ABBREVIATION_OVERRIDES)) {
    s = s.replace(new RegExp(pascal, "g"), kebab);
  }
  return s
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

const SKIP_BASENAMES = new Set([
  "changelog",
  "guides-and-concepts",
  "quick-start-guide",
  "migrating-from-ra-ui-materialui",
  "data-display",
  "data-edition",
  "mcp",
]);

const renames = [];

function walk(dir, prefix = "") {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "images") continue;
      walk(full, `${prefix + entry}/`);
      continue;
    }
    const m = entry.match(/^(.+)\.(md|mdx)$/i);
    if (!m) continue;
    const [, base, ext] = m;
    const kebab = pascalToKebab(base);
    if (SKIP_BASENAMES.has(kebab)) continue;
    if (kebab !== base) {
      renames.push({
        from: prefix + entry,
        to: `${prefix + kebab}.${ext.toLowerCase()}`,
      });
    }
  }
}

walk(contentRoot);

console.log(JSON.stringify(renames, null, 2));
console.error(`Total renames: ${renames.length}`);
