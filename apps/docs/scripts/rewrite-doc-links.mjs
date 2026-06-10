import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentRoot = resolve(__dirname, "../src/content/docs");
const renameMap = JSON.parse(readFileSync("/tmp/rename-map.json", "utf-8"));

const stemMap = {};
for (const r of renameMap) {
  const oldStem = r.from.replace(/\.(md|mdx)$/i, "");
  const newStem = r.to.replace(/\.(md|mdx)$/i, "");
  stemMap[oldStem] = newStem;
}

let totalReplacements = 0;
let filesChanged = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "images") continue;
      walk(full);
      continue;
    }
    if (!/\.(md|mdx)$/i.test(entry)) continue;
    const src = readFileSync(full, "utf-8");
    // Strip out fenced code blocks before rewriting, then re-stitch.
    const blocks = [];
    let stripped = src.replace(/```[\s\S]*?```/g, (m) => {
      blocks.push(m);
      return `__CODEBLOCK_${blocks.length - 1}__`;
    });
    let replacements = 0;
    for (const [oldStem, newStem] of Object.entries(stemMap)) {
      const escaped = oldStem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Captures: 1=optional leading "./", 2=optional ".md|.mdx" ext, 3=ext name,
      // 4=optional trailing "/", 5=optional "#anchor" tail.
      const re = new RegExp(
        `\\]\\((\\./)?${escaped}(\\.(md|mdx))?(/)?(#[^)]*)?\\)`,
        "g",
      );
      stripped = stripped.replace(
        re,
        (_match, _lead, ext, _extName, slash, anchor) => {
          replacements++;
          const trailingSlash = slash ?? "";
          const trailingAnchor = anchor ?? "";
          const extSuffix = ext ?? "";
          return `](./${newStem}${extSuffix}${trailingSlash}${trailingAnchor})`;
        },
      );
    }
    const out = stripped.replace(
      /__CODEBLOCK_(\d+)__/g,
      (_, i) => blocks[Number(i)],
    );
    if (out !== src) {
      writeFileSync(full, out);
      filesChanged++;
      totalReplacements += replacements;
    }
  }
}

walk(contentRoot);
console.log(`Rewrote ${totalReplacements} links across ${filesChanged} files.`);
