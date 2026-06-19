import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
// @ts-expect-error — no types for our mjs remark plugins
import { remarkRelativeLinks } from "./scripts/remark-relative-links.mjs";
// @ts-expect-error — no types for our mjs remark plugins
import { remarkCalloutDirective } from "./scripts/remark-callout-directive.mjs";
// @ts-expect-error — no types for our mjs remark plugins
import { remarkCodeMeta } from "./scripts/remark-code-meta.mjs";
// @ts-expect-error — no types for our mjs vite plugin
import { viteInlineChangelog } from "./scripts/vite-inline-changelog.mjs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Inject CHANGELOG.md into changelog.mdx BEFORE mdx compiles it.
    viteInlineChangelog,
    // MDX must run as a `pre` plugin so it transforms .md/.mdx -> JSX BEFORE
    // @vitejs/plugin-react's babel transform (which otherwise tries to parse the
    // raw MDX frontmatter as JS and fails). Array order alone is insufficient in
    // dev — `enforce: "pre"` is required.
    { enforce: "pre", ...mdx({
      providerImportSource: "@/docs/mdx/mdx-components",
      remarkPlugins: [
        // Frontmatter first: parse `---` YAML out of the body + export it as
        // `frontmatter` (so guide routes can render the title) — otherwise the
        // raw `title: ...` leaks as visible body text.
        remarkFrontmatter,
        remarkMdxFrontmatter,
        remarkGfm,
        remarkDirective,
        remarkCodeMeta,
        remarkRelativeLinks,
        remarkCalloutDirective,
      ],
    }) },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    tailwindcss(),
  ],
  root: __dirname,
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
