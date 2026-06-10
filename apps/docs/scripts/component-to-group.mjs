import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(__dirname, "..");

const sidebarModule = await import(
  pathToFileURL(resolve(docsRoot, "sidebar.config.mjs")).href
);
const { sidebar } = sidebarModule;

/**
 * Build a map of kebab-slug → sidebar group label.
 *
 * The slug key is the trailing path segment (`supabase/login-page` → `login-page`)
 * so that the lookup works for both flat and nested sidebar entries. When two
 * different groups reference the same trailing slug (e.g. Supabase's
 * `login-page` vs. UI & Layout's `login-page`), the first group wins. Callers
 * that need to disambiguate should match on `<sourceDir>/<slug>` instead.
 *
 * @returns {Map<string, string>}
 */
export function buildGroupLookup() {
  const map = new Map();
  for (const group of sidebar) {
    const label = group.label;
    for (const item of group.items ?? []) {
      if (typeof item === "string") {
        const slug = item.split("/").pop();
        if (!map.has(slug)) map.set(slug, label);
      } else if (item?.link && !/^https?:\/\//i.test(item.link)) {
        const cleaned = item.link.replace(/^\/+/, "").replace(/\/+$/, "");
        const slug = cleaned.split("/").pop();
        if (!map.has(slug)) map.set(slug, label);
      }
    }
  }
  return map;
}
