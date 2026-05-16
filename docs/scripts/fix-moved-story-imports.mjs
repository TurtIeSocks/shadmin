import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");

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
for (const f of walk(resolve(repoRoot, "src/stories"))) {
  let src = readFileSync(f, "utf-8");
  const orig = src;
  src = src
    .replace(/from\s+['"]\.\/_test-helpers['"]/g, 'from "@/stories/_test-helpers"')
    .replace(/from\s+['"]\.\/_coverage-story['"]/g, 'from "@/stories/_coverage-story"');
  if (src !== orig) {
    writeFileSync(f, src);
    changed++;
  }
}
console.log(`Fixed imports in ${changed} story files`);
