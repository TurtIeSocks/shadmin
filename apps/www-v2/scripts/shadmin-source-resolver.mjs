import path from "node:path";

/** Which base dir `@/` should resolve against for a given importer. */
export function resolveAtImport(importer, { shadminSrc, wwwSrc }) {
  if (importer && path.resolve(importer).startsWith(path.resolve(shadminSrc))) {
    return shadminSrc;
  }
  return wwwSrc;
}

/**
 * Vite plugin: importer-aware `@/` (shadmin src vs www-v2 src) + scoped source
 * aliases for the dist-EXCLUDED parts of shadmin (admin, leaflet). The public
 * API (shadmin/components/ui/*, shadmin/lib/*) is intentionally NOT aliased so
 * it keeps resolving to the built dist via node_modules.
 */
export function shadminSourcePlugin({ shadminSrc, wwwSrc }) {
  const scoped = [
    {
      prefix: "shadmin/components/admin/",
      base: path.join(shadminSrc, "components/admin/"),
    },
    { prefix: "shadmin/leaflet/", base: path.join(shadminSrc, "leaflet/") },
  ];
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
      for (const { prefix, base } of scoped) {
        if (source.startsWith(prefix)) {
          return this.resolve(
            path.join(base, source.slice(prefix.length)),
            importer,
            { skipSelf: true },
          );
        }
      }
      return null;
    },
  };
}
