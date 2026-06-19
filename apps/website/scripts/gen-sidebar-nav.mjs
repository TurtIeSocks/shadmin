/**
 * One-time port aid (Phase 7b): generate `src/docs/sidebar-nav.ts` from the old
 * Astro `apps/docs/sidebar.config.mjs`, using each ported page's frontmatter
 * `title` as the nav label. RA-Enterprise entries are dropped; ra-core entries
 * become external links.
 *
 * NOTE: this depends on `apps/docs/`, which Phase 7c deletes. After 7c,
 * `sidebar-nav.ts` is the hand-maintained source of truth — do not expect this
 * script to run. Kept for reproducibility of the original port.
 *
 *   node scripts/gen-sidebar-nav.mjs > src/docs/sidebar-nav.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CONTENT = resolve(ROOT, "src/docs/content");

const { sidebar } = await import(resolve(ROOT, "../docs/sidebar.config.mjs"));

/** slug -> frontmatter title (faithful labels) */
const titleOf = {};
function scan(dir, prefix = "") {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      scan(resolve(dir, e.name), `${prefix}${e.name}/`);
      continue;
    }
    if (!e.name.endsWith(".mdx")) continue;
    const slug = prefix + e.name.replace(/\.mdx$/, "");
    const raw = readFileSync(resolve(dir, e.name), "utf8");
    const m = raw.match(/^---\s*\n([\s\S]*?)\n---/);
    let title = slug;
    if (m) {
      const t = m[1].match(/^title:\s*"?(.+?)"?\s*$/m);
      if (t) title = t[1];
    }
    titleOf[slug] = title;
  }
}
scan(CONTENT);

const titleCase = (s) =>
  s
    .split("/")
    .pop()
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

const groups = sidebar
  .map((g) => {
    const items = [];
    for (const it of g.items) {
      if (typeof it === "string") {
        if (!(it in titleOf)) continue; // RA-EE drops have no ported file
        items.push({ slug: it, label: titleOf[it] ?? titleCase(it) });
      } else if (it?.attrs && it.attrs.class === "ra-core") {
        items.push({ href: it.link, label: it.label, external: true });
      }
      // enterpriseEntry (attrs.class === "enterprise") -> dropped
    }
    return { label: g.label, items };
  })
  .filter((g) => g.items.length > 0);

const body = `// AUTO-GENERATED (Phase 7b) by scripts/gen-sidebar-nav.mjs from the old Astro
// sidebar.config.mjs. Labels are each page's frontmatter title. RA-Enterprise
// entries dropped; ra-core entries kept as external links.
//
// After Phase 7c deletes apps/docs, edit THIS file directly (the generator can
// no longer run).

export interface DocsNavInternal { slug: string; label: string; external?: false }
export interface DocsNavExternal { href: string; label: string; external: true }
export type DocsNavItem = DocsNavInternal | DocsNavExternal;
export interface DocsNavGroup { label: string; items: DocsNavItem[] }

export const docsNav: DocsNavGroup[] = ${JSON.stringify(groups, null, 2)};
`;
process.stdout.write(body);
console.error(
  `groups: ${groups.length}, items: ${groups.reduce((n, g) => n + g.items.length, 0)}`,
);
