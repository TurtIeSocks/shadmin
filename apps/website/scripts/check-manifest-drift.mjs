/**
 * Fails (exit 1) if src/docs/registry-manifest.json is stale relative to the
 * registry. buildManifest is deterministic (generatedAt is null), so this is a
 * straight string comparison against the committed file.
 *
 *   node scripts/check-manifest-drift.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildManifest } from "./generate-docs-manifest.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const registryPath = resolve(
  __dirname,
  "../../../packages/shadmin/registry.json",
);
const manifestPath = resolve(__dirname, "../src/docs/registry-manifest.json");

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const expected = `${JSON.stringify(buildManifest(registry), null, 2)}\n`;
const actual = readFileSync(manifestPath, "utf8");

if (expected !== actual) {
  console.error(
    "registry-manifest.json is stale.\nRun: node scripts/generate-docs-manifest.mjs",
  );
  process.exit(1);
}
console.log("registry-manifest.json is up to date.");
