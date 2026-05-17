# Repo Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public-API component in `src/components/{admin,extras,leaflet,supabase,csv-import,mdx-editor,rich-text-input}` documented, story-covered, spec-covered, and demo-exercised — with all docs files renamed to kebab-case and a build-time guard preventing future drift.

**Architecture:** Six phases (0.5 through 5). Phase 0.5 is a one-line `.gitignore` defense. Phase 1 renames PascalCase doc files to kebab-case, adds Astro redirects, and builds shared `public-api.mjs` enumeration used by all later phases. Phases 2–5 build per-phase check scripts (`check-docs`, `check-stories`, `check-specs`, `check-demo-coverage`) wired into `make check-coverage`; each phase backfills gaps reported by its check script. Phase 3 reorganizes flat `src/stories/` into subdirs mirroring `src/components/`. Phase 4 replaces 119 placeholder specs using subagent-driven fan-out (one subagent per docs-sidebar group). Phase 5 adds 5 demo resources + a cross-cutting wiring commit.

**Tech Stack:** Astro Starlight (docs), Vite + React 19 (app), shadcn/ui + Tailwind v4 (UI), Vitest + vitest-browser-react (test), Playwright provider (browser tests), ra-core (data/auth/routing), TypeDoc (Phase 2 prop tables), ESLint custom rules (Phase 4 guard).

**Spec:** [docs/superpowers/specs/2026-05-16-repo-cleanup-design.md](../specs/2026-05-16-repo-cleanup-design.md)

---

## File Structure (full plan)

### Created by this plan

```
.gitignore                                            # +1 line (Phase 0.5)
docs/scripts/public-api.mjs                           # Shared enumeration (Phase 1)
docs/scripts/generate-redirects.mjs                   # One-shot redirect gen (Phase 1)
docs/scripts/rewrite-doc-links.mjs                    # One-shot link rewrite (Phase 1)
docs/scripts/check-docs.mjs                           # (Phase 2)
docs/scripts/check-stories.mjs                        # (Phase 3)
docs/scripts/check-specs.mjs                          # (Phase 4)
docs/scripts/check-demo-coverage.mjs                  # (Phase 5)
docs/scripts/check-coverage.mjs                       # Orchestrator (Phase 4)
docs/scripts/component-to-group.mjs                   # Sidebar lookup (Phase 3)
docs/src/components/PropsTable.astro                  # Typedoc prop table renderer (Phase 2)
docs/typedoc.json                                     # Typedoc config (Phase 2)
docs/src/content/docs/props/<name>.json               # Generated per public component (Phase 2)
eslint-rules/no-tautological-expect.js                # Custom ESLint rule (Phase 4)
eslint-rules/__tests__/no-tautological-expect.test.js # Rule test (Phase 4)
src/stories/{admin,extras,leaflet,supabase,csv-import,mdx-editor,rich-text-input}/
                                                      # New subdirs (Phase 3)
src/demo/map/                                         # /map resource (Phase 5)
src/demo/planning/                                    # /planning resource (Phase 5)
src/demo/analytics/                                   # /analytics resource (Phase 5)
src/demo/workspace/                                   # /workspace resource (Phase 5)
src/demo/onboarding/                                  # /onboarding resource (Phase 5)
```

### Modified by this plan

```
docs/sidebar.config.mjs                  # All slugs kebab; +3 specialized groups (Phase 1)
docs/astro.config.mjs                    # +redirects table (Phase 1)
docs/package.json                        # +scripts for new checks + typedoc (Phases 1,2)
docs/src/content/docs/*.{md,mdx}         # Renamed + internal links rewritten (Phase 1)
docs/src/content/docs/supabase/*.md      # Renamed (Phase 1)
docs/src/content/docs/<page>.md          # Augmented with PropsTable + sections (Phase 2)
Makefile                                 # New check targets (Phases 1,2,3,4,5)
src/components/*/*.spec.tsx              # Import path updates; placeholder replacement (Phases 3,4)
src/stories/*.stories.tsx                # `title:` rewrite + move into subdirs (Phase 3)
src/stories/_coverage-story.tsx          # DELETED (Phase 3)
src/demo/App.tsx                         # Wire CommandMenu + new resources (Phase 5)
src/demo/App.guessers.tsx                # Verify guesser paths still work (Phase 5)
src/demo/dataProvider.ts                 # +seed for new resources (Phase 5)
src/demo/customers/CustomerShow.tsx      # +InPlaceEditor (Phase 5)
src/demo/products/ProductCreate.tsx      # +ImageInput + TranslatableInputs (Phase 5)
src/demo/products/ProductEdit.tsx        # +ImageInput + TranslatableInputs (Phase 5)
src/demo/categories/CategoryList.tsx     # Replace flat list with TreeList (Phase 5)
src/demo/customers/CustomerList.tsx      # +CsvImport bulk action (Phase 5)
eslint.config.js (or .eslintrc.*)        # Load custom rule (Phase 4)
```

---

## Phase 0.5: Ignore `__screenshots__/`

**Context:** vitest-browser-react's Playwright provider writes snapshot images under `src/components/<dir>/__screenshots__/`. Currently 4 such dirs exist locally (admin, leaflet, csv-import, supabase) totaling ~3.7MB. None are committed today, but the path is not in `.gitignore`, so a stray `git add .` could regress. Single defensive commit.

### Task 0.5.1: Add `__screenshots__/` to `.gitignore`

**Files:**

- Modify: `.gitignore`

- [ ] **Step 1: Verify nothing currently tracked**

```bash
git ls-files | grep __screenshots__ | wc -l
```

Expected: `0`

- [ ] **Step 2: Append rule to `.gitignore`**

Append these two lines to the end of `.gitignore`:

```
# vitest-browser-react Playwright provider snapshot artifacts
**/__screenshots__/
```

- [ ] **Step 3: Defensive cache rm (no-op today)**

```bash
git rm -r --cached --ignore-unmatch '**/__screenshots__'
```

Expected: no output (nothing tracked).

- [ ] **Step 4: Verify ignored**

```bash
git status --ignored 2>&1 | grep __screenshots__
```

Expected: lists the 4 local `__screenshots__/` dirs as ignored, not untracked.

- [ ] **Step 5: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore __screenshots__/ directories

vitest-browser-react Playwright provider writes snapshot images under
src/components/<dir>/__screenshots__/. Nothing currently tracked, but
the path was not in .gitignore — a stray git add . could regress."
```

---

## Phase 1: Kebab-case rename + redirects + `public-api.mjs`

**Context:** Phase 1 has 3 parts: (A) build the shared `public-api.mjs` module that later phases consume; (B) rename ~210 PascalCase doc files to kebab-case + update sidebar slugs + rewrite internal links; (C) emit Astro redirects from old flat slugs (e.g. `/accessdenied`) to new kebab slugs (e.g. `/access-denied`).

### Task 1.1: Build `public-api.mjs` shared module

**Files:**

- Create: `docs/scripts/public-api.mjs`

- [ ] **Step 1: Write failing usage script first**

Create `docs/scripts/test-public-api.mjs` (temporary scratch — delete after Step 4):

```js
#!/usr/bin/env node
import { getPublicApi } from "./public-api.mjs";

const items = await getPublicApi();
console.log(`Total: ${items.length}`);
console.log("First 3:", items.slice(0, 3));
const access = items.find((i) => i.name === "AccessDenied");
if (!access) throw new Error("AccessDenied not found");
if (access.sourceDir !== "admin")
  throw new Error(`bad sourceDir: ${access.sourceDir}`);
if (access.slug !== "access-denied")
  throw new Error(`bad slug: ${access.slug}`);
console.log("OK");
```

Run:

```bash
cd docs && node scripts/test-public-api.mjs
```

Expected: FAIL — `public-api.mjs` doesn't exist yet.

- [ ] **Step 2: Implement `public-api.mjs`**

Create `docs/scripts/public-api.mjs`:

```js
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");
const componentsRoot = resolve(repoRoot, "src/components");

const COMPONENT_DIRS = [
  "admin",
  "extras",
  "leaflet",
  "supabase",
  "csv-import",
  "mdx-editor",
  "rich-text-input",
];

/**
 * Parse `export * from "./foo-bar"` lines from an index.ts.
 * Returns an array of basenames (`["foo-bar", ...]`).
 * @param {string} indexPath
 */
function readReexports(indexPath) {
  const src = readFileSync(indexPath, "utf-8");
  /** @type {string[]} */
  const basenames = [];
  for (const line of src.split("\n")) {
    const m = line.match(/^export \* from ["']\.\/([\w-]+)["']/);
    if (m) basenames.push(m[1]);
  }
  return basenames;
}

/**
 * Walk an `index.ts` file's `export *` lines + named exports of each file's
 * top-level `export const`, `export function`, `export class` declarations.
 */
function collectNamedExports(sourceDir, basenameKebab) {
  const tsxPath = resolve(componentsRoot, sourceDir, `${basenameKebab}.tsx`);
  const tsPath = resolve(componentsRoot, sourceDir, `${basenameKebab}.ts`);
  let src = "";
  let filePath = tsxPath;
  try {
    src = readFileSync(tsxPath, "utf-8");
  } catch {
    src = readFileSync(tsPath, "utf-8");
    filePath = tsPath;
  }
  /** @type {string[]} */
  const names = [];
  const re = /^export (?:const|function|class|type|interface) (\w+)/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    names.push(m[1]);
  }
  return { filePath, names };
}

/**
 * Enumerate every public-API component.
 * @returns {Promise<Array<{name: string, slug: string, sourceDir: string, sourceFile: string}>>}
 */
export async function getPublicApi() {
  /** @type {Array<{name: string, slug: string, sourceDir: string, sourceFile: string}>} */
  const items = [];
  for (const dir of COMPONENT_DIRS) {
    const indexPath = resolve(componentsRoot, dir, "index.ts");
    let basenames;
    try {
      basenames = readReexports(indexPath);
    } catch {
      continue; // skip missing dirs
    }
    for (const basename of basenames) {
      const { filePath, names } = collectNamedExports(dir, basename);
      for (const name of names) {
        items.push({
          name,
          slug: basename,
          sourceDir: dir,
          sourceFile: filePath,
        });
      }
    }
  }
  const seen = new Set();
  return items.filter((i) => {
    if (seen.has(i.name)) return false;
    seen.add(i.name);
    return true;
  });
}

// CLI invocation: print as JSON for ad-hoc inspection
if (import.meta.url === `file://${process.argv[1]}`) {
  const items = await getPublicApi();
  console.log(JSON.stringify(items, null, 2));
  console.log(`\nTotal: ${items.length}`);
}
```

- [ ] **Step 3: Run the test script again**

```bash
cd docs && node scripts/test-public-api.mjs
```

Expected: PASS — `Total: <N>; First 3: [...]; OK`. N should be ~250.

- [ ] **Step 4: Delete the scratch test script**

```bash
rm docs/scripts/test-public-api.mjs
```

- [ ] **Step 5: Add to package.json**

Edit `docs/package.json` scripts:

```json
"public-api": "node scripts/public-api.mjs",
```

Don't commit yet — bundled with Phase 1 commit at end.

### Task 1.2: Generate kebab-case doc rename map

**Files:**

- Create: `docs/scripts/generate-rename-map.mjs` (temp; delete after use)

- [ ] **Step 1: Write rename-map generator**

Create `docs/scripts/generate-rename-map.mjs`:

```js
import { readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentRoot = resolve(__dirname, "../src/content/docs");

function pascalToKebab(name) {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

const SKIP_BASENAMES = new Set([
  "changelog",
  "guides-and-concepts",
  "quick-start-guide",
  "migrating-from-ra-ui-materialui",
  "data-display",
  "data-edition",
  "mcp",
]);

const renames = [];

function walk(dir, prefix = "") {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "images") continue;
      walk(full, prefix + entry + "/");
      continue;
    }
    const m = entry.match(/^(.+)\.(md|mdx)$/i);
    if (!m) continue;
    const [, base, ext] = m;
    const kebab = pascalToKebab(base);
    if (SKIP_BASENAMES.has(kebab)) continue;
    if (kebab !== base) {
      renames.push({
        from: prefix + entry,
        to: prefix + kebab + "." + ext.toLowerCase(),
      });
    }
  }
}

walk(contentRoot);

console.log(JSON.stringify(renames, null, 2));
console.error(`Total renames: ${renames.length}`);
```

Run:

```bash
cd docs && node scripts/generate-rename-map.mjs > /tmp/rename-map.json
wc -l /tmp/rename-map.json
```

Expected: file written; renames count ~210 on stderr.

- [ ] **Step 2: Sanity-check the output**

Spot check 5 random entries:

```bash
python3 -c "import json, random; m = json.load(open('/tmp/rename-map.json')); random.seed(0); print(json.dumps(random.sample(m, 5), indent=2))"
```

Verify each `from` is real PascalCase and `to` is correct kebab.

### Task 1.3: Execute renames with `git mv`

- [ ] **Step 1: Apply renames via plain shell loop**

```bash
cd docs/src/content/docs
jq -r '.[] | "\(.from)\t\(.to)"' /tmp/rename-map.json | while IFS=$'\t' read -r from to; do
  git mv "$from" "$to"
done
echo "Renames complete"
```

Expected: each rename runs; final "Renames complete" printed. (If `jq` not installed: `brew install jq`.)

- [ ] **Step 2: Verify**

```bash
ls docs/src/content/docs/ | grep '^[A-Z]' | head -10
```

Expected: empty output (no PascalCase files remain at top level).

```bash
ls docs/src/content/docs/supabase/ | grep '^[A-Z]'
```

Expected: empty.

### Task 1.4: Update sidebar slugs + sidebar special groups

**Files:**

- Modify: `docs/sidebar.config.mjs`

- [ ] **Step 1: Bulk-rewrite slug strings from old flat to new kebab**

Generate the substitution via shell + edit `sidebar.config.mjs` in-place:

```bash
cd docs
jq -r '.[] | "\(.from)\t\(.to)"' /tmp/rename-map.json | while IFS=$'\t' read -r from to; do
  old=$(echo "$from" | sed -E 's/\.(md|mdx)$//' | tr '[:upper:]' '[:lower:]')
  new=$(echo "$to" | sed -E 's/\.(md|mdx)$//')
  # Match the slug as quoted string only (avoid partial matches)
  sed -i.bak "s/\"${old}\"/\"${new}\"/g; s/'${old}'/'${new}'/g" sidebar.config.mjs
done
rm sidebar.config.mjs.bak
```

Verify:

```bash
grep "'accessdenied'" docs/sidebar.config.mjs
```

Expected: no matches.

```bash
grep "'access-denied'" docs/sidebar.config.mjs
```

Expected: 1 match.

- [ ] **Step 2: Update `enterpriseEntry()` helper signature**

In `docs/sidebar.config.mjs`, change `enterpriseEntry` to accept a slug + label rather than deriving slug from a PascalCase name:

```js
export function enterpriseEntry(slug, label) {
  return {
    link: `${slug}/`,
    label: label ?? slug,
    attrs: { class: "enterprise" },
    badge: {
      text: "React Admin Enterprise",
      variant: "default",
    },
  };
}
```

Update every call: `enterpriseEntry("ReferenceManyToManyFieldBase")` → `enterpriseEntry("reference-many-to-many-field-base", "ReferenceManyToManyFieldBase")`. Same for the other 4 enterprise entries (`ReferenceManyToManyInputBase`, `ReferenceManyInputBase`, `ReferenceOneInputBase`, `AutoPersistInStoreBase`, `RealtimeFeatures`, `SoftDeleteFeatures`).

- [ ] **Step 3: Manually add the 3 new sidebar groups**

Edit `docs/sidebar.config.mjs` — after the existing "Extras" group, add:

```js
{
  label: "CSV Import",
  items: ["csv-import"],
},
{
  label: "MDX Editor",
  items: ["mdx-field", "mdx-input"],
},
{
  label: "Rich Text Input",
  items: ["rich-text-input", "rich-text-field"],
},
```

Then remove those same slugs from their current homes in "Data Display" / "Data Edition".

- [ ] **Step 4: Run check-sidebar**

```bash
cd docs && pnpm run check-sidebar
```

Expected: PASS — all slugs kebab; all files match.

### Task 1.5: Rewrite internal links in doc bodies

**Files:**

- Create: `docs/scripts/rewrite-doc-links.mjs`
- Modify: every `docs/src/content/docs/**/*.{md,mdx}` body

- [ ] **Step 1: Implement link rewriter**

Create `docs/scripts/rewrite-doc-links.mjs`:

````js
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentRoot = resolve(__dirname, "../src/content/docs");
const renameMap = JSON.parse(readFileSync("/tmp/rename-map.json", "utf-8"));

const stemMap = {};
for (const r of renameMap) {
  const oldStem = r.from.replace(/\.(md|mdx)$/i, "");
  const newStem = r.to.replace(/\.(md|mdx)$/i, "");
  stemMap[oldStem] = newStem;
}

let totalReplacements = 0;
let filesChanged = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "images") continue;
      walk(full);
      continue;
    }
    if (!/\.(md|mdx)$/i.test(entry)) continue;
    const src = readFileSync(full, "utf-8");
    // Strip out fenced code blocks before rewriting, then re-stitch.
    const blocks = [];
    let stripped = src.replace(/```[\s\S]*?```/g, (m) => {
      blocks.push(m);
      return `__CODEBLOCK_${blocks.length - 1}__`;
    });
    let replacements = 0;
    for (const [oldStem, newStem] of Object.entries(stemMap)) {
      const escaped = oldStem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(
        `\\]\\((\\./)?${escaped}(\\.(md|mdx))?(/)?\\)`,
        "g",
      );
      stripped = stripped.replace(re, (match) => {
        replacements++;
        const slash = match.endsWith("/)") ? "/" : "";
        return `](./${newStem}${slash})`;
      });
    }
    const out = stripped.replace(
      /__CODEBLOCK_(\d+)__/g,
      (_, i) => blocks[Number(i)],
    );
    if (out !== src) {
      writeFileSync(full, out);
      filesChanged++;
      totalReplacements += replacements;
    }
  }
}

walk(contentRoot);
console.log(`Rewrote ${totalReplacements} links across ${filesChanged} files.`);
````

- [ ] **Step 2: Run rewriter**

```bash
cd docs && node scripts/rewrite-doc-links.mjs
```

Expected: prints count > 0. Verify no PascalCase refs survive:

```bash
grep -rE '\]\(\./[A-Z]' docs/src/content/docs/ --include='*.md' --include='*.mdx' | head -5
```

Expected: empty.

### Task 1.6: Generate Astro redirects

**Files:**

- Create: `docs/scripts/generate-redirects.mjs`
- Create: `docs/legacy-redirects.mjs` (output)
- Modify: `docs/astro.config.mjs`

- [ ] **Step 1: Implement redirect generator**

Create `docs/scripts/generate-redirects.mjs`:

```js
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const renameMap = JSON.parse(readFileSync("/tmp/rename-map.json", "utf-8"));

const BASE = "/shadcn-admin-kit/docs";

const redirects = {};
for (const r of renameMap) {
  const oldStem = r.from.replace(/\.(md|mdx)$/i, "").toLowerCase();
  const newStem = r.to.replace(/\.(md|mdx)$/i, "");
  redirects[`${BASE}/${oldStem}`] = `${BASE}/${newStem}`;
}

const out = `// Auto-generated by docs/scripts/generate-redirects.mjs
// Re-run after any docs file rename.
export const legacyRedirects = ${JSON.stringify(redirects, null, 2)};
`;
writeFileSync(resolve(__dirname, "../legacy-redirects.mjs"), out);
console.log(`Wrote ${Object.keys(redirects).length} redirects.`);
```

Run:

```bash
cd docs && node scripts/generate-redirects.mjs
```

Expected: `Wrote ~210 redirects.` and creates `docs/legacy-redirects.mjs`.

- [ ] **Step 2: Wire redirects into astro.config.mjs**

Edit `docs/astro.config.mjs`:

```js
// Top
import { legacyRedirects } from "./legacy-redirects.mjs";

// In defineConfig({...}):
redirects: {
  "/": "/shadcn-admin-kit/docs/install",
  ...legacyRedirects,
},
```

- [ ] **Step 3: Build docs to verify redirects compile**

```bash
cd docs && pnpm run build 2>&1 | tail -20
```

Expected: build completes; no broken-link errors. Build is slow (~30s); use `run_in_background: true` if pairing with another task.

### Task 1.7: Wire `make check-doc` to call check-sidebar

Already wired in current `Makefile` — no change. Verify:

- [ ] **Step 1: Run full chain**

```bash
make check-doc
```

Expected: PASS.

### Task 1.8: Commit Phase 1

- [ ] **Step 1: Stage + commit**

```bash
git add Makefile docs/
git commit -m "refactor(docs): rename pages to kebab-case + add legacy slug redirects

Renames ~210 PascalCase .md/.mdx files to kebab-case for consistency with
src/components/ filename convention. Updates sidebar slugs, rewrites internal
markdown links (skipping fenced code blocks), and generates Astro redirects
from old flat slugs (/accessdenied) to new kebab slugs (/access-denied) so
bookmarks keep working. Adds three new specialized-folder sidebar groups
(CSV Import, MDX Editor, Rich Text Input) and builds the shared
public-api.mjs module that Phases 2-5 will consume."
```

- [ ] **Step 2: Delete the scratch rename map**

```bash
rm /tmp/rename-map.json
```

---

## Phase 2: Docs audit + typedoc + missing pages

**Context:** Wire TypeDoc to extract prop interfaces into JSON, build an Astro `<PropsTable>` MDX component that reads the JSON and renders a prop table, then audit every public-API component's doc page for: existence, `## Usage`, `## Props` (or zero-prop exception), per-prop sections, ≥ 1 code block, no placeholder tokens. Backfill gaps.

### Task 2.1: Add typedoc dependency + config

**Files:**

- Modify: `docs/package.json` (devDeps + scripts)
- Create: `docs/typedoc.json`

- [ ] **Step 1: Install typedoc**

```bash
cd docs && pnpm add -D typedoc typedoc-plugin-markdown
```

- [ ] **Step 2: Create `docs/typedoc.json`**

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": [
    "../src/components/admin/index.ts",
    "../src/components/extras/index.ts",
    "../src/components/leaflet/index.ts",
    "../src/components/supabase/index.ts",
    "../src/components/csv-import/index.ts",
    "../src/components/mdx-editor/index.ts",
    "../src/components/rich-text-input/index.ts"
  ],
  "tsconfig": "../tsconfig.json",
  "json": "./public-api.typedoc.json",
  "excludePrivate": true,
  "excludeInternal": true,
  "excludeExternals": true,
  "skipErrorChecking": true
}
```

- [ ] **Step 3: Add npm script**

Edit `docs/package.json`:

```json
"docs:gen-props": "typedoc"
```

- [ ] **Step 4: Run typedoc**

```bash
cd docs && pnpm run docs:gen-props 2>&1 | tail -10
```

Expected: produces `docs/public-api.typedoc.json` (~1-5MB). Should not error.

### Task 2.2: Build per-component props JSON splitter

**Files:**

- Create: `docs/scripts/split-typedoc.mjs`
- Create: `docs/src/content/docs/props/.gitkeep`

- [ ] **Step 1: Implement splitter**

Create `docs/scripts/split-typedoc.mjs`:

```js
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const propsDir = resolve(__dirname, "../src/content/docs/props");
mkdirSync(propsDir, { recursive: true });

const doc = JSON.parse(
  readFileSync(resolve(__dirname, "../public-api.typedoc.json"), "utf-8"),
);

function* walk(node) {
  if (node.kind === 256 && /Props$/.test(node.name)) {
    // 256 = Interface
    yield { componentName: node.name.replace(/Props$/, ""), iface: node };
  }
  for (const child of node.children ?? []) {
    yield* walk(child);
  }
}

let written = 0;
for (const { componentName, iface } of walk(doc)) {
  const props = (iface.children ?? []).map((c) => ({
    name: c.name,
    type: c.type?.toString?.() ?? c.type?.name ?? "unknown",
    optional: c.flags?.isOptional === true,
    comment: c.comment?.summary?.map((s) => s.text).join("") ?? "",
  }));
  writeFileSync(
    resolve(propsDir, `${componentName}.json`),
    JSON.stringify({ name: componentName, props }, null, 2),
  );
  written++;
}
console.log(`Wrote ${written} prop files to ${propsDir}`);
```

Run:

```bash
cd docs && node scripts/split-typedoc.mjs
```

Expected: `Wrote ~250 prop files to .../props`.

- [ ] **Step 2: Add to `docs:gen-props` chain**

Edit `docs/package.json`:

```json
"docs:gen-props": "typedoc && node scripts/split-typedoc.mjs",
```

### Task 2.3: Build `<PropsTable>` Astro component

**Files:**

- Create: `docs/src/components/PropsTable.astro`

- [ ] **Step 1: Implement component**

Create `docs/src/components/PropsTable.astro`:

```astro
---
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

interface Props {
  name: string;
}

const { name } = Astro.props;
const __dirname = dirname(fileURLToPath(import.meta.url));
const propsPath = resolve(__dirname, `../content/docs/props/${name}.json`);
let entry;
try {
  entry = JSON.parse(readFileSync(propsPath, "utf-8"));
} catch {
  entry = { name, props: [] };
}
---

{entry.props.length === 0 ? (
  <p><em>This component takes no props.</em></p>
) : (
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Required</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      {entry.props.map((p) => (
        <tr>
          <td><code>{p.name}</code></td>
          <td><code>{p.type}</code></td>
          <td>{p.optional ? "—" : "Yes"}</td>
          <td>{p.comment}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}
```

- [ ] **Step 2: Spot-test in an existing doc**

Pick an arbitrary doc page (e.g. `docs/src/content/docs/access-denied.md` — rename to `.mdx` if necessary), inject:

```mdx
import PropsTable from "../../components/PropsTable.astro";

<PropsTable name="AccessDenied" />
```

Run:

```bash
cd docs && pnpm run dev
```

Open the page in browser, verify the prop table renders.

### Task 2.4: Implement `check-docs.mjs`

**Files:**

- Create: `docs/scripts/check-docs.mjs`

- [ ] **Step 1: Write the check script**

Create `docs/scripts/check-docs.mjs`:

````js
#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getPublicApi } from "./public-api.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentRoot = resolve(__dirname, "../src/content/docs");
const propsRoot = resolve(__dirname, "../src/content/docs/props");

const PLACEHOLDER_TOKENS = ["TODO", "Coming soon", "Lorem ipsum", "FIXME"];

const items = await getPublicApi();
const failures = [];

for (const item of items) {
  const docPath = resolve(contentRoot, `${item.slug}.md`);
  const docPathMdx = resolve(contentRoot, `${item.slug}.mdx`);
  const path = existsSync(docPath)
    ? docPath
    : existsSync(docPathMdx)
      ? docPathMdx
      : null;

  if (!path) {
    failures.push(
      `${item.name}: missing doc page (expected ${item.slug}.md or .mdx)`,
    );
    continue;
  }

  const body = readFileSync(path, "utf-8");

  if (!/^## Usage/m.test(body)) {
    failures.push(`${item.name}: missing '## Usage' heading`);
  }

  const propsPath = resolve(propsRoot, `${item.name}.json`);
  let propCount = 0;
  if (existsSync(propsPath)) {
    propCount = JSON.parse(readFileSync(propsPath, "utf-8")).props.length;
  }

  if (
    propCount > 0 &&
    !/^## Props/m.test(body) &&
    !body.includes("<PropsTable")
  ) {
    failures.push(
      `${item.name}: has ${propCount} props but no '## Props' or <PropsTable>`,
    );
  }

  if (!/```[a-z]*\n/.test(body)) {
    failures.push(`${item.name}: no fenced code block`);
  }

  for (const token of PLACEHOLDER_TOKENS) {
    if (body.includes(token)) {
      failures.push(`${item.name}: contains placeholder token '${token}'`);
    }
  }
}

if (failures.length) {
  console.error(`\n${failures.length} doc check failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`OK: ${items.length} doc pages pass checks.`);
````

- [ ] **Step 2: Add to package.json**

```json
"check-docs": "node scripts/check-docs.mjs",
```

- [ ] **Step 3: Run + capture gap list**

```bash
cd docs && pnpm run check-docs > /tmp/check-docs-report.txt 2>&1 || true
head -40 /tmp/check-docs-report.txt
```

Expected: prints failure list (many failures expected — placeholder pages, missing sections).

### Task 2.5: Backfill gaps (iterate)

**This task is dispatched to subagents — one subagent per docs-sidebar group, mirroring Phase 4's pattern.** Each subagent receives:

- Group name + component list
- Check-docs failure list filtered to that group
- Doc page template

**Doc page template** (for backfill / placeholder replacement):

```mdx
---
title: "<ComponentName>"
---

import PropsTable from "../../components/PropsTable.astro";

<short paragraph: what does this component do?>

## Usage

` ` `tsx
import { <ComponentName> } from "@/components/admin";

<one-line typical use case>
` ` `

<longer paragraph if necessary>

## Props

<PropsTable name="<ComponentName>" />

## `<propName1>`

<per-prop section: when/why to use; default value; gotchas>

` ` `tsx

<minimal example showing this prop in action>
` ` `
```

(In the actual doc file, remove the spaces inside the triple-backtick fences.)

Per-component variants:

- Zero-prop component → omit `## Props` and per-prop sections; ≥ 1 code block still required.
- Single-prop component → `<PropsTable>` + 1 per-prop section.
- Complex component → `<PropsTable>` + per-prop sections for non-obvious props (skip props that are pass-through from a well-known base).

- [ ] **Step 1: Triage failures by group**

Run:

```bash
sort /tmp/check-docs-report.txt
```

Group failures by component name → sidebar group (use sidebar.config.mjs as authority).

- [ ] **Step 2: Dispatch one subagent per group with failures**

Main thread dispatches `general-purpose` subagent per group with prompt:

> "Backfill docs/src/content/docs/ pages for these components in the <group> group. Failures from `pnpm check-docs`: <list>. Use the doc page template in docs/superpowers/plans/2026-05-16-repo-cleanup.md Task 2.5. Verify your work with `cd docs && pnpm check-docs` showing only failures from OTHER groups after your changes."

Per CLAUDE.md, dispatch 2-3 subagents in parallel when groups don't share files.

- [ ] **Step 3: Re-run check-docs after each subagent reports**

```bash
cd docs && pnpm run check-docs 2>&1 | tail -20
```

Expected: failure count decreases monotonically.

### Task 2.6: Commit Phase 2

- [ ] **Step 1: Run full verification**

```bash
cd docs && pnpm run check-sidebar && pnpm run check-docs && pnpm run build 2>&1 | tail -5
```

Expected: all pass.

- [ ] **Step 2: Commit**

```bash
git add docs/
git commit -m "docs(audit): fill missing pages + add typedoc props + check-docs guard

Wires typedoc to extract prop interfaces into per-component JSON files,
adds an Astro <PropsTable> MDX component that reads the JSON and renders a
prop table, and adds docs/scripts/check-docs.mjs which fails build if any
public-API component is missing a doc page, missing ## Usage, missing ## Props
(when it has props), or contains placeholder tokens. Backfills all gaps
identified by the script."
```

---

## Phase 3: Stories audit + organize + fill

**Context:** Three parts: (A) move all stories under `src/stories/` into subdirs mirroring `src/components/`, (B) replace 38 placeholder stories using `CoverageStory`, (C) fill missing stories per `check-stories.mjs`. All stories' `default.title` updated to match the docs sidebar group prefix.

### Task 3.1: Build group lookup from sidebar

**Files:**

- Create: `docs/scripts/component-to-group.mjs`

- [ ] **Step 1: Implement lookup module**

Create `docs/scripts/component-to-group.mjs`:

```js
import { sidebar } from "../sidebar.config.mjs";

/**
 * Build a map of kebab-slug → sidebar group label.
 * @returns {Map<string, string>}
 */
export function buildGroupLookup() {
  const map = new Map();
  for (const group of sidebar) {
    const label = group.label;
    for (const item of group.items ?? []) {
      if (typeof item === "string") {
        map.set(item, label);
      } else if (item?.link) {
        const slug = item.link.replace(/\/$/, "");
        map.set(slug, label);
      }
    }
  }
  return map;
}
```

### Task 3.2: Reorg stories into subdirs

**Files:**

- Move: `src/stories/*.stories.tsx` → `src/stories/<sourceDir>/`
- Modify: `src/components/<dir>/*.spec.tsx` imports

- [ ] **Step 1: Generate move plan**

Create a temporary helper script at `docs/scripts/list-story-moves.mjs`:

```js
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { getPublicApi } from "./public-api.mjs";

const repoRoot = resolve(import.meta.dirname, "../..");
const items = await getPublicApi();
for (const item of items) {
  const from = `src/stories/${item.slug}.stories.tsx`;
  const to = `src/stories/${item.sourceDir}/${item.slug}.stories.tsx`;
  if (existsSync(resolve(repoRoot, from))) {
    console.log(`${from}\t${to}`);
  }
}
```

Run:

```bash
cd /Users/rin/GitHub/shadcn-admin-kit
node docs/scripts/list-story-moves.mjs > /tmp/story-moves.tsv
wc -l /tmp/story-moves.tsv
```

Expected: TSV with one row per existing story, count near 200.

- [ ] **Step 2: Create target dirs + git mv via shell loop**

```bash
mkdir -p src/stories/admin src/stories/extras src/stories/leaflet src/stories/supabase src/stories/csv-import src/stories/mdx-editor src/stories/rich-text-input

while IFS=$'\t' read -r from to; do
  git mv "$from" "$to"
done < /tmp/story-moves.tsv

echo "Move complete"
```

- [ ] **Step 3: Update spec imports**

Create `docs/scripts/rewrite-spec-story-imports.mjs`:

```js
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../..");

const COMPONENT_DIRS = [
  "admin",
  "extras",
  "leaflet",
  "supabase",
  "csv-import",
  "mdx-editor",
  "rich-text-input",
];

const slugToDir = {};
for (const d of COMPONENT_DIRS) {
  const dirPath = resolve(repoRoot, "src/components", d);
  try {
    for (const f of readdirSync(dirPath)) {
      if (f.endsWith(".tsx") && !f.endsWith(".spec.tsx")) {
        slugToDir[f.replace(".tsx", "")] = d;
      }
    }
  } catch {
    // missing dir
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
  let files;
  try {
    files = walk(dirPath);
  } catch {
    continue;
  }
  for (const f of files) {
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
```

Run:

```bash
cd /Users/rin/GitHub/shadcn-admin-kit
node docs/scripts/rewrite-spec-story-imports.mjs
```

- [ ] **Step 4: Run tests to verify imports resolve**

```bash
pnpm vitest run --browser.headless src/components/admin/access-denied.spec.tsx 2>&1 | tail -10
```

Expected: PASS (import path now resolves).

### Task 3.3: Update Storybook `title:` to match docs sidebar groups

**Files:**

- Modify: every `src/stories/<dir>/*.stories.tsx`

- [ ] **Step 1: Implement title rewriter**

Create `docs/scripts/rewrite-story-titles.mjs`:

```js
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { buildGroupLookup } from "./component-to-group.mjs";

const repoRoot = resolve(import.meta.dirname, "../..");
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
  const pascal = slug
    .split("-")
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("");
  const newTitle = `${group}/${pascal}`;
  let src = readFileSync(f, "utf-8");
  const orig = src;
  src = src.replace(/title:\s*['"][^'"]+['"]/g, `title: "${newTitle}"`);
  if (src !== orig) {
    writeFileSync(f, src);
    changed++;
  }
}
console.log(
  `Updated titles in ${changed} stories; skipped ${skipped} (no sidebar entry)`,
);
```

Run:

```bash
cd /Users/rin/GitHub/shadcn-admin-kit
node docs/scripts/rewrite-story-titles.mjs
```

### Task 3.4: Replace 38 placeholder stories using `CoverageStory`

**Files:**

- Modify: every `src/stories/<dir>/*.stories.tsx` that imports `CoverageStory`

- [ ] **Step 1: List placeholders**

```bash
grep -rl "CoverageStory\|_coverage-story" src/stories/ > /tmp/coverage-story-list.txt
wc -l /tmp/coverage-story-list.txt
```

Expected: ~38 files.

- [ ] **Step 2: Dispatch one subagent per docs-sidebar group with placeholders**

Subagent prompt template:

> "Replace placeholder stories in src/stories/<dir>/ for the <group> group. Files to fix: <list>. Each currently imports CoverageStory and renders the ComponentGallery instead of the actual component. Rewrite each so it:
>
> 1. Uses StoryAdmin from src/stories/\_test-helpers.tsx as the wrapper (or a thinner ad-hoc wrapper if StoryAdmin's Create+SimpleForm is wrong shape for the component — auth pages are typical exceptions).
> 2. Sets default.title to '<group>/<ComponentName>'.
> 3. Exports `Basic` showing the component with sensible props.
> 4. Adds 1–3 variant stories if the component has multiple prop combos worth seeing rendered (Disabled, Loading, CustomLabel, etc.). Skip variants for atoms with no props.
>    Reference: docs/superpowers/plans/2026-05-16-repo-cleanup.md Task 3.4. Verify with `pnpm vitest run --browser.headless src/components/<dir>/<one-renamed>.spec.tsx`."

- [ ] **Step 3: Verify**

```bash
grep -rl "CoverageStory\|_coverage-story" src/stories/ | wc -l
```

Expected: `0`.

### Task 3.5: Fill missing stories

**Files:**

- Create: any `src/stories/<dir>/<slug>.stories.tsx` not yet present

- [ ] **Step 1: List missing**

Create `docs/scripts/list-missing-stories.mjs`:

```js
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { getPublicApi } from "./public-api.mjs";

const repoRoot = resolve(import.meta.dirname, "../..");
const items = await getPublicApi();
for (const i of items) {
  const p = resolve(
    repoRoot,
    `src/stories/${i.sourceDir}/${i.slug}.stories.tsx`,
  );
  if (!existsSync(p))
    console.log(`src/stories/${i.sourceDir}/${i.slug}.stories.tsx`);
}
```

Run:

```bash
cd /Users/rin/GitHub/shadcn-admin-kit && node docs/scripts/list-missing-stories.mjs
```

- [ ] **Step 2: Dispatch subagents per group with missing stories**

Reuse template from Task 3.4 plus: "Create new story files for the listed components".

### Task 3.6: Implement `check-stories.mjs`

**Files:**

- Create: `docs/scripts/check-stories.mjs`

- [ ] **Step 1: Write the check**

Create `docs/scripts/check-stories.mjs`:

```js
#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getPublicApi } from "./public-api.mjs";
import { buildGroupLookup } from "./component-to-group.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");
const lookup = buildGroupLookup();

const items = await getPublicApi();
const failures = [];

for (const item of items) {
  const storyPath = resolve(
    repoRoot,
    `src/stories/${item.sourceDir}/${item.slug}.stories.tsx`,
  );
  if (!existsSync(storyPath)) {
    failures.push(`${item.name}: missing story file at ${storyPath}`);
    continue;
  }
  const body = readFileSync(storyPath, "utf-8");

  if (body.includes("CoverageStory") || body.includes("_coverage-story")) {
    failures.push(`${item.name}: still imports CoverageStory placeholder`);
  }
  if (!/export const Basic/.test(body)) {
    failures.push(`${item.name}: missing 'export const Basic'`);
  }
  if (body.split("\n").length < 30) {
    failures.push(`${item.name}: story file < 30 lines (likely thin)`);
  }
  const expectedGroup = lookup.get(item.slug);
  if (expectedGroup) {
    const titleMatch = body.match(/title:\s*['"]([^'"]+)['"]/);
    if (!titleMatch || !titleMatch[1].startsWith(`${expectedGroup}/`)) {
      failures.push(
        `${item.name}: title prefix doesn't match sidebar group '${expectedGroup}'`,
      );
    }
  }
}

if (failures.length) {
  console.error(`\n${failures.length} story check failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`OK: ${items.length} stories pass checks.`);
```

- [ ] **Step 2: Add to package.json**

```json
"check-stories": "node scripts/check-stories.mjs",
```

- [ ] **Step 3: Run + iterate until passes**

```bash
cd docs && pnpm run check-stories
```

Expected: PASS after all backfill done.

### Task 3.7: Delete `_coverage-story.tsx`

- [ ] **Step 1: Verify no remaining references**

```bash
grep -r "CoverageStory\|_coverage-story" src/ 2>&1 | head
```

Expected: empty (or only the file itself).

- [ ] **Step 2: Delete**

```bash
git rm src/stories/_coverage-story.tsx
```

### Task 3.8: Commit Phase 3

- [ ] **Step 1: Full verification**

```bash
cd docs && pnpm run check-sidebar && pnpm run check-docs && pnpm run check-stories && cd .. && pnpm run lint && pnpm run typecheck
```

Expected: all PASS.

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "refactor(stories): mirror components dir + replace placeholder stories + reuse StoryAdmin

Moves all src/stories/*.stories.tsx into subdirs mirroring src/components/
(admin, extras, leaflet, supabase, csv-import, mdx-editor, rich-text-input),
updates spec import paths accordingly, and rewrites Storybook 'title:' to
match docs sidebar groups (e.g. 'Data Display/AccessDenied'). Replaces 38
placeholder stories that imported CoverageStory with real Basic + variant
stories using the shared StoryAdmin wrapper. Adds check-stories.mjs guard."
```

---

## Phase 4: Spec placeholder replacement + ESLint rule

**Context:** 119 spec files match exact 12-line `expect(true).toBe(true)` pattern. Replace with story-driven assertions per AGENTS.md. Hybrid TDD: behavioral specs (buttons, forms, lists, references) follow superpowers:test-driven-development; atoms (display-only) get direct characterization tests. Add ESLint rule `no-tautological-expect` to catch regressions.

### Task 4.1: Build custom ESLint rule

**Files:**

- Create: `eslint-rules/no-tautological-expect.js`
- Create: `eslint-rules/__tests__/no-tautological-expect.test.js`
- Modify: `eslint.config.js`

- [ ] **Step 1: Write failing rule test**

Create `eslint-rules/__tests__/no-tautological-expect.test.js`:

```js
import { RuleTester } from "eslint";
import rule from "../no-tautological-expect.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
});

ruleTester.run("no-tautological-expect", rule, {
  valid: [
    { code: "expect(actual).toBe(expected)" },
    { code: "expect(true).toBe(false)" },
    { code: "expect(getByText('Hello')).toBeInTheDocument()" },
  ],
  invalid: [
    {
      code: "expect(true).toBe(true)",
      errors: [{ messageId: "tautological" }],
    },
    {
      code: "expect(1).toBe(1)",
      errors: [{ messageId: "tautological" }],
    },
    {
      code: 'expect("x").toBe("x")',
      errors: [{ messageId: "tautological" }],
    },
  ],
});

console.log("All rule tests passed.");
```

Run:

```bash
node eslint-rules/__tests__/no-tautological-expect.test.js
```

Expected: FAIL — `no-tautological-expect.js` doesn't exist.

- [ ] **Step 2: Implement rule**

Create `eslint-rules/no-tautological-expect.js`:

```js
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow tautological expect calls like expect(true).toBe(true)",
    },
    messages: {
      tautological:
        "Tautological expect: assertion compares a value with itself.",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== "MemberExpression" ||
          !/^(toBe|toEqual|toStrictEqual)$/.test(node.callee.property.name) ||
          node.callee.object.type !== "CallExpression" ||
          node.callee.object.callee.name !== "expect"
        ) {
          return;
        }
        const expectArg = node.callee.object.arguments[0];
        const matcherArg = node.arguments[0];
        if (!expectArg || !matcherArg) return;
        if (
          expectArg.type === "Literal" &&
          matcherArg.type === "Literal" &&
          expectArg.value === matcherArg.value
        ) {
          context.report({ node, messageId: "tautological" });
        }
      },
    };
  },
};
```

- [ ] **Step 3: Run test**

```bash
node eslint-rules/__tests__/no-tautological-expect.test.js
```

Expected: PASS.

- [ ] **Step 4: Wire into ESLint config**

Edit `eslint.config.js`. Add to plugins + rules:

```js
import noTautologicalExpect from "./eslint-rules/no-tautological-expect.js";

export default [
  // ...existing config...
  {
    files: ["src/**/*.spec.{ts,tsx}"],
    plugins: {
      "local-rules": {
        rules: {
          "no-tautological-expect": noTautologicalExpect,
        },
      },
    },
    rules: {
      "local-rules/no-tautological-expect": "error",
    },
  },
];
```

- [ ] **Step 5: Verify rule fires on placeholder spec**

```bash
pnpm run lint 2>&1 | grep no-tautological-expect | head -5
```

Expected: prints 119 violations.

### Task 4.2: Implement `check-specs.mjs`

**Files:**

- Create: `docs/scripts/check-specs.mjs`

- [ ] **Step 1: Write check**

Create `docs/scripts/check-specs.mjs`:

```js
#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getPublicApi } from "./public-api.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");

const items = await getPublicApi();
const failures = [];

for (const item of items) {
  const specPath = resolve(
    repoRoot,
    `src/components/${item.sourceDir}/${item.slug}.spec.tsx`,
  );
  if (!existsSync(specPath)) {
    failures.push(`${item.name}: missing spec file`);
    continue;
  }
  const body = readFileSync(specPath, "utf-8");
  if (body.includes("expect(true).toBe(true)")) {
    failures.push(
      `${item.name}: contains tautological expect(true).toBe(true)`,
    );
  }
  if (!body.includes(`@/stories/${item.sourceDir}/${item.slug}.stories`)) {
    failures.push(
      `${item.name}: does not import from corresponding stories file`,
    );
  }
}

if (failures.length) {
  console.error(`\n${failures.length} spec check failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`OK: ${items.length} specs pass checks.`);
```

Add to package.json:

```json
"check-specs": "node scripts/check-specs.mjs",
```

### Task 4.3: Build `check-coverage.mjs` orchestrator

**Files:**

- Create: `docs/scripts/check-coverage.mjs`
- Modify: `Makefile`

- [ ] **Step 1: Write orchestrator**

Create `docs/scripts/check-coverage.mjs`:

```js
#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const checks = [
  ["check-sidebar", "scripts/check-sidebar.mjs"],
  ["check-docs", "scripts/check-docs.mjs"],
  ["check-stories", "scripts/check-stories.mjs"],
  ["check-specs", "scripts/check-specs.mjs"],
  ["check-demo-coverage", "scripts/check-demo-coverage.mjs"],
];

let failed = false;
for (const [name, file] of checks) {
  console.log(`\n=== ${name} ===`);
  const r = spawnSync("node", [file], { stdio: "inherit" });
  if (r.status !== 0) failed = true;
}
process.exit(failed ? 1 : 0);
```

Add to package.json:

```json
"check-coverage": "node scripts/check-coverage.mjs",
```

Replace existing `make check-doc` target with `make check-coverage`:

```makefile
check-coverage: ## Run all docs/stories/specs/demo coverage checks
	@cd docs && pnpm run check-coverage

build-doc: check-coverage
	# existing body
```

### Task 4.4: Replace 119 placeholder specs (subagent fan-out)

**Spec template — atom (display-only):**

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic } from "@/stories/<dir>/<slug>.stories";

describe("<ComponentName />", () => {
  it("renders the Basic story with expected output", async () => {
    const { getByText } = render(<Basic />);
    await expect.element(getByText(/<some visible text>/i)).toBeInTheDocument();
  });
});
```

**Spec template — behavioral (button, form, list):**

```tsx
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Basic, Disabled /* etc */ } from "@/stories/<dir>/<slug>.stories";

describe("<ComponentName />", () => {
  it("renders the Basic story", async () => {
    const { getByRole } = render(<Basic />);
    await expect
      .element(getByRole("button", { name: /<label>/i }))
      .toBeInTheDocument();
  });

  it("calls onClick when activated", async () => {
    const onClick = vi.fn();
    const { getByRole } = render(<Basic onClick={onClick} />);
    await getByRole("button").click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("respects disabled state", async () => {
    const { getByRole } = render(<Disabled />);
    await expect.element(getByRole("button")).toBeDisabled();
  });
});
```

**Spec template — reference (data-fetching):**

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, waitFor } from "vitest-browser-react";
import { Basic } from "@/stories/<dir>/<slug>.stories";

describe("<ComponentName />", () => {
  it("renders the Basic story", async () => {
    const { getByText } = render(<Basic />);
    await waitFor(() =>
      expect.element(getByText(/<expected loaded data>/i)).toBeInTheDocument(),
    );
  });

  it("issues a getMany call to the dataProvider", async () => {
    const getMany = vi.fn().mockResolvedValue({ data: [{ id: 1, name: "X" }] });
    const { getByText } = render(<Basic dataProvider={{ getMany }} />);
    await waitFor(() => expect(getMany).toHaveBeenCalled());
  });
});
```

**Hybrid TDD discipline:**

- Atom: write the assertion that matches the story's visible output. Direct.
- Behavioral / reference: per superpowers:test-driven-development — write failing assertion first, run, confirm fail (means assertion is meaningful), then verify it passes against existing implementation. If it doesn't pass, the existing implementation is buggy — flag in subagent report rather than fix in this phase.

- [ ] **Step 1: Group placeholders by sidebar group**

Create `docs/scripts/group-placeholders.mjs`:

```js
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { buildGroupLookup } from "./component-to-group.mjs";

const repoRoot = resolve(import.meta.dirname, "../..");
const lookup = buildGroupLookup();

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (e.endsWith(".spec.tsx")) out.push(full);
  }
  return out;
}

const groups = {};
for (const f of walk(resolve(repoRoot, "src/components"))) {
  const src = readFileSync(f, "utf-8");
  if (!src.includes("expect(true).toBe(true)")) continue;
  const slug = f.split("/").pop().replace(".spec.tsx", "");
  const group = lookup.get(slug) ?? "UNGROUPED";
  groups[group] = groups[group] || [];
  groups[group].push(f);
}

for (const [g, files] of Object.entries(groups)) {
  console.log(`${g}: ${files.length}`);
  for (const f of files) console.log(`  ${f}`);
}
const total = Object.values(groups).flat().length;
console.error(`Total: ${total}`);
```

Run:

```bash
cd /Users/rin/GitHub/shadcn-admin-kit
node docs/scripts/group-placeholders.mjs > /tmp/placeholder-groups.txt
head -20 /tmp/placeholder-groups.txt
```

Expected: per-group counts summing to ~119.

- [ ] **Step 2: Dispatch one subagent per group (parallelize 2-3 at a time)**

For each group with placeholders, dispatch:

> "Replace placeholder specs for the <group> group. Files to fix: <list>. Each currently contains `expect(true).toBe(true)`. Replace with story-driven assertion per docs/superpowers/plans/2026-05-16-repo-cleanup.md Task 4.4. Choose the right template (atom / behavioral / reference) per component. For behavioral and reference templates, follow superpowers:test-driven-development — write the failing assertion first. Verify each fix with `pnpm vitest run --browser.headless <spec-path>`. Report any specs where the new assertion fails against the implementation (likely real bug — do NOT fix; flag for follow-up). Final check: `pnpm run lint` shows zero `no-tautological-expect` violations for your files."

Main thread: dispatch parallel where groups don't share files (most don't — admin/ subagent can run alongside leaflet/ subagent).

- [ ] **Step 3: Verify**

```bash
grep -rl "expect(true).toBe(true)" src/components/ | wc -l
```

Expected: `0`.

```bash
pnpm run lint 2>&1 | grep no-tautological-expect | wc -l
```

Expected: `0`.

### Task 4.5: Backfill missing specs

- [ ] **Step 1: List missing**

```bash
cd docs && pnpm run check-specs 2>&1 | grep "missing spec file" | head
```

- [ ] **Step 2: Dispatch subagents per group with missing specs**

Same pattern as Task 4.4 with prompt: "Create new spec files following templates".

### Task 4.6: Commit Phase 4

- [ ] **Step 1: Full verification (parallel)**

Run in a single Bash batch (multiple tool calls in one message):

```bash
pnpm run lint
pnpm run typecheck
pnpm vitest run --browser.headless
cd docs && pnpm run check-coverage
```

Expected: all PASS.

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "test: replace 119 placeholder specs with story-driven assertions + add no-tautological-expect guard

Replaces every spec file containing the placeholder pattern
expect(true).toBe(true) with story-driven assertions per AGENTS.md. Each
spec imports its component's stories and renders Basic + variants, asserting
on visible output (atoms) or callback behaviour (interactive components).
Adds a custom ESLint rule no-tautological-expect under eslint-rules/ that
flags any literal-vs-same-literal expect call so the placeholder pattern
cannot regress. Wires check-specs.mjs into check-coverage."
```

---

## Phase 5: Demo expansion

**Context:** Six commits. Five new resources (each commit adds one resource with full List/Show/Edit/Create + fake data seed). One cross-cutting commit wires CommandMenu, InPlaceEditor, ImageInput, TranslatableInputs, CsvImport, TreeList into existing demo resources.

### Task 5.1: Implement `check-demo-coverage.mjs`

**Files:**

- Create: `docs/scripts/check-demo-coverage.mjs`

- [ ] **Step 1: Write the check**

Create `docs/scripts/check-demo-coverage.mjs`:

```js
#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getPublicApi } from "./public-api.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const demoRoot = resolve(__dirname, "../../src/demo");

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(e)) out.push(full);
  }
  return out;
}

const allDemoSource = walk(demoRoot)
  .map((f) => readFileSync(f, "utf-8"))
  .join("\n");

const items = await getPublicApi();
const failures = [];

for (const item of items) {
  const importRe = new RegExp(`\\b${item.name}\\b`);
  if (!importRe.test(allDemoSource)) {
    failures.push(`${item.name}: not imported anywhere under src/demo/`);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} demo coverage failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`OK: ${items.length} public components imported in demo.`);
```

Add to package.json:

```json
"check-demo-coverage": "node scripts/check-demo-coverage.mjs",
```

### Task 5.2: Demo resource template

**Each new resource follows this skeleton.** Files (replace `<resource>` with the resource name):

```
src/demo/<resource>/index.ts        # Exports List, Show, Edit, Create
src/demo/<resource>/<Resource>List.tsx
src/demo/<resource>/<Resource>Show.tsx
src/demo/<resource>/<Resource>Edit.tsx
src/demo/<resource>/<Resource>Create.tsx
```

`index.ts` template:

```ts
export { <Resource>List as List } from "./<Resource>List";
export { <Resource>Show as Show } from "./<Resource>Show";
export { <Resource>Edit as Edit } from "./<Resource>Edit";
export { <Resource>Create as Create } from "./<Resource>Create";
```

Register in `src/demo/App.tsx`:

```tsx
import * as <resource> from "@/demo/<resource>";

<Resource name="<resource>" list={<resource>.List} show={<resource>.Show} edit={<resource>.Edit} create={<resource>.Create} />
```

Register fake data in `src/demo/dataProvider.ts`:

```ts
const <resource>Seed = [
  { id: 1, /* fields */ },
  // ...
];

// inside provider construction:
<resource>: <resource>Seed,
```

### Task 5.3: Add `/map` resource — Leaflet bundle

**One commit:** `feat(demo): add /map resource for Leaflet stack`

**Files (new):**

- `src/demo/map/index.ts`
- `src/demo/map/MapList.tsx`
- `src/demo/map/MapShow.tsx`
- `src/demo/map/MapEdit.tsx`
- `src/demo/map/MapCreate.tsx`

**Files (modify):**

- `src/demo/App.tsx` (register resource + wrap with `<LeafletAdmin>` + `<LeafletOsm>`)
- `src/demo/dataProvider.ts` (seed)

**Components to exercise:** LeafletAdmin, LeafletOsm, MapWithSearch, GeocodingInput, ReverseGeocodeField, Point Field+Input, MultiPoint Field+Input, LineString Field+Input, MultiLineString Field+Input, Polygon Field+Input, MultiPolygon Field+Input, GeometryCollection Field+Input, Feature Field+Input, FeatureCollection Field+Input, GeoJson Field+Input, BBox Field+Input, LatLng Field+Input, OsmFeatureAdd, OsmFeatureSubtract, SimplifyInput, useGeomanRHF.

**Domain:** "Points of Interest" — record shape:

```ts
{
  id: number,
  name: string,
  type: "park" | "lake" | "trail",
  location: GeoJSON.Point,
  area: GeoJSON.Polygon | null,
  bbox: GeoJSON.BBox,
}
```

- [ ] **Step 1: Seed data**

Add to `src/demo/dataProvider.ts`:

```ts
const places = [
  {
    id: 1,
    name: "Central Park",
    type: "park",
    location: { type: "Point", coordinates: [-73.965, 40.782] },
    area: null,
    bbox: [-73.98, 40.77, -73.95, 40.80],
  },
  { id: 2, name: "Hudson River", type: "lake", location: { type: "Point", coordinates: [-74.01, 40.72] }, area: null, bbox: [-74.02, 40.70, -74.00, 40.75] },
  { id: 3, name: "High Line", type: "trail", location: { type: "Point", coordinates: [-74.005, 40.748] }, area: null, bbox: [-74.01, 40.74, -73.99, 40.76] },
];

// in fakerest data:
places,
```

- [ ] **Step 2: Implement views**

Create `src/demo/map/MapList.tsx`:

```tsx
import { DataTable, LatLngField, List } from "@/components/admin";

export const MapList = () => (
  <List resource="places">
    <DataTable>
      <DataTable.Col source="name" />
      <DataTable.Col source="type" />
      <DataTable.Col source="location" label="Location">
        <LatLngField source="location" />
      </DataTable.Col>
    </DataTable>
  </List>
);
```

Create `src/demo/map/MapShow.tsx`:

```tsx
import {
  BBoxField,
  MapWithSearch,
  PolygonField,
  PointField,
  ReverseGeocodeField,
  Show,
  SimpleShowLayout,
  TextField,
} from "@/components/admin";

export const MapShow = () => (
  <Show resource="places">
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="type" />
      <PointField source="location" />
      <ReverseGeocodeField source="location" />
      <BBoxField source="bbox" />
      <PolygonField source="area" />
      <MapWithSearch />
    </SimpleShowLayout>
  </Show>
);
```

Create `src/demo/map/MapEdit.tsx`:

```tsx
import {
  BBoxInput,
  Edit,
  GeocodingInput,
  OsmFeatureAdd,
  OsmFeatureSubtract,
  PointInput,
  PolygonInput,
  SimpleForm,
  SimplifyInput,
  TextInput,
} from "@/components/admin";

export const MapEdit = () => (
  <Edit resource="places">
    <SimpleForm>
      <TextInput source="name" />
      <GeocodingInput source="address" />
      <PointInput source="location" />
      <BBoxInput source="bbox" />
      <PolygonInput source="area" />
      <SimplifyInput source="area" />
      <OsmFeatureAdd source="area" />
      <OsmFeatureSubtract source="area" />
    </SimpleForm>
  </Edit>
);
```

Create `src/demo/map/MapCreate.tsx`:

```tsx
import {
  Create,
  GeocodingInput,
  PointInput,
  PolygonInput,
  SimpleForm,
  TextInput,
} from "@/components/admin";

export const MapCreate = () => (
  <Create resource="places">
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="type" />
      <GeocodingInput source="address" />
      <PointInput source="location" />
      <PolygonInput source="area" />
    </SimpleForm>
  </Create>
);
```

Create `src/demo/map/index.ts`:

```ts
export { MapList as List } from "./MapList";
export { MapShow as Show } from "./MapShow";
export { MapEdit as Edit } from "./MapEdit";
export { MapCreate as Create } from "./MapCreate";
```

**Note:** secondary geometry types (MultiPoint, MultiLineString, LineString, MultiPolygon, GeometryCollection, Feature, FeatureCollection, GeoJson) must also appear somewhere under src/demo/map/ for `check-demo-coverage.mjs` to pass. Add them to MapShow + MapEdit as additional sections (e.g. a `<TabbedShowLayout>` with one tab per geometry type) or as a "kitchen sink" example tab. Same for `useGeomanRHF` hook — call inside a custom inner component within MapEdit.

- [ ] **Step 3: Wire into App.tsx**

```tsx
import { LeafletAdmin, LeafletOsm, Resource } from "@/components/admin";
import * as map from "@/demo/map";

// Wrap the Admin's children with leaflet providers, or use <LeafletAdmin> as the top-level
<Resource
  name="places"
  list={map.List}
  show={map.Show}
  edit={map.Edit}
  create={map.Create}
/>;
```

- [ ] **Step 4: Verify in dev server**

```bash
make run
```

Visit `/places`. Verify list, show, edit, create all render. No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/demo/ src/demo/dataProvider.ts
git commit -m "feat(demo): add /map resource for Leaflet stack

Exercises every component in src/components/leaflet/ via a 'Points of
Interest' resource: list (table with LatLngField), show (Point/Polygon/BBox
fields + ReverseGeocode + MapWithSearch), edit/create (every geometry
Input + GeocodingInput + SimplifyInput + OsmFeatureAdd/Subtract)."
```

### Task 5.4: Add `/planning` resource — Kanban + Calendar

**One commit:** `feat(demo): add /planning resource for kanban + calendar`

**Files (new):**

- `src/demo/planning/index.ts`
- `src/demo/planning/PlanningList.tsx` — uses `<KanbanBoard>` + `<CalendarList>` (toggleable view)
- `src/demo/planning/PlanningShow.tsx`
- `src/demo/planning/PlanningEdit.tsx`
- `src/demo/planning/PlanningCreate.tsx`

**Domain:** "Tasks" with `{ id, title, status: 'todo'|'doing'|'done', dueDate, assignee }`.

- [ ] **Step 1: Seed**

Add to `src/demo/dataProvider.ts`:

```ts
const tasks = [
  { id: 1, title: "Design landing page", status: "todo", dueDate: "2026-06-01", assignee: "Alice" },
  { id: 2, title: "Implement auth flow", status: "doing", dueDate: "2026-05-25", assignee: "Bob" },
  { id: 3, title: "Write integration tests", status: "doing", dueDate: "2026-05-28", assignee: "Carol" },
  { id: 4, title: "Deploy to staging", status: "done", dueDate: "2026-05-20", assignee: "Alice" },
  // add 6-8 more for variety
];

// in fakerest data:
tasks,
```

- [ ] **Step 2: Implement PlanningList with toggle**

Create `src/demo/planning/PlanningList.tsx`:

```tsx
import { useState } from "react";
import { CalendarList, KanbanBoard, List } from "@/components/admin";
import { Button } from "@/components/ui/button";

export const PlanningList = () => {
  const [view, setView] = useState<"kanban" | "calendar">("kanban");
  return (
    <List resource="tasks">
      <div className="mb-4 flex gap-2">
        <Button
          onClick={() => setView("kanban")}
          variant={view === "kanban" ? "default" : "outline"}
        >
          Kanban
        </Button>
        <Button
          onClick={() => setView("calendar")}
          variant={view === "calendar" ? "default" : "outline"}
        >
          Calendar
        </Button>
      </div>
      {view === "kanban" ? (
        <KanbanBoard groupBy="status" />
      ) : (
        <CalendarList dateField="dueDate" />
      )}
    </List>
  );
};
```

- [ ] **Step 3: Show/Edit/Create scaffolding**

Standard CRUD using TextInput, SelectInput, DateInput. Reuse `tasks` resource. Example PlanningEdit:

```tsx
import {
  DateInput,
  Edit,
  SelectInput,
  SimpleForm,
  TextInput,
} from "@/components/admin";

export const PlanningEdit = () => (
  <Edit resource="tasks">
    <SimpleForm>
      <TextInput source="title" />
      <SelectInput
        source="status"
        choices={[
          { id: "todo", name: "Todo" },
          { id: "doing", name: "Doing" },
          { id: "done", name: "Done" },
        ]}
      />
      <DateInput source="dueDate" />
      <TextInput source="assignee" />
    </SimpleForm>
  </Edit>
);
```

PlanningShow + PlanningCreate follow the same pattern.

- [ ] **Step 4: Wire into App.tsx + commit**

```bash
git add src/demo/planning/ src/demo/App.tsx src/demo/dataProvider.ts
git commit -m "feat(demo): add /planning resource for kanban + calendar

Exercises KanbanBoard (groupBy status) and CalendarList (dateField dueDate)
via a 'Tasks' resource with toggleable list view."
```

### Task 5.5: Add `/analytics` resource — Pivot + Charts + Timeline + Diff

**One commit:** `feat(demo): add /analytics resource for reports + activity`

**Files (new):** `src/demo/analytics/{index.ts, AnalyticsList.tsx, AnalyticsShow.tsx, AnalyticsEdit.tsx, AnalyticsCreate.tsx}`.

**Domain:** "Reports" — each report has aggregate data + a timeline of audit events + diff between two snapshots.

**Components:** PivotGrid (List view), DashboardCharts (List view secondary), RecordTimeline (Show), DiffViewer (Show).

- [ ] **Step 1: Seed**

```ts
const reports = [
  {
    id: 1,
    name: "Q1 Revenue",
    region: "EU",
    quarter: "Q1",
    revenue: 1200000,
    snapshot: { revenue: 1100000, customers: 450 },
    previousSnapshot: { revenue: 1050000, customers: 430 },
    timeline: [
      { date: "2026-04-01", event: "Created", actor: "Alice" },
      { date: "2026-04-05", event: "Updated revenue figures", actor: "Bob" },
    ],
  },
  // add 4-6 more with varying region/quarter for PivotGrid
];

// in fakerest data:
reports,
```

- [ ] **Step 2: Implement views**

`AnalyticsList.tsx`:

```tsx
import { DashboardCharts, List, PivotGrid } from "@/components/admin";

export const AnalyticsList = () => (
  <List resource="reports">
    <PivotGrid
      rows={["region"]}
      cols={["quarter"]}
      value="revenue"
      aggregate="sum"
    />
    <DashboardCharts />
  </List>
);
```

`AnalyticsShow.tsx`:

```tsx
import {
  DiffViewer,
  RecordTimeline,
  Show,
  SimpleShowLayout,
  TextField,
} from "@/components/admin";

export const AnalyticsShow = () => (
  <Show resource="reports">
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="region" />
      <RecordTimeline source="timeline" />
      <DiffViewer before="previousSnapshot" after="snapshot" />
    </SimpleShowLayout>
  </Show>
);
```

`AnalyticsEdit.tsx` + `AnalyticsCreate.tsx`: standard CRUD with TextInput, NumberInput, SelectInput. Mirror Task 5.4 pattern.

- [ ] **Step 3: Wire + commit**

```bash
git add src/demo/analytics/ src/demo/App.tsx src/demo/dataProvider.ts
git commit -m "feat(demo): add /analytics resource for reports + activity

Exercises PivotGrid + DashboardCharts (List), RecordTimeline + DiffViewer
(Show) via a 'Reports' resource with region/quarter aggregation."
```

### Task 5.6: Add `/workspace` resource — Presence + Permissions + Assistant

**One commit:** `feat(demo): add /workspace resource for collaboration features`

**Files (new):** `src/demo/workspace/{index.ts, WorkspaceList.tsx, WorkspaceShow.tsx, WorkspaceEdit.tsx, WorkspaceCreate.tsx}`.

**Domain:** "Documents" with collaborators, permissions, AI assistant for summarization.

**Components:** PresenceBar (Show top), PermissionMatrix (Edit), Assistant (Show sidebar).

- [ ] **Step 1: Seed**

```ts
const documents = [
  {
    id: 1,
    title: "Q2 Roadmap",
    body: "Planning Q2 priorities...",
    collaborators: [
      { id: "u1", name: "Alice", color: "#f43f5e" },
      { id: "u2", name: "Bob", color: "#3b82f6" },
    ],
    permissions: [
      { userId: "u1", read: true, write: true, share: true },
      { userId: "u2", read: true, write: true, share: false },
    ],
  },
  // add 3-5 more
];

// in fakerest data:
documents,
```

- [ ] **Step 2: Implement views**

`WorkspaceShow.tsx`:

```tsx
import {
  Assistant,
  PresenceBar,
  Show,
  SimpleShowLayout,
  TextField,
} from "@/components/admin";

export const WorkspaceShow = () => (
  <Show resource="documents">
    <PresenceBar source="collaborators" />
    <SimpleShowLayout>
      <TextField source="title" />
      <TextField source="body" />
    </SimpleShowLayout>
    <Assistant context="document" />
  </Show>
);
```

`WorkspaceEdit.tsx`:

```tsx
import {
  Edit,
  PermissionMatrix,
  SimpleForm,
  TextInput,
} from "@/components/admin";

export const WorkspaceEdit = () => (
  <Edit resource="documents">
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="body" multiline />
      <PermissionMatrix source="permissions" />
    </SimpleForm>
  </Edit>
);
```

`WorkspaceList.tsx` + `WorkspaceCreate.tsx`: standard CRUD.

- [ ] **Step 3: Wire + commit**

```bash
git add src/demo/workspace/ src/demo/App.tsx src/demo/dataProvider.ts
git commit -m "feat(demo): add /workspace resource for collaboration features

Exercises PresenceBar + PermissionMatrix + Assistant via a 'Documents'
resource with collaborator presence, per-user permissions matrix, and
AI summarization sidebar."
```

### Task 5.7: Add `/onboarding` resource — Wizard + Tour

**One commit:** `feat(demo): add /onboarding resource for wizard + tour`

**Files (new):** `src/demo/onboarding/{index.ts, OnboardingList.tsx, OnboardingShow.tsx, OnboardingCreate.tsx}` (no Edit — onboarding is one-shot).

**Domain:** "Onboarding flows" — sequence of wizard steps with an OnboardingTour overlay on first visit.

**Components:** WizardForm (Create), OnboardingTour (Show top, dismissable).

- [ ] **Step 1: Seed + implement views**

```ts
const onboardings = [
  { id: 1, user: "Alice", currentStep: 3, completed: false, startedAt: "2026-05-10" },
];

// in fakerest data:
onboardings,
```

`OnboardingCreate.tsx`:

```tsx
import { Create, SimpleForm, TextInput, WizardForm } from "@/components/admin";

export const OnboardingCreate = () => (
  <Create resource="onboardings">
    <WizardForm
      steps={[
        { label: "Profile", form: <TextInput source="name" /> },
        { label: "Preferences", form: <TextInput source="timezone" /> },
        { label: "Done", form: <TextInput source="referralCode" /> },
      ]}
    />
  </Create>
);
```

`OnboardingShow.tsx`:

```tsx
import {
  OnboardingTour,
  Show,
  SimpleShowLayout,
  TextField,
} from "@/components/admin";

export const OnboardingShow = () => (
  <Show resource="onboardings">
    <OnboardingTour
      steps={[
        {
          target: '[data-tour="welcome"]',
          content: "Welcome to the dashboard",
        },
        { target: '[data-tour="nav"]', content: "Browse resources here" },
      ]}
    />
    <SimpleShowLayout>
      <TextField source="user" />
      <TextField source="currentStep" />
    </SimpleShowLayout>
  </Show>
);
```

`OnboardingList.tsx`: standard List with DataTable.

- [ ] **Step 2: Wire + commit**

```bash
git add src/demo/onboarding/ src/demo/App.tsx src/demo/dataProvider.ts
git commit -m "feat(demo): add /onboarding resource for wizard + tour

Exercises WizardForm (3-step Create) + OnboardingTour (dismissable overlay
on Show) via an 'Onboardings' resource."
```

### Task 5.8: Cross-cutting wiring commit

**One commit:** `feat(demo): wire CommandMenu, InPlaceEditor, ImageInput, TranslatableInputs, CsvImport, TreeList into existing resources`

**Files (modify):**

- `src/demo/App.tsx` — add `<CommandMenu>` inside AppBar.
- `src/demo/customers/CustomerShow.tsx` — wrap a TextField in `<InPlaceEditor>`.
- `src/demo/products/ProductCreate.tsx` — add `<ImageInput>` for picture, `<TranslatableInputs locales={["en","fr"]}>` for description.
- `src/demo/products/ProductEdit.tsx` — same.
- `src/demo/customers/CustomerList.tsx` — add `<CsvImport>` as bulk action.
- `src/demo/categories/CategoryList.tsx` — replace flat List with `<TreeList parentSource="parentId">`.

- [ ] **Step 1: Implement each change inline (single PR)**

Example for CommandMenu in `src/demo/App.tsx`:

```tsx
import { CommandMenu } from "@/components/admin";

// Inside AppBar slot:
<AppBar>
  <CommandMenu />
  {/* existing AppBar contents */}
</AppBar>;
```

Example for InPlaceEditor in `src/demo/customers/CustomerShow.tsx`:

```tsx
import { InPlaceEditor, TextField, TextInput } from "@/components/admin";

<InPlaceEditor>
  <TextField source="name" />
  <TextInput source="name" />
</InPlaceEditor>;
```

Example for ImageInput + TranslatableInputs in `src/demo/products/ProductCreate.tsx`:

```tsx
import {
  ImageInput, ImageField, TextInput, TranslatableInputs,
} from "@/components/admin";

<ImageInput source="picture" label="Product picture">
  <ImageField source="src" title="title" />
</ImageInput>

<TranslatableInputs locales={["en", "fr"]} defaultLocale="en">
  <TextInput source="description" multiline />
</TranslatableInputs>
```

Example for CsvImport bulk action in `src/demo/customers/CustomerList.tsx`:

```tsx
import { CsvImport, List, DataTable } from "@/components/admin";

<List resource="customers" actions={<CsvImport resource="customers" />}>
  <DataTable>{/* cols */}</DataTable>
</List>;
```

Example for TreeList in `src/demo/categories/CategoryList.tsx`:

```tsx
import { TreeList, List } from "@/components/admin";

export const CategoryList = () => (
  <List resource="categories">
    <TreeList parentSource="parentId" labelSource="name" />
  </List>
);
```

- [ ] **Step 2: Verify each in dev server**

```bash
make run
```

- Open dashboard → press Cmd-K → CommandMenu opens.
- Open `/customers/<id>` → click name → inline edit.
- Open `/products/create` → see ImageInput + TranslatableInputs for description.
- Open `/customers` → see "Import CSV" bulk action.
- Open `/categories` → see tree-shaped list.

- [ ] **Step 3: Final check + commit**

```bash
cd docs && pnpm run check-coverage
```

Expected: PASS (every public component imported in demo).

```bash
git add .
git commit -m "feat(demo): wire CommandMenu, InPlaceEditor, ImageInput, TranslatableInputs, CsvImport, TreeList into existing resources

Final coverage commit for Phase 5: every public-API component is now
imported at least once under src/demo/. Adds CommandMenu globally,
InPlaceEditor to customer name, ImageInput + TranslatableInputs to product
forms, CsvImport bulk action to customer list, and replaces flat
CategoryList with TreeList."
```

---

## Final verification (post-Phase-5)

- [ ] **Step 1: Run full check chain**

```bash
make check-coverage
make lint
make typecheck
make test
make build
```

All must pass.

- [ ] **Step 2: Manual smoke test**

```bash
make run
make storybook   # in parallel terminal
make doc         # in parallel terminal
```

- Click 10 random sidebar entries in docs site.
- Open 10 random stories in Storybook.
- Click 5 random resources in demo.
- Verify CommandMenu (Cmd-K), TreeList (`/categories`), Map (`/places`) all work.

- [ ] **Step 3: Push branches per phase to separate PRs**

Per spec: one PR per phase. Push:

- `chore/ignore-screenshots` (Phase 0.5)
- `refactor/docs-kebab-case` (Phase 1)
- `docs/audit-typedoc` (Phase 2)
- `refactor/stories-org` (Phase 3)
- `test/spec-replacement` (Phase 4)
- `feat/demo-expansion` (Phase 5)

Each PR title mirrors the phase's main commit.

---

## Self-review notes

- **Spec coverage:** All five phases (0.5, 1, 2, 3, 4, 5) from spec have tasks. The Phase 4 `no-tautological-expect` ESLint rule is Task 4.1. Typedoc integration is Task 2.1-2.3. Astro redirects are Task 1.6. Shared `public-api.mjs` is Task 1.1.
- **Type consistency:** `getPublicApi()` returns `{name, slug, sourceDir, sourceFile}` — used by every later script with that exact shape. `enterpriseEntry(slug, label)` signature changed in Task 1.4 — every callsite needs the kebab slug as first arg.
- **Risk mitigation:** Phase 4 subagent fan-out is the riskiest step (parallel writes, 119 files). Group-per-subagent isolation means no two subagents write to the same file. Each subagent must run lint after its batch to catch regressions before main thread reviews.
- **Wall-clock estimate:** Phase 0.5: 5 min. Phase 1: 1-2 hours. Phase 2: 4-6 hours (typedoc shake-out + ~50 doc pages to flesh out). Phase 3: 3-4 hours (move + 38 placeholders). Phase 4: 4-6 hours (119 specs, parallel subagents). Phase 5: 6-8 hours (5 resources + cross-cutting). Total: ~20-25 hours of focused work.
