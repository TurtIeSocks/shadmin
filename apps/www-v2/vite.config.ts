import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { remarkRelativeLinks } from "./scripts/remark-relative-links.mjs";
import { remarkCalloutDirective } from "./scripts/remark-callout-directive.mjs";
import { shadminSourcePlugin } from "./scripts/shadmin-source-resolver.mjs";
import { SHIKI_THEME } from "./src/lib/shiki-theme";

const shadminSrc = path.resolve(__dirname, "../../packages/shadmin/src");

export default defineConfig({
  // +100 from vite's default so it doesn't collide with a user-run server on 5173.
  server: { port: 5273 },
  optimizeDeps: {
    // Pre-bundle react-shiki together with React so it shares the single
    // optimized React chunk instead of inlining its own copy (which would null
    // out the hooks dispatcher → "Cannot read properties of null (useState)").
    // The /demo area's ra-core/admin deps are handled by react-router's
    // `future.unstable_optimizeDeps` (see react-router.config.ts), which runs
    // the optimizer over route modules so they dedupe against this same React.
    include: ["react", "react-dom", "react/jsx-runtime", "react-shiki"],
  },
  plugins: [
    // Must be first: resolves `@/` importer-aware (shadmin src vs www-v2 src)
    // and scoped `shadmin/components/admin/*` + `shadmin/leaflet/*` to source.
    shadminSourcePlugin({
      shadminSrc,
      wwwSrc: path.resolve(__dirname, "./src"),
    }),
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
          remarkRelativeLinks,
          remarkCalloutDirective,
        ],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypePrettyCode,
            {
              // Same theme as the react-shiki code blocks (SHIKI_THEME), so
              // docs MDX fenced blocks match ExampleFrame/ComponentPreview.
              theme: { ...SHIKI_THEME },
              keepBackground: false,
            },
          ],
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
    // `@/` alias removed — handled by shadminSourcePlugin (importer-aware).
  },
});
