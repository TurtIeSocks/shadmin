import path from "node:path";

/** Which base dir `@/` should resolve against for a given importer. */
export function resolveAtImport(importer, { shadminSrc, wwwSrc }) {
  if (importer && path.resolve(importer).startsWith(path.resolve(shadminSrc))) {
    return shadminSrc;
  }
  return wwwSrc;
}

/**
 * shadmin component groups that www-v2 resolves to SOURCE rather than the
 * package's dist.
 *
 * Two reasons a group lives here:
 *  1. NOT built to dist at all (admin, block-editor, csv-import, leaflet,
 *     mdx-editor, monaco, realtime, rich-text-input, supabase) — shadmin's
 *     wildcard `./components/*` export points at a dist path that doesn't
 *     exist (these groups are excluded from tsconfig.build), so a bare
 *     `shadmin/components/<group>` import would 404. Resolving to source fixes it.
 *  2. `ui` IS in dist, but the admin SOURCE we fold into www-v2 imports ui via
 *     `@/components/ui/*` (→ src, a hard shadcn-registry constraint). If www-v2
 *     code imported ui from dist instead, context-providing primitives
 *     (SidebarProvider, Tooltip, Dialog…) would be TWO different modules with
 *     TWO contexts → "useSidebar must be used within a SidebarProvider". Pinning
 *     ui to src gives one ui module shared across admin source + www-v2 code.
 */
export const SRC_ONLY_COMPONENT_GROUPS = [
  "admin",
  "block-editor",
  "csv-import",
  "leaflet",
  "mdx-editor",
  "monaco",
  "realtime",
  "rich-text-input",
  "supabase",
  "ui",
];

/**
 * Resolve a `shadmin/components/<group>` (bare barrel) or
 * `shadmin/components/<group>/<subpath>` specifier to its source path, but only
 * for the src-only groups. Returns the absolute source path, or null if the
 * specifier isn't a src-only shadmin component import (caller falls through to
 * Vite's default resolution → dist via node_modules).
 */
export function resolveScopedShadmin(source, { shadminSrc }) {
  const m = source.match(/^shadmin\/components\/([^/]+)(?:\/(.*))?$/);
  if (!m) return null;
  const [, group, sub] = m;
  if (!SRC_ONLY_COMPONENT_GROUPS.includes(group)) return null;
  return path.join(shadminSrc, "components", group, sub ?? "");
}

/**
 * Vite plugin: importer-aware `@/` (shadmin src vs www-v2 src) + scoped source
 * aliases for the dist-EXCLUDED shadmin component groups (see
 * SRC_ONLY_COMPONENT_GROUPS). Handles both the bare barrel
 * (`shadmin/components/admin`) and deep paths
 * (`shadmin/components/admin/list/list`). The public API
 * (`shadmin/components/ui/*`, `shadmin/lib/*`) is NOT aliased so it keeps
 * resolving to the built dist via node_modules.
 */
export function shadminSourcePlugin({ shadminSrc, wwwSrc }) {
  return {
    name: "shadmin-source-resolver",
    enforce: "pre",
    async resolveId(source, importer) {
      if (source === "@" || source.startsWith("@/")) {
        const base = resolveAtImport(importer, { shadminSrc, wwwSrc });
        const rest = source === "@" ? "" : source.slice(2);
        return this.resolve(path.join(base, rest), importer, {
          skipSelf: true,
        });
      }
      const scoped = resolveScopedShadmin(source, { shadminSrc });
      if (scoped) {
        return this.resolve(scoped, importer, { skipSelf: true });
      }
      return null;
    },
  };
}
