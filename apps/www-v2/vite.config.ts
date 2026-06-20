import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { remarkRelativeLinks } from "./scripts/remark-relative-links.mjs";
import { remarkCalloutDirective } from "./scripts/remark-callout-directive.mjs";
import { remarkCodeMeta } from "./scripts/remark-code-meta.mjs";

export default defineConfig({
  // +100 from vite's default so it doesn't collide with a user-run server on 5173.
  server: { port: 5273 },
  optimizeDeps: {
    // Pre-bundle react-shiki together with React so it shares the single
    // optimized React chunk instead of inlining its own copy (which would null
    // out the hooks dispatcher → "Cannot read properties of null (useState)").
    include: ["react", "react-dom", "react/jsx-runtime", "react-shiki"],
  },
  plugins: [
    // MDX must compile .mdx → JSX BEFORE reactRouter()/React process it, hence
    // enforce: "pre". reactRouter() supplies React + fast-refresh (no plugin-react).
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: "@/docs/mdx/mdx-components",
        remarkPlugins: [
          remarkFrontmatter,
          remarkMdxFrontmatter,
          remarkGfm,
          remarkDirective,
          remarkCodeMeta,
          remarkRelativeLinks,
          remarkCalloutDirective,
        ],
      }),
    },
    reactRouter(),
    tailwindcss(),
  ],
  resolve: {
    // Force a single React instance. react-shiki (used in code blocks) would
    // otherwise get pre-bundled against its own optimized React copy, breaking
    // hooks in dev with "Cannot read properties of null (reading 'useState')".
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
