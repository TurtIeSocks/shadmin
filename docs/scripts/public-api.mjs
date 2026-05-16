import { readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");
const componentsRoot = resolve(repoRoot, "src/components");

const COMPONENT_DIRS = [
  "admin",
  "extras",
  "leaflet",
  "supabase",
  "csv-import",
  "mdx-editor",
  "rich-text-input",
];

/**
 * Parse `export * from "./foo-bar"` lines from an index.ts.
 * Returns an array of relative paths (e.g. `["foo-bar", "nested/bar", ...]`).
 * Supports nested paths so that re-exports like `./shapes/point-field` are
 * picked up alongside flat ones.
 * @param {string} indexPath
 */
function readReexports(indexPath) {
  const src = readFileSync(indexPath, "utf-8");
  /** @type {string[]} */
  const paths = [];
  for (const line of src.split("\n")) {
    const m = line.match(/^export \* from ["']\.\/([\w/-]+)["']/);
    if (m) paths.push(m[1]);
  }
  return paths;
}

/**
 * Resolve a re-export path under `componentsRoot/sourceDir` to an actual
 * source file. Supports `.tsx`, `.ts`, and directory-with-index re-exports
 * (Node resolution: `./form` may mean `./form/index.ts`).
 * @returns {string | null} absolute source file path, or null when no file
 *   can be resolved at this relative path.
 */
function resolveSourceFile(sourceDir, relPath) {
  const base = resolve(componentsRoot, sourceDir, relPath);
  const candidates = [`${base}.tsx`, `${base}.ts`];
  for (const c of candidates) {
    try {
      statSync(c);
      return c;
    } catch {
      // try next
    }
  }
  // Directory with index file
  try {
    if (statSync(base).isDirectory()) {
      for (const idx of ["index.tsx", "index.ts"]) {
        try {
          const p = resolve(base, idx);
          statSync(p);
          return p;
        } catch {
          // try next
        }
      }
    }
  } catch {
    // not a dir
  }
  return null;
}

/**
 * Read top-level named exports from a source file's
 * `export const/function/class/type/interface` declarations.
 * @param {string} filePath
 */
function collectNamedExportsFromFile(filePath) {
  const src = readFileSync(filePath, "utf-8");
  /** @type {string[]} */
  const names = [];
  const re = /^export (?:const|function|class|type|interface) (\w+)/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    names.push(m[1]);
  }
  return names;
}

/**
 * Enumerate every public-API component.
 * Slug is the final path segment (matches flat doc-page slug convention).
 * @returns {Promise<Array<{name: string, slug: string, sourceDir: string, sourceFile: string}>>}
 */
export async function getPublicApi() {
  /** @type {Array<{name: string, slug: string, sourceDir: string, sourceFile: string}>} */
  const items = [];
  for (const dir of COMPONENT_DIRS) {
    const indexPath = resolve(componentsRoot, dir, "index.ts");
    let paths;
    try {
      paths = readReexports(indexPath);
    } catch {
      continue; // skip missing dirs
    }
    for (const relPath of paths) {
      const filePath = resolveSourceFile(dir, relPath);
      if (!filePath) continue;
      const slug = relPath.split("/").pop();
      const names = collectNamedExportsFromFile(filePath);
      for (const name of names) {
        items.push({
          name,
          slug,
          sourceDir: dir,
          sourceFile: filePath,
        });
      }
    }
  }
  const seen = new Set();
  return items.filter((i) => {
    if (seen.has(i.name)) return false;
    seen.add(i.name);
    return true;
  });
}

/**
 * Convert a kebab-case slug to PascalCase.
 * `access-denied` → `AccessDenied`, `lat-lng-field` → `LatLngField`.
 * @param {string} slug
 */
function slugToPascal(slug) {
  return slug
    .split("-")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : ""))
    .join("");
}

/**
 * Subset of {@link getPublicApi} narrowed to *React components*: deduped by
 * slug, one entry per component file, filtered to entries whose source file
 * exports either (a) a binding whose name equals the slug's PascalCase form,
 * or (b) a `<PascalSlug>Props` interface/type alias. The aim is to filter out
 * helper-only files (constants, hooks, type-only modules) so the doc-existence
 * check has one entry per documented React component rather than per named
 * export.
 *
 * Returns ~215-230 components (vs ~650 raw named exports). Each item carries
 * `componentName` (PascalCase from slug) — that's also the name the typedoc
 * splitter writes prop JSON for, so the doc check can look up
 * `props/<componentName>.json` directly.
 *
 * @returns {Promise<Array<{
 *   componentName: string,
 *   slug: string,
 *   sourceDir: string,
 *   sourceFile: string,
 *   hasPropsExport: boolean,
 *   hasComponentExport: boolean,
 * }>>}
 */
export async function getPublicComponents() {
  const items = await getPublicApi();
  /** @type {Map<string, Array<typeof items[number]>>} */
  const bySlug = new Map();
  for (const it of items) {
    const arr = bySlug.get(it.slug);
    if (arr) arr.push(it);
    else bySlug.set(it.slug, [it]);
  }

  /** @type {Array<{ componentName: string, slug: string, sourceDir: string, sourceFile: string, hasPropsExport: boolean, hasComponentExport: boolean }>} */
  const components = [];
  for (const [slug, entries] of bySlug) {
    const pascal = slugToPascal(slug);
    const componentEntry = entries.find((e) => e.name === pascal);
    const propsEntry = entries.find((e) => e.name === `${pascal}Props`);
    if (!componentEntry && !propsEntry) continue;
    const ref = componentEntry ?? propsEntry;
    if (!ref) continue;
    components.push({
      componentName: pascal,
      slug,
      sourceDir: ref.sourceDir,
      sourceFile: ref.sourceFile,
      hasPropsExport: Boolean(propsEntry),
      hasComponentExport: Boolean(componentEntry),
    });
  }
  return components;
}

// CLI invocation: print as JSON for ad-hoc inspection
if (import.meta.url === `file://${process.argv[1]}`) {
  const items = await getPublicApi();
  console.log(JSON.stringify(items, null, 2));
  console.log(`\nTotal: ${items.length}`);
}
