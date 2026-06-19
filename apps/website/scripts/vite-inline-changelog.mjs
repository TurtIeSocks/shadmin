/**
 * Vite plugin: inline the repo root CHANGELOG.md into changelog.mdx at build time.
 *
 * Ported from apps/docs/astro.config.mjs `inlineChangelogPlugin`.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// repo root is two levels up from apps/website/scripts/
const REPO_ROOT = resolve(__dirname, "../../../");

/** @type {import('vite').Plugin} */
export const viteInlineChangelog = {
  name: "inline-changelog",
  enforce: /** @type {"pre"} */ ("pre"),
  transform(code, id) {
    if (!id.endsWith("changelog.mdx")) return;
    const changelogPath = resolve(REPO_ROOT, "CHANGELOG.md");
    // Re-run this transform in dev when the external CHANGELOG.md changes.
    this.addWatchFile?.(changelogPath);
    let changelogContent = "";
    try {
      changelogContent = readFileSync(changelogPath, "utf-8");
    } catch {
      changelogContent = "_No CHANGELOG.md found at repo root._";
    }
    return { code: [code, changelogContent].join("\n"), map: null };
  },
};

export default viteInlineChangelog;
