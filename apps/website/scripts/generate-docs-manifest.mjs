import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CATEGORY_ORDER = [
  "dashboard",
  "layout",
  "fields",
  "inputs",
  "buttons",
  "data-providers",
  "authentication",
  "maps",
  "editor",
  "data-import",
  "theme",
  "style",
  "ui",
  "hooks",
  "library",
  "components",
  "example",
  "misc",
];

const CATEGORY_LABELS = {
  dashboard: "Dashboard",
  layout: "Layout",
  fields: "Fields",
  inputs: "Inputs",
  buttons: "Buttons",
  "data-providers": "Data Providers",
  authentication: "Authentication",
  maps: "Maps",
  editor: "Editor",
  "data-import": "Data Import",
  theme: "Theme",
  style: "Style",
  ui: "UI",
  hooks: "Hooks",
  library: "Library",
  components: "Components",
  example: "Examples",
  misc: "Misc",
};

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
      description: item.description != null ? /** @type {string} */ (item.description) : null,
      type: /** @type {string} */ (item.type ?? "registry:block"),
      category:
        Array.isArray(item.categories) && item.categories.length >= 2
          ? /** @type {string} */ (item.categories[1])
          : "misc",
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
  const registryPath = resolve(__dirname, "../../../packages/shadmin/registry.json");
  const outDir = resolve(__dirname, "../src/docs");
  const outPath = resolve(outDir, "registry-manifest.json");

  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  const manifest = buildManifest(registry);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");

  console.log(
    `Generated ${manifest.items.length} items → ${outPath}`,
  );
  console.log(
    `Nav groups: ${manifest.nav.map((g) => `${g.category}(${g.items.length})`).join(", ")}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
