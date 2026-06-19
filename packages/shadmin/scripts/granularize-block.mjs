// Derives per-file registry items from a block's source files.
//
// Given a list of source files in a block, walks each file's imports and emits
// one `registry:component` / `registry:hook` / `registry:lib` item per file.
// Cross-file deps (sibling files, shadcn primitives, npm packages) are resolved
// from the import graph so each granular item declares only what it needs.
//
// Usage from generate-registry.mjs:
//   const granular = granularizeBlock({ files, packageJson, repoRoot });
//   items.push(...granular);

import { readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const SOURCE_EXTS = [".tsx", ".ts"];

// ui/ files authored in this repo (not pulled from shadcn upstream).
// Imports of these resolve to `@shadmin/<name>` items shipped here.
// Everything else under components/ui/ is assumed to be a shadcn upstream item
// referenced by plain name (e.g. "popover", "dialog") — a consumer keeps their
// OWN stock version (bring-your-own-ui).
// `slot`/`direction` have no stock shadcn equivalent, so shipping them custom
// can't clash. `primitives` is the single seam that re-exports the raw Radix
// primitives non-ui code needs (PopoverPrimitive.Portal in columns-button,
// DialogPrimitive in confirm, TooltipPrimitive's props type in the tiptap
// toolbar); routing every reach-in through it lets `popover`/`dialog`/`tooltip`
// ship as BARE STOCK deps instead of overwriting a consumer's own.
// (combobox was removed; it was dead.)
const OUR_UI_ITEMS = new Set([
  "slot",
  "direction",
  "primitives",
]);

// hooks/ files authored in this repo. Same treatment as OUR_UI_ITEMS for ui/.
// Anything not listed resolves to a shadcn upstream hook reference (e.g.
// "use-mobile" upstream).
const OUR_HOOK_ITEMS = new Set(["use-form-field", "use-theme"]);

// NPM packages every React project already has — omitting them from item
// `dependencies` keeps the registry JSON noise-free.
const IMPLICIT_NPM = new Set(["react", "react-dom"]);

const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const parseImports = (src) => {
  const clean = stripComments(src);
  const imports = new Set();
  for (const m of clean.matchAll(/\bfrom\s+["']([^"']+)["']/g)) {
    imports.add(m[1]);
  }
  for (const m of clean.matchAll(/^\s*import\s+["']([^"']+)["']/gm)) {
    imports.add(m[1]);
  }
  return [...imports];
};

const tryResolveFile = (basePath) => {
  for (const ext of SOURCE_EXTS) {
    const candidate = `${basePath}${ext}`;
    try {
      if (statSync(candidate).isFile()) return candidate;
    } catch {
      // not a file
    }
  }
  try {
    if (statSync(basePath).isFile()) return basePath;
  } catch {
    // not a file
  }
  for (const ext of SOURCE_EXTS) {
    const candidate = join(basePath, `index${ext}`);
    try {
      if (statSync(candidate).isFile()) return candidate;
    } catch {
      // not a file
    }
  }
  return null;
};

const resolveImport = (importPath, sourceFile, repoRoot) => {
  if (importPath.startsWith(".")) {
    return tryResolveFile(resolve(dirname(sourceFile), importPath));
  }
  if (importPath.startsWith("@/")) {
    return tryResolveFile(join(repoRoot, "src", importPath.slice(2)));
  }
  return null;
};

const npmRoot = (importPath) => {
  if (importPath.startsWith("@")) {
    return importPath.split("/").slice(0, 2).join("/");
  }
  return importPath.split("/")[0];
};

// Maps an absolute file path under src/ to a registry item reference.
// Returns null when the file shouldn't be tracked (index barrels, unknown
// locations). The `kind` field tells callers whether to prefix with @namespace.
const fileToItemRef = (absFile, repoRoot) => {
  const rel = relative(join(repoRoot, "src"), absFile);
  if (rel.startsWith("..")) return null;

  const noExt = rel.replace(/\.(tsx?|ts)$/, "");
  if (noExt.endsWith("/index")) return null;

  if (noExt.startsWith("components/ui/")) {
    const sub = noExt.slice("components/ui/".length);
    const name = sub.split("/")[0];
    if (OUR_UI_ITEMS.has(name)) return { kind: "ours", name };
    return { kind: "shadcn", name };
  }

  if (noExt.startsWith("components/admin/")) {
    // Name is the file BASENAME, decoupled from internal subdirs. This lets the
    // source tree be organized (admin/inputs/, admin/fields/, …) while the
    // emitted item name — and the consumer-facing install — stays flat. A
    // global dedupe guard in generate-registry.mjs catches basename collisions.
    return {
      kind: "ours",
      name: noExt.split("/").pop(),
    };
  }

  if (noExt.startsWith("hooks/")) {
    const name = noExt.slice("hooks/".length).replace(/\//g, "-");
    if (OUR_HOOK_ITEMS.has(name)) return { kind: "ours", name };
    return { kind: "shadcn", name };
  }

  if (noExt.startsWith("lib/")) {
    return {
      kind: "ours",
      name: `lib-${noExt.slice("lib/".length).replace(/\//g, "-")}`,
    };
  }

  return null;
};

const titleFromName = (name) =>
  name
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");

const inferType = (relPath) => {
  if (relPath.startsWith("src/hooks/")) return "registry:hook";
  if (relPath.startsWith("src/lib/")) return "registry:lib";
  if (relPath.startsWith("src/components/ui/")) return "registry:ui";
  return "registry:component";
};

export const granularizeBlock = ({
  files,
  packageJson,
  repoRoot,
  blockName,
  extraRegistryDependencies = [],
  extraDependencies = [],
}) => {
  const items = [];

  for (const file of files) {
    const absFile = resolve(repoRoot, file);
    const itemRef = fileToItemRef(absFile, repoRoot);
    if (itemRef?.kind !== "ours") continue;
    // Skip a granular item whose derived name collides with the monolith block
    // (e.g. components/admin/admin.tsx -> "admin", same as the "admin" block).
    // The file still ships inside the monolith; any "@shadmin/<blockName>"
    // dependency resolves to that block, so emitting a duplicate item here would
    // make build-registry.mjs write dist/r/<blockName>.json twice and corrupt it.
    if (itemRef.name === blockName) continue;

    const src = readFileSync(absFile, "utf8");
    const imports = parseImports(src);

    const registryDeps = new Set(extraRegistryDependencies);
    const npmDeps = new Set(extraDependencies);
    const npmDevDeps = new Set();

    for (const imp of imports) {
      const resolved = resolveImport(imp, absFile, repoRoot);
      if (resolved) {
        if (resolve(resolved) === resolve(absFile)) continue; // skip self
        const depRef = fileToItemRef(resolved, repoRoot);
        if (!depRef) continue;
        if (depRef.kind === "shadcn") {
          registryDeps.add(depRef.name);
        } else if (depRef.name !== itemRef.name) {
          registryDeps.add(`@shadmin/${depRef.name}`);
        }
        continue;
      }
      const pkg = npmRoot(imp);
      if (IMPLICIT_NPM.has(pkg)) continue;
      // shadmin-core re-exports ra-core (the seam). It's a private, unpublished
      // workspace package, so registry items must declare the real ra-core dep
      // their copied source needs — not the unresolvable @workspace package.
      // When shadmin-core is published, flip this mapping to "shadmin-core".
      if (pkg === "shadmin-core") {
        npmDeps.add("ra-core");
        continue;
      }
      if (packageJson.dependencies?.[pkg]) {
        npmDeps.add(pkg);
      } else if (packageJson.devDependencies?.[pkg]) {
        npmDevDeps.add(pkg);
      }
    }

    const type = inferType(file);
    const item = {
      name: itemRef.name,
      type,
      title: titleFromName(itemRef.name),
      files: [{ path: file, type }],
    };

    if (registryDeps.size > 0) {
      item.registryDependencies = [...registryDeps].sort();
    }
    if (npmDeps.size > 0) {
      item.dependencies = [...npmDeps].sort();
    }
    if (npmDevDeps.size > 0) {
      item.devDependencies = [...npmDevDeps].sort();
    }

    items.push(item);
  }

  return items;
};
