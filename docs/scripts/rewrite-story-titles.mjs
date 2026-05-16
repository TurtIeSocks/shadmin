import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildGroupLookup } from "./component-to-group.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");
const lookup = buildGroupLookup();

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (e.endsWith(".stories.tsx")) out.push(full);
  }
  return out;
}

let changed = 0;
let skipped = 0;
for (const f of walk(resolve(repoRoot, "src/stories"))) {
  const slug = basename(f, ".stories.tsx");
  const group = lookup.get(slug);
  if (!group) {
    skipped++;
    continue;
  }
  const pascal = slug.split("-").map((p) => (p ? p[0].toUpperCase() + p.slice(1) : "")).join("");
  const newTitle = `${group}/${pascal}`;
  let src = readFileSync(f, "utf-8");
  const orig = src;
  src = src.replace(/title:\s*['"][^'"]+['"]/g, `title: "${newTitle}"`);
  if (src !== orig) {
    writeFileSync(f, src);
    changed++;
  }
}
console.log(`Updated titles in ${changed} stories; skipped ${skipped} (no sidebar entry)`);
