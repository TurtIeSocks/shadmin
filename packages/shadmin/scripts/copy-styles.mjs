// Copy every .css under src/ into dist/, preserving structure.
// tsc only emits .js/.d.ts; component + theme CSS must be copied verbatim.
import { cp, mkdir, readdir } from "node:fs/promises";
import { join, extname, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src/", import.meta.url));
const DIST = fileURLToPath(new URL("../dist/", import.meta.url));

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full);
    } else if (extname(e.name) === ".css") {
      const rel = relative(SRC, full);
      const dest = join(DIST, rel);
      await mkdir(dirname(dest), { recursive: true });
      await cp(full, dest);
    }
  }
}
await walk(SRC);
console.log("copied .css assets to dist/");
