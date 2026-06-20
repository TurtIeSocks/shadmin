import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { remarkRelativeLinks } from "./scripts/remark-relative-links.mjs";
import { remarkCalloutDirective } from "./scripts/remark-callout-directive.mjs";
import { remarkCodeMeta } from "./scripts/remark-code-meta.mjs";

export default defineConfig({
  plugins: [
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
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    tailwindcss(),
  ],
  root: __dirname,
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // vite-react-ssg imports react-router-dom/server.js which doesn't exist in RR7.
      // In RR7 these APIs moved to react-router (core). Alias to our shim.
      "react-router-dom/server.js": path.resolve(__dirname, "./src/react-router-server-shim.ts"),
    },
  },
});
