#!/usr/bin/env node
/**
 * Orchestrator that runs every per-phase coverage check sequentially:
 * - check-sidebar (Phase 0): sidebar slugs ↔ content files
 * - check-docs (Phase 2): docs pages cover every documented component
 * - check-stories (Phase 3): every documented component has a real story
 * - check-specs (Phase 4): every documented component has a non-placeholder spec
 * - check-demo-coverage (Phase 5): every public component imported in src/demo/
 *
 * Exits non-zero if any sub-check fails. Run via `pnpm run check-coverage`
 * from the `docs/` workspace or `make check-coverage` from the repo root.
 */
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const checks = [
  ["check-sidebar", "scripts/check-sidebar.mjs"],
  ["check-docs", "scripts/check-docs.mjs"],
  ["check-stories", "scripts/check-stories.mjs"],
  ["check-specs", "scripts/check-specs.mjs"],
  ["check-demo-coverage", "scripts/check-demo-coverage.mjs"],
];

let failed = false;
for (const [name, file] of checks) {
  const fullPath = resolve(__dirname, "..", file);
  if (!existsSync(fullPath)) {
    console.log(`\n=== ${name}: SKIP (script not yet present) ===`);
    continue;
  }
  console.log(`\n=== ${name} ===`);
  const r = spawnSync("node", [fullPath], { stdio: "inherit" });
  if (r.status !== 0) failed = true;
}
process.exit(failed ? 1 : 0);
