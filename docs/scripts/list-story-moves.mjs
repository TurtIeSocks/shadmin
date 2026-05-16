import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getPublicApi } from "./public-api.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");
const items = await getPublicApi();
const seen = new Set();
for (const item of items) {
  if (seen.has(item.slug)) continue;
  seen.add(item.slug);
  const from = `src/stories/${item.slug}.stories.tsx`;
  const to = `src/stories/${item.sourceDir}/${item.slug}.stories.tsx`;
  if (existsSync(resolve(repoRoot, from))) {
    console.log(`${from}\t${to}`);
  }
}
