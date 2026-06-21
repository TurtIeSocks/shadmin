import type { Config } from "@react-router/dev/config";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";

// Enumerate doc slugs from the content tree at build time (node fs — cannot use
// import.meta.glob here; this file runs in node, not the app bundle).
function docSlugs(): string[] {
  const root = join(import.meta.dirname, "src/docs/content");
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".mdx")) {
        const slug = relative(root, p)
          .replace(/\.mdx$/, "")
          .replace(/\/index$/, "")
          .replace(/\\/g, "/");
        out.push(slug);
      }
    }
  };
  walk(root);
  return out;
}

// Top-level content folders → category index pages (/docs/<section>).
function sectionDirs(): string[] {
  const root = join(import.meta.dirname, "src/docs/content");
  return readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

export default {
  appDirectory: "src",
  ssr: false, // SPA mode: no server runtime, static index.html per route + hydrate
  async prerender() {
    return [
      "/",
      "/docs",
      ...sectionDirs().map((d) => `/docs/${d}`),
      ...docSlugs().map((s) => `/docs/${s}`),
    ];
  },
} satisfies Config;
