import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Catalog taxonomy mirrors the component directory tree, with admin's subdirs
// flattened to top level (see deriveCategory). Order: admin core → admin facets
// → standalone feature packages → primitives/libs → misc.
const CATEGORY_ORDER = [
  "admin",
  "layout",
  "list",
  "views",
  "fields",
  "inputs",
  "form",
  "buttons",
  "feedback",
  "auth",
  "guessers",
  "inspector",
  "widgets",
  "collaboration",
  "common",
  "leaflet",
  "block-editor",
  "rich-text-input",
  "mdx-editor",
  "monaco",
  "csv-import",
  "realtime",
  "supabase",
  "ui",
  "library",
  "hooks",
  "theme",
  "style",
  "example",
  "misc",
];

const CATEGORY_LABELS = {
  admin: "Admin Core",
  layout: "Layout",
  list: "List",
  views: "Views",
  fields: "Fields",
  inputs: "Inputs",
  form: "Form",
  buttons: "Buttons",
  feedback: "Feedback",
  auth: "Auth",
  guessers: "Guessers",
  inspector: "Inspector",
  widgets: "Widgets",
  collaboration: "Collaboration",
  common: "Common",
  leaflet: "Leaflet / Maps",
  "block-editor": "Block Editor",
  "rich-text-input": "Rich Text",
  "mdx-editor": "MDX Editor",
  monaco: "Monaco",
  "csv-import": "CSV Import",
  realtime: "Realtime",
  supabase: "Supabase",
  ui: "UI Primitives",
  library: "Library",
  hooks: "Hooks",
  theme: "Themes",
  style: "Styles",
  example: "Examples",
  misc: "Misc",
};

// Derive the docs category from an item's source directory, flattening admin's
// subdirs to top level (admin/fields/* → "fields") so the catalog mirrors the
// component tree. Non-component items (libs, hooks, themes, base styles) fall
// back to their registry categories[1].
function deriveCategory(item) {
  const files = Array.isArray(item.files) ? item.files : [];
  const comp = files
    .map((f) => (typeof f === "string" ? f : f?.path))
    .find((p) => p && p.includes("src/components/"));
  if (comp) {
    const m = comp.match(/src\/components\/([^/]+)(?:\/([^/]+))?/);
    if (m) {
      const [, top, rest] = m;
      if (top === "admin") {
        return rest && !/\.(tsx?|css)$/.test(rest) ? rest : "admin";
      }
      return top;
    }
  }
  return Array.isArray(item.categories) && item.categories.length >= 2
    ? item.categories[1]
    : "misc";
}

/**
 * Pure transform — no I/O.
 * @param {{ items: Array<Record<string, unknown>> }} registry
 * @returns {import('./types').DocsManifest}
 */
export function buildManifest(registry) {
  const items = registry.items.map((item) => {
    const name = /** @type {string} */ (item.name);
    const base = `@shadmin/${name}`;
    return {
      name,
      title: /** @type {string} */ (item.title ?? name),
      description:
        item.description != null
          ? /** @type {string} */ (item.description)
          : null,
      type: /** @type {string} */ (item.type ?? "registry:block"),
      category: deriveCategory(item),
      docs: item.docs != null ? /** @type {string} */ (item.docs) : null,
      install: {
        npm: `npx shadcn@latest add ${base}`,
        pnpm: `pnpm dlx shadcn@latest add ${base}`,
        yarn: `yarn dlx shadcn@latest add ${base}`,
        bun: `bunx shadcn@latest add ${base}`,
      },
    };
  });

  // Build nav groups
  const grouped = new Map();
  for (const item of items) {
    const cat = item.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat).push({ name: item.name, title: item.title });
  }

  // Sort categories: curated order first, unknowns at end alpha
  const knownSet = new Set(CATEGORY_ORDER);
  const unknownCats = [...grouped.keys()]
    .filter((c) => !knownSet.has(c))
    .sort();
  const orderedCats = [...CATEGORY_ORDER, ...unknownCats].filter((c) =>
    grouped.has(c),
  );

  const nav = orderedCats.map((category) => {
    const catItems = grouped.get(category);
    catItems.sort((a, b) => a.title.localeCompare(b.title));
    return {
      category,
      label: CATEGORY_LABELS[category] ?? category,
      items: catItems,
    };
  });

  return {
    generatedAt: null,
    items,
    nav,
  };
}

async function main() {
  const registryPath = resolve(
    __dirname,
    "../../../packages/shadmin/registry.json",
  );
  const outDir = resolve(__dirname, "../src/docs");
  const outPath = resolve(outDir, "registry-manifest.json");

  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  const manifest = buildManifest(registry);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");

  console.log(`Generated ${manifest.items.length} items → ${outPath}`);
  console.log(
    `Nav groups: ${manifest.nav.map((g) => `${g.category}(${g.items.length})`).join(", ")}`,
  );
}

// Only run when invoked directly (so importing buildManifest has no side effects).
const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
