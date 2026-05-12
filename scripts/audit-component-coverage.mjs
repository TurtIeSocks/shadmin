#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import process from "node:process";

const root = process.cwd();

const PRIVATE_EXPORTS = new Set([
  "AdminTheme",
  "FieldToggle",
  "FormFieldProvider",
  "FormItemProvider",
  "InspectorButton",
  "InspectorRoot",
  "TranslatableFieldsTab",
  "TranslatableFieldsTabContent",
  "TranslatableFieldsTabs",
  "TranslatableInputsTab",
  "TranslatableInputsTabContent",
  "TranslatableInputsTabs",
  "ThemeProvider",
  "Theme",
  "ThemesContext",
  "ThemeContext",
  "useTheme",
  "useThemes",
]);

const PRIVATE_FILES = new Set([
  "auth-error-screen",
  "bw-theme",
  "configurable",
  "default-theme",
  "field-toggle",
  "form",
  "house-theme",
  "icon-button-with-tooltip",
  "inspector-button",
  "inspector-root",
  "nano-theme",
  "radiant-theme",
  "spinner",
  "theme-context",
  "theme-provider",
  "theme-types",
  "themes-context",
  "title-portal-id",
  "translatable-fields-tab",
  "translatable-fields-tab-content",
  "translatable-fields-tabs",
  "translatable-inputs-tab",
  "translatable-inputs-tab-content",
  "translatable-inputs-tabs",
  "use-theme",
]);

const args = new Set(process.argv.slice(2));
const asJson = args.has("--json");
const failOnMissing = args.has("--fail-on-missing");

function listFiles(dir, predicate) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFiles(filePath, predicate);
    }

    return predicate(filePath) ? [filePath] : [];
  });
}

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function toPascalCase(value) {
  return value
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

function readAdminExports() {
  const indexPath = join(root, "src/components/admin/index.ts");
  const source = readFileSync(indexPath, "utf8");
  const exportLines = [...source.matchAll(/export\s+\*\s+from\s+"\.\/([^"]+)";/g)];
  const typeExportLines = [
    ...source.matchAll(/export\s+type\s+\{\s*([^}]+)\s*\}\s+from\s+"\.\/([^"]+)";/g),
  ];

  const files = exportLines.map((match) => match[1]);
  for (const match of typeExportLines) {
    for (const name of match[1].split(",").map((part) => part.trim())) {
      if (!PRIVATE_EXPORTS.has(name)) files.push(match[2]);
    }
  }

  return [...new Set(files)].sort();
}

function hasNamedReactExport(filePath) {
  if (!existsSync(filePath) || !filePath.endsWith(".tsx")) return false;

  const source = readFileSync(filePath, "utf8");
  return /export\s+(const|function)\s+[A-Z][A-Za-z0-9_]*/.test(source);
}

const stories = new Set(
  readdirSync(join(root, "src/stories"), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".stories.tsx"))
    .map((entry) => entry.name.replace(".stories.tsx", "")),
);

const specs = new Set(
  listFiles(join(root, "src/components/admin"), (filePath) =>
    filePath.endsWith(".spec.tsx"),
  ).map((filePath) => filePath.split("/").pop().replace(".spec.tsx", "")),
);

const docs = new Set(
  listFiles(join(root, "docs/src/content/docs"), (filePath) =>
    /\.(md|mdx)$/.test(filePath),
  ).map((filePath) => filePath.split("/").pop().replace(/\.(md|mdx)$/, "")),
);

const galleryPath = join(root, "src/demo/component-gallery/ComponentGallery.tsx");
const gallerySource = existsSync(galleryPath) ? readFileSync(galleryPath, "utf8") : "";

const rows = readAdminExports()
  .filter((fileName) => !PRIVATE_FILES.has(fileName))
  .filter((fileName) =>
    hasNamedReactExport(join(root, "src/components/admin", `${fileName}.tsx`)),
  )
  .map((fileName) => {
    const pascalName = toPascalCase(fileName);
    const story = stories.has(fileName);
    const spec = specs.has(fileName);
    const doc = docs.has(pascalName) || docs.has(fileName);
    const demo = gallerySource.includes(pascalName) || gallerySource.includes(fileName);

    return {
      component: pascalName,
      file: relative(root, join(root, "src/components/admin", `${fileName}.tsx`)),
      story,
      spec,
      docs: doc,
      demo,
      complete: story && spec && doc && demo,
    };
  });

const summary = rows.reduce(
  (acc, row) => {
    acc.total += 1;
    if (!row.story) acc.missingStories += 1;
    if (!row.spec) acc.missingSpecs += 1;
    if (!row.docs) acc.missingDocs += 1;
    if (!row.demo) acc.missingDemo += 1;
    if (!row.complete) acc.incomplete += 1;
    return acc;
  },
  {
    total: 0,
    incomplete: 0,
    missingStories: 0,
    missingSpecs: 0,
    missingDocs: 0,
    missingDemo: 0,
  },
);

if (asJson) {
  console.log(JSON.stringify({ summary, rows }, null, 2));
} else {
  console.log("Public component coverage");
  console.log("=========================");
  console.log(`Total: ${summary.total}`);
  console.log(`Incomplete: ${summary.incomplete}`);
  console.log(`Missing stories: ${summary.missingStories}`);
  console.log(`Missing specs: ${summary.missingSpecs}`);
  console.log(`Missing docs: ${summary.missingDocs}`);
  console.log(`Missing demo examples: ${summary.missingDemo}`);
  console.log("");

  for (const row of rows.filter((item) => !item.complete)) {
    const missing = [
      row.story ? null : "story",
      row.spec ? null : "spec",
      row.docs ? null : "docs",
      row.demo ? null : "demo",
    ].filter(Boolean);
    console.log(`${row.component}: missing ${missing.join(", ")}`);
  }
}

if (failOnMissing && summary.incomplete > 0) {
  process.exitCode = 1;
}
