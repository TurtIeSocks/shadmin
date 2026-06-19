import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
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
    // MDX must come before React plugin
    mdx({
      providerImportSource: "@/docs/mdx/mdx-components",
      remarkPlugins: [
        remarkGfm,
        remarkDirective,
        remarkCodeMeta,
        remarkRelativeLinks,
        remarkCalloutDirective,
      ],
    }),
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    tailwindcss(),
    viteInlineChangelog,
  ],
  root: __dirname,
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
