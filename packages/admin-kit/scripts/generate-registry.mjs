#!/usr/bin/env node

// Regenerates registry.json from src/ + scripts/registry.config.mjs.
//
// Run after adding/removing/moving files in any tracked block directory:
//   pnpm registry:generate
//
// The script walks each block's `sourceDirs`, ignores tests / stories / screenshots,
// merges in any `extraFiles`, and writes a deterministic registry.json.

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import prettier from "prettier";

import { granularizeBlock } from "./granularize-block.mjs";
import { blocks, registryMetadata } from "./registry.config.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const registryPath = join(repoRoot, "registry.json");

const SOURCE_EXTS = new Set([".ts", ".tsx"]);
const CSS_EXTS = new Set([".css"]);
const DEFAULT_EXCLUDED_DIRS = new Set(["__screenshots__", "__fixtures__"]);

const isTestOrStory = (filename) =>
  /\.spec\.(ts|tsx)$/.test(filename) || /\.stories\.(ts|tsx)$/.test(filename);

const getExt = (filename) => {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot);
};

const walkSourceDir = (sourceDir) => {
  const absRoot = join(repoRoot, sourceDir.path);
  const allowedExts = sourceDir.cssExtensions
    ? new Set([...SOURCE_EXTS, ...CSS_EXTS])
    : SOURCE_EXTS;
  const excludedDirs = new Set([
    ...DEFAULT_EXCLUDED_DIRS,
    ...(sourceDir.excludeDirs ?? []),
  ]);

  const collected = [];

  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }

    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!sourceDir.recursive) continue;
        if (excludedDirs.has(entry.name)) continue;
        walk(full);
        continue;
      }
      if (!entry.isFile()) continue;
      if (isTestOrStory(entry.name)) continue;
      const ext = getExt(entry.name);
      if (!allowedExts.has(ext)) continue;
      collected.push(relative(repoRoot, full));
    }
  };

  walk(absRoot);
  return collected;
};

const buildBlock = (block) => {
  const fileMap = new Map();

  const addFile = (entry) => {
    fileMap.set(entry.path, entry);
  };

  for (const sourceDir of block.sourceDirs ?? []) {
    for (const path of walkSourceDir(sourceDir)) {
      addFile({ path, type: "registry:component" });
    }
  }

  for (const file of block.extraFiles ?? []) {
    addFile({ ...file });
  }

  const files = [...fileMap.values()].sort((a, b) =>
    a.path.localeCompare(b.path),
  );

  const item = {
    name: block.name,
    type: block.type,
    title: block.title,
  };

  if (block.description !== undefined) {
    item.description = block.description;
  }
  if (block.registryDependencies !== undefined) {
    item.registryDependencies = [...block.registryDependencies];
  }
  if (block.dependencies !== undefined) {
    item.dependencies = [...block.dependencies];
  }
  if (block.devDependencies !== undefined) {
    item.devDependencies = [...block.devDependencies];
  }

  item.files = files;

  return item;
};

const verifyFilesExist = (items) => {
  const missing = [];
  for (const item of items) {
    for (const file of item.files) {
      const abs = join(repoRoot, file.path);
      try {
        if (!statSync(abs).isFile()) {
          missing.push(`${item.name}: ${file.path} is not a regular file`);
        }
      } catch {
        missing.push(`${item.name}: ${file.path} is missing`);
      }
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Registry references missing files:\n  ${missing.join("\n  ")}`,
    );
  }
};

const packageJson = JSON.parse(
  readFileSync(join(repoRoot, "package.json"), "utf8"),
);

const main = async () => {
  const items = [];
  for (const block of blocks) {
    const builtBlock = buildBlock(block);
    items.push(builtBlock);

    if (block.granularize) {
      const granular = granularizeBlock({
        files: builtBlock.files.map((f) => f.path),
        packageJson,
        repoRoot,
        blockName: block.name,
      });
      items.push(...granular);
    }
  }
  verifyFilesExist(items);

  const registry = {
    ...registryMetadata,
    items,
  };

  const raw = JSON.stringify(registry, null, 2);
  const prettierConfig = await prettier.resolveConfig(registryPath);
  const formatted = await prettier.format(raw, {
    ...prettierConfig,
    filepath: registryPath,
  });
  writeFileSync(registryPath, formatted);

  const totalFiles = items.reduce((sum, item) => sum + item.files.length, 0);
  console.log(
    `Wrote ${relative(repoRoot, registryPath)} (${items.length} blocks, ${totalFiles} files).`,
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
