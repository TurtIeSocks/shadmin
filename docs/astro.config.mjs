// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import rehypeCodeGroup from "rehype-code-group";
import expressiveCode from "astro-expressive-code";
import { pluginFullscreen } from "expressive-code-fullscreen";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import rehypeAstroRelativeMarkdownLinks from "astro-rehype-relative-markdown-links";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sidebar } from "./sidebar.config.mjs";
import { legacyRedirects } from "./legacy-redirects.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('vite').Plugin} */
const inlineChangelogPlugin = {
  name: "inline-changelog",
  enforce: "pre",
  transform(code, id) {
    if (!id.endsWith("changelog.mdx")) return;
    const changelogPath = resolve(__dirname, "../CHANGELOG.md");
    const changelogContent = readFileSync(changelogPath, "utf-8");
    return [code, changelogContent].join("\n");
  },
};

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Shadcn Admin Kit",
      customCss: ["./src/styles/global.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/marmelab/shadcn-admin-kit",
        },
      ],
      favicon: "/icon.png",
      logo: {
        light: "./public/logo-light.svg",
        dark: "./public/logo-dark.svg",
        alt: "Shadcn Admin Kit",
      },
      head: [
        // add Umami analytics script tag.
        {
          tag: "script",
          attrs: {
            src: "https://gursikso.marmelab.com/script.js",
            "data-website-id": "de7d7ee2-edef-4865-98f9-9dbfff042997",
            defer: true,
            async: true,
          },
        },
        {
          tag: "script",
          content: `window.addEventListener('load', () => document.querySelector('.site-title').href = 'https://marmelab.com/shadcn-admin-kit/')`,
        },
      ],
      sidebar,
    }),
    expressiveCode({
      plugins: [pluginFullscreen(), pluginCollapsibleSections()],
    }),
    react(),
    mdx(),
  ],
  markdown: {
    rehypePlugins: [
      rehypeCodeGroup,
      [
        rehypeAstroRelativeMarkdownLinks,
        {
          base: "/shadcn-admin-kit/docs/",
          collectionBase: false,
        },
      ],
    ],
  },
  redirects: {
    "/": "/shadcn-admin-kit/docs/install",
    ...legacyRedirects,
  },
  vite: {
    // We are loading type for vite v7 but expecting type for vite v6
    // @ts-ignore
    plugins: [tailwindcss(), inlineChangelogPlugin],
  },
  base: "/shadcn-admin-kit/docs/",
  site: "https://marmelab.com",
  build: {
    assets: "astro-assets",
  },
});
