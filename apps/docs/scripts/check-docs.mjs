#!/usr/bin/env node
/**
 * Audit every public-API React component that appears in the docs sidebar.
 *
 * Fails (exit 1) when any documented component is missing its doc page,
 * `## Usage` heading, a `## Props` section / <PropsTable> (when the component
 * has props), at least one fenced code block, or contains a placeholder token
 * (`TODO`, `Coming soon`, `Lorem ipsum`, `FIXME`).
 *
 * Filtering rule: a component counts as "documented" when
 *   (a) it appears in {@link getPublicComponents} (re-exported from a kit
 *       package index.ts AND has a corresponding `<Name>` or `<Name>Props`
 *       export), AND
 *   (b) the docs sidebar references it by slug (or `<sourceDir>/<slug>`).
 * Public-API components that aren't in the sidebar are *intentionally*
 * undocumented (internal helpers, theme objects, guessers covered in their
 * parent page) and are skipped here. The sidebar is the authoring contract;
 * `check-sidebar.mjs` separately enforces sidebar↔content-file parity.
 *
 * Looks up doc pages at:
 *   docs/src/content/docs/<slug>.md(x)               (flat layout, most pages)
 *   docs/src/content/docs/<sourceDir>/<slug>.md(x)   (e.g. `supabase/<slug>`)
 *
 * Run via `pnpm run check-docs` from the `docs/` workspace.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getPublicComponents } from "./public-api.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(__dirname, "..");
const contentRoot = resolve(docsRoot, "src/content/docs");
const propsRoot = resolve(contentRoot, "props");

const PLACEHOLDER_TOKENS = ["TODO", "Coming soon", "Lorem ipsum", "FIXME"];

/**
 * Collect every slug referenced from the docs sidebar — string items, nested
 * object `link` fields, and external links (which we skip). Matches the
 * shape of `check-sidebar.mjs::collectSidebarSlugs` so the two scripts agree
 * on what "in the sidebar" means.
 */
async function collectSidebarSlugs() {
  const sidebarModule = await import(
    pathToFileURL(resolve(docsRoot, "sidebar.config.mjs")).href
  );
  const { sidebar } = sidebarModule;
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

const sidebarSlugs = await collectSidebarSlugs();
const allComponents = await getPublicComponents();
const components = allComponents.filter(
  (c) =>
    sidebarSlugs.has(c.slug) || sidebarSlugs.has(`${c.sourceDir}/${c.slug}`),
);

/** @type {Array<{ component: typeof components[number], failure: string }>} */
const failures = [];

for (const c of components) {
  // Resolve the doc page: try the flat slug first, then `<sourceDir>/<slug>`
  // for the few directories (supabase) that nest their docs.
  const candidates = [
    resolve(contentRoot, `${c.slug}.md`),
    resolve(contentRoot, `${c.slug}.mdx`),
    resolve(contentRoot, c.sourceDir, `${c.slug}.md`),
    resolve(contentRoot, c.sourceDir, `${c.slug}.mdx`),
  ];
  const path = candidates.find((p) => existsSync(p));

  if (!path) {
    failures.push({
      component: c,
      failure: `missing doc page (expected ${c.slug}.md or .mdx)`,
    });
    continue;
  }

  const body = readFileSync(path, "utf-8");

  if (!/^## Usage/m.test(body)) {
    failures.push({ component: c, failure: "missing '## Usage' heading" });
  }

  const propsPath = resolve(propsRoot, `${c.componentName}.json`);
  let propCount = 0;
  if (existsSync(propsPath)) {
    propCount = JSON.parse(readFileSync(propsPath, "utf-8")).props.length;
  }

  const hasPropsSection =
    /^## Props/m.test(body) || body.includes("<PropsTable");
  if (propCount > 0 && !hasPropsSection) {
    failures.push({
      component: c,
      failure: `has ${propCount} props but no '## Props' or <PropsTable>`,
    });
  }

  if (!/```[a-z]*\n/.test(body)) {
    failures.push({ component: c, failure: "no fenced code block" });
  }

  for (const token of PLACEHOLDER_TOKENS) {
    if (body.includes(token)) {
      failures.push({
        component: c,
        failure: `contains placeholder token '${token}'`,
      });
    }
  }
}

if (failures.length) {
  console.error(`\n${failures.length} doc check failure(s):`);
  for (const { component, failure } of failures) {
    console.error(
      `  - [${component.sourceDir}] ${component.componentName} (${component.slug}): ${failure}`,
    );
  }
  process.exit(1);
}

console.log(`OK: ${components.length} components pass doc checks.`);
