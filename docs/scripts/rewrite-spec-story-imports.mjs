import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");

const COMPONENT_DIRS = ["admin", "extras", "leaflet", "supabase", "csv-import", "mdx-editor", "rich-text-input"];

// Build slug -> dir lookup by checking which subdir each story file landed in.
const slugToDir = {};
for (const d of COMPONENT_DIRS) {
  const storyDir = resolve(repoRoot, "src/stories", d);
  if (!existsSync(storyDir)) continue;
  for (const f of readdirSync(storyDir)) {
    if (!f.endsWith(".stories.tsx")) continue;
    const slug = f.replace(/\.stories\.tsx$/, "");
    if (!slugToDir[slug]) slugToDir[slug] = d;
  }
}

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (e.endsWith(".spec.tsx")) out.push(full);
  }
  return out;
}

let changed = 0;
for (const d of COMPONENT_DIRS) {
  const dirPath = resolve(repoRoot, "src/components", d);
  if (!existsSync(dirPath)) continue;
  for (const f of walk(dirPath)) {
    let src = readFileSync(f, "utf-8");
    const orig = src;
    src = src.replace(
      /from ['"]@\/stories\/([\w-]+)\.stories['"]/g,
      (m, slug) => {
        const sd = slugToDir[slug];
        if (!sd) return m;
        return `from "@/stories/${sd}/${slug}.stories"`;
      },
    );
    if (src !== orig) {
      writeFileSync(f, src);
      changed++;
    }
  }
}
console.log(`Updated imports in ${changed} files`);
