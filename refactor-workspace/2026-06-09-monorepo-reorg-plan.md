# Monorepo Reorg Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the single-package repo into a pnpm+turborepo monorepo — `apps/{demo,website,docs}` + `packages/admin-kit` — and replace eslint+prettier with Biome, with zero behavior change (full suite green, registry output byte-identical).

**Architecture:** `packages/admin-kit` is a JIT (no-build) library package named `shadcn-admin-kit`; its source keeps `@/` internal imports verbatim (shadcn registry constraint). Apps import it by package name, resolved via Vite alias + tsconfig paths (no exports map this pass). Turborepo runs package tasks; the Makefile survives as the CI entry point and `public/` deploy assembler. Design artifacts: `refactor-workspace/{trace,goals,assessment,map}.md`.

**Tech Stack:** pnpm workspaces, Turborepo 2, Vite 8, Vitest 3 (browser/playwright), Storybook 10, Astro (docs), Biome 2, Tailwind v4.

**Conventions for all tasks:**
- Work on branch `monorepo-reorg` (created in Task 1). Never commit to main.
- Use `git mv` for every move (history preservation).
- Versions in new package.json files: copy the exact ranges currently in root `package.json` (they are listed per task below).
- macOS sed: always `sed -i ''`.
- Tasks 2–6 are structural (tree is intentionally unbuildable between them); per-task verification is grep/structure-level. Task 7 is the install+typecheck gate; Task 8 the behavior gate.

---

### Task 1: Baseline capture + branch + root scaffold

**Files:**
- Create: `turbo.json`, `tsconfig.base.json`
- Modify: `package.json` (root), `pnpm-workspace.yaml`, `.gitignore`

- [ ] **Step 1: Capture registry baseline on clean main**

```bash
cd /Users/rin/GitHub/shadcn-admin-kit
git status --porcelain   # expect empty
make build-registry
rm -rf /tmp/registry-baseline && cp -r public/r /tmp/registry-baseline
ls /tmp/registry-baseline | head -5
```
Expected: r/*.json files copied (admin.json, extras.json, …).

- [ ] **Step 2: Create branch**

```bash
git checkout -b monorepo-reorg
```

- [ ] **Step 3: Rewrite `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 4: Create `turbo.json`**

```jsonc
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "registry:generate": {
      "outputs": ["registry.json"]
    },
    "registry:build": {
      "dependsOn": ["registry:generate"],
      "outputs": ["dist/r/**"]
    },
    "typecheck": {},
    "test": {},
    "check-coverage": {
      "inputs": [
        "$TURBO_DEFAULT$",
        "$TURBO_ROOT$/packages/admin-kit/src/**",
        "$TURBO_ROOT$/packages/admin-kit/registry.json",
        "$TURBO_ROOT$/apps/demo/src/**"
      ]
    },
    "dev": { "cache": false, "persistent": true },
    "storybook": { "cache": false, "persistent": true }
  }
}
```

- [ ] **Step 5: Create `tsconfig.base.json`** (extracted from current `tsconfig.app.json` compilerOptions, minus paths/include/buildinfo)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "removeComments": false
  }
}
```

- [ ] **Step 6: Rewrite root `package.json`** (full replacement — deps move out in Tasks 2–5; biome added in Task 9)

```json
{
  "name": "shadcn-admin-kit-monorepo",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "turbo run dev --filter=shadcn-admin-kit-demo",
    "build": "turbo run build",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "storybook": "pnpm --filter shadcn-admin-kit run storybook",
    "knip": "knip"
  },
  "devDependencies": {
    "knip": "^5.46.0",
    "turbo": "^2.5.0",
    "typescript": "~5.7.2"
  },
  "packageManager": "pnpm@10.14.0-0+sha512.2cd47a0cbf5f1d1de7693a88307a0ede5be94e0d3b34853d800ee775efbea0650cb562b77605ec80bc8d925f5cd27c4dfe8bb04d3a0b76090784c664450d32d6"
}
```
(`knip` version: copy current installed major if present in lockfile, else `^5`. Keep the exact `packageManager` line shown — it is the current one.)

- [ ] **Step 7: Append to `.gitignore`**

```
.turbo
```

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "chore(monorepo): root scaffold — workspace globs, turbo.json, tsconfig.base, root package shell"
```

---

### Task 2: Extract `packages/admin-kit` (the library)

**Files:**
- Move: `src/{components,hooks,lib,test,assets,examples,index.css}` → `packages/admin-kit/src/…`
- Move: `tsconfig.app.json` → `packages/admin-kit/tsconfig.json`; `vitest.config.ts`, `vitest.global-setup.ts`, `vitest.browser-setup.ts`, `.storybook/`, `components.json`, `registry.json`, `package-test.json`, `scripts/{registry.config.mjs,generate-registry.mjs,build_registry.mjs,test_registry.sh}` → `packages/admin-kit/…`
- Create: `packages/admin-kit/package.json`
- Modify: `packages/admin-kit/scripts/build_registry.mjs`, `packages/admin-kit/scripts/test_registry.sh`, `packages/admin-kit/tsconfig.json`

- [ ] **Step 1: Move library source + harness configs**

```bash
mkdir -p packages/admin-kit/src packages/admin-kit/scripts
git mv src/components src/hooks src/lib src/test src/assets src/examples src/index.css src/vite-env.d.ts src/vitest-env.d.ts packages/admin-kit/src/
git mv tsconfig.app.json packages/admin-kit/tsconfig.json
git mv vitest.config.ts vitest.global-setup.ts vitest.browser-setup.ts packages/admin-kit/
git mv .storybook packages/admin-kit/.storybook
git mv components.json registry.json package-test.json packages/admin-kit/
git mv scripts/registry.config.mjs scripts/generate-registry.mjs scripts/build_registry.mjs scripts/test_registry.sh packages/admin-kit/scripts/
```
Note: if `git mv` errors on any file not present (e.g. `src/vitest-env.d.ts`), check with `ls src/` and move what exists; the two `*-env.d.ts` files must end up in `packages/admin-kit/src/`.

- [ ] **Step 2: Check `scripts/`残 — anything left moves or is accounted for**

```bash
ls scripts/ 2>/dev/null
```
Expected: empty or only files NOT in the registry pipeline. If empty: `rmdir scripts`. If other files exist, list them and decide root-vs-package by what they read (read each; scripts reading library src → `git mv` into `packages/admin-kit/scripts/`).

- [ ] **Step 3: Create `packages/admin-kit/package.json`**

react/react-dom/ra-core are **peerDependencies** (library convention — prevents dual-React across the workspace); the test/storybook harness gets them via devDependencies. Spec/story-only imports (vitest, mock-socket, ra-data-*) are devDeps, NOT deps.

```json
{
  "name": "shadcn-admin-kit",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "registry:generate": "node ./scripts/generate-registry.mjs",
    "registry:build": "node ./scripts/build_registry.mjs",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test": "vitest run --browser.headless",
    "test:watch": "vitest watch --browser.headless",
    "test:browser": "vitest watch",
    "typecheck": "tsc --noEmit -p tsconfig.json"
  },
  "peerDependencies": {
    "@supabase/supabase-js": "^2.48.1",
    "openapi-types": "^12.1.3",
    "ra-core": "^5.14.0",
    "ra-supabase-core": "^3.5.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "peerDependenciesMeta": {
    "@supabase/supabase-js": { "optional": true },
    "openapi-types": { "optional": true },
    "ra-supabase-core": { "optional": true }
  },
  "dependencies": {
    "@base-ui/react": "^1.4.1",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@geoman-io/leaflet-geoman-free": "^2.19.3",
    "@hookform/resolvers": "^5.2.2",
    "@mdxeditor/editor": "^3.46.0",
    "@monaco-editor/react": "^4.7.0",
    "@tanstack/react-query": "^5.83.0",
    "@tiptap/core": "^3.20.0",
    "@tiptap/extension-code-block-lowlight": "^3.20.0",
    "@tiptap/extension-color": "^3.20.0",
    "@tiptap/extension-drag-handle-react": "^3.23.6",
    "@tiptap/extension-horizontal-rule": "^3.20.0",
    "@tiptap/extension-image": "^3.20.0",
    "@tiptap/extension-text-style": "^3.20.0",
    "@tiptap/extension-typography": "^3.20.0",
    "@tiptap/extensions": "^3.20.0",
    "@tiptap/pm": "^3.20.0",
    "@tiptap/react": "^3.20.0",
    "@tiptap/starter-kit": "^3.20.0",
    "@tiptap/suggestion": "^3.23.6",
    "@turf/area": "^7.3.5",
    "@turf/bbox": "^7.3.5",
    "@turf/buffer": "^7.3.5",
    "@turf/difference": "^7.3.5",
    "@turf/helpers": "^7.3.5",
    "@turf/simplify": "^7.3.5",
    "@turf/union": "^7.3.5",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "cronstrue": "^3.14.0",
    "date-fns": "^4.1.0",
    "diacritic": "^0.0.2",
    "dompurify": "^3.4.2",
    "embla-carousel-react": "^8.6.0",
    "html-react-parser": "^6.1.0",
    "inflection": "^3.0.2",
    "input-otp": "^1.4.2",
    "leaflet": "^1.9.4",
    "libphonenumber-js": "^1.13.2",
    "lodash": "^4.18.1",
    "lowlight": "^3.3.0",
    "lucide-react": "^0.506.0",
    "monaco-editor": "^0.52.2",
    "next-themes": "^0.4.6",
    "osmtogeojson": "3.0.0-beta.5",
    "papaparse": "^5.5.3",
    "query-string": "^9.2.2",
    "radix-ui": "^1.4.3",
    "react-day-picker": "^10.0.0",
    "react-dropzone": "^14.3.8",
    "react-hook-form": "^7.71.1",
    "react-leaflet": "^5.0.0",
    "react-leaflet-geoman-v2": "1.1.1",
    "react-medium-image-zoom": "^5.4.1",
    "react-resizable-panels": "^4.11.1",
    "react-router": "^7.12.0",
    "recharts": "3.8.0",
    "sonner": "^2.0.3",
    "tailwind-merge": "^3.5.0",
    "vaul": "^1.1.2",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@chromatic-com/storybook": "^4.1.3",
    "@storybook/addon-a11y": "^10.2.0",
    "@storybook/addon-docs": "^10.2.0",
    "@storybook/addon-vitest": "^10.2.0",
    "@storybook/react-vite": "^10.2.12",
    "@supabase/supabase-js": "^2.105.4",
    "@tailwindcss/vite": "^4.3.0",
    "@types/diacritic": "^0.0.0",
    "@types/leaflet": "^1.9.21",
    "@types/lodash": "^4.17.24",
    "@types/node": "^22.19.12",
    "@types/papaparse": "^5.5.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^4.7.0",
    "@vitest/browser": "^3.2.4",
    "mock-socket": "^9.3.1",
    "openapi-types": "^12.1.3",
    "playwright": "^1.57.0",
    "ra-core": "^5.14.0",
    "ra-data-fakerest": "^5.14.0",
    "ra-data-json-server": "^5.13.6",
    "ra-i18n-polyglot": "^5.14.0",
    "ra-language-english": "^5.14.0",
    "ra-language-french": "^5.14.0",
    "ra-supabase-core": "^3.5.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-error-boundary": "^6.1.0",
    "shadcn": "3.8.5",
    "storybook": "^10.2.12",
    "tailwindcss": "^4.3.0",
    "tw-animate-css": "^1.4.0",
    "typescript": "~5.7.2",
    "vite": "^8.0.6",
    "vitest": "^3.2.4",
    "vitest-browser-react": "^1.0.1"
  }
}
```

- [ ] **Step 4: Point package tsconfig at the base**

Edit `packages/admin-kit/tsconfig.json`: add `"extends": "../../tsconfig.base.json"` as the first key, then DELETE every compilerOption now provided by the base (target, useDefineForClassFields, lib, module, skipLibCheck, moduleResolution, allowImportingTsExtensions, isolatedModules, moduleDetection, noEmit, jsx, strict, noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch, noUncheckedSideEffectImports, removeComments). Result:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Registry output → package-local `dist/r`**

In `packages/admin-kit/scripts/build_registry.mjs` line ~18:

```js
// old
const outputDir = path.resolve(cwd, "public/r");
// new
const outputDir = path.resolve(cwd, "dist/r");
```

- [ ] **Step 6: Fix `test_registry.sh` paths**

In `packages/admin-kit/scripts/test_registry.sh`:
- `cp ./package-test.json …` → `cp ./package-test.json …` (file moved to package root; script will run from package root — verify the relative path matches where the file now sits, i.e. `./package-test.json` from `packages/admin-kit/`).
- `python3 -m http.server -d ./public 8080` → `python3 -m http.server -d ./dist 8080` (registry now under `dist/r`; URLs `http://localhost:8080/r/*.json` keep working).

- [ ] **Step 7: Structural verify** (no install yet — greps only)

```bash
ls src 2>&1                                  # expect: demo, main.tsx ONLY (rest moved)
grep -rn "from \"@/demo" packages/admin-kit/src && echo "LEAK" || echo "clean"
grep -c "sourceDirs" packages/admin-kit/scripts/registry.config.mjs   # expect: 11-ish, file intact
```
Expected: `clean` (library never imports demo), config intact. `generate-registry.mjs` needs NO edit — its `repoRoot = resolve(scriptDir, "..")` now lands on the package root, where `registry.json` + `src/` live. Same for `.storybook/main.ts` (`../src/**`) and `preview.ts` (`../src/index.css`) — relative refs still true inside the package.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat(monorepo): extract packages/admin-kit — library src, vitest, storybook, registry pipeline"
```

---

### Task 3: Extract `apps/demo`

**Files:**
- Move: `src/demo/*` → `apps/demo/src/*`; `src/main.tsx` → `apps/demo/src/main.tsx`; `index.html`, `vite.config.ts` → `apps/demo/`; `tsconfig.node.json` → `apps/demo/tsconfig.node.json`
- Create: `apps/demo/package.json`, `apps/demo/src/index.css`, `apps/demo/tsconfig.json`, `apps/demo/tsconfig.app.json`
- Modify: `apps/demo/vite.config.ts`, `apps/demo/src/main.tsx`, `apps/demo/index.html` is move-only; demo source import rewrite

- [ ] **Step 1: Move files**

```bash
mkdir -p apps/demo
git mv src/demo apps/demo/src
git mv src/main.tsx apps/demo/src/main.tsx
git mv index.html vite.config.ts apps/demo/
git mv tsconfig.node.json apps/demo/tsconfig.node.json
rmdir src
```

- [ ] **Step 2: Create `apps/demo/package.json`** (deps = audited bare imports of demo source)

```json
{
  "name": "shadcn-admin-kit-demo",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.app.json"
  },
  "dependencies": {
    "data-generator-retail": "^5.13.0",
    "date-fns": "^4.1.0",
    "inflection": "^3.0.2",
    "lucide-react": "^0.506.0",
    "ra-core": "^5.14.0",
    "ra-data-fakerest": "^5.14.0",
    "ra-i18n-polyglot": "^5.14.0",
    "ra-language-english": "^5.14.0",
    "ra-language-french": "^5.14.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-error-boundary": "^6.1.0",
    "react-router": "^7.12.0",
    "shadcn-admin-kit": "workspace:*",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.0",
    "@types/node": "^22.19.12",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^4.7.0",
    "tailwindcss": "^4.3.0",
    "typescript": "~5.7.2",
    "vite": "^8.0.6"
  }
}
```

- [ ] **Step 3: Rework `apps/demo/vite.config.ts`** (full replacement)

```ts
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const adminKitSrc = path.resolve(__dirname, "../../packages/admin-kit/src");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      // package-name imports used by demo source
      { find: /^shadcn-admin-kit\/(.+)$/, replacement: `${adminKitSrc}/$1` },
      // the library's own internal `@/` imports (shadcn registry form)
      { find: "@", replacement: adminKitSrc },
    ],
  },
  base: "./",
});
```

- [ ] **Step 4: tsconfigs**

`apps/demo/tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`apps/demo/tsconfig.app.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "baseUrl": ".",
    "paths": {
      "shadcn-admin-kit/*": ["../../packages/admin-kit/src/*"],
      "@/*": ["../../packages/admin-kit/src/*"]
    }
  },
  "include": ["src", "../../packages/admin-kit/src"]
}
```
(`include` pulls the package source into the program so paths-resolved imports typecheck; the package has its own stricter standalone check.)

`apps/demo/tsconfig.node.json`: already moved verbatim — no edits (covers `vite.config.ts`, self-contained options).

- [ ] **Step 5: Create `apps/demo/src/index.css`** (Tailwind v4 cross-package scanning — THE gotcha)

```css
@import "../../../packages/admin-kit/src/index.css";
@source "../../../packages/admin-kit/src";
```
Relative (not aliased) on purpose: guaranteed through Tailwind's own resolver. Without the `@source`, classes used only inside package components are missing from the demo build.

- [ ] **Step 6: Fix `apps/demo/src/main.tsx`**

```ts
// old
import SelectedApp from "./demo/App";
// new
import SelectedApp from "./App";
```
(`import "./index.css"` line stays — it now hits the new thin css.)

- [ ] **Step 7: Rewrite demo's `@/demo/` self-imports (2 files) to relative**

In `apps/demo/src/products/ProductEdit.tsx` and `apps/demo/src/products/ProductList.tsx`:
```ts
// old
import type { Product, Review, Customer } from "@/demo/types";
// new
import type { Product, Review, Customer } from "../types";
```
(Adjust the named imports per file — keep each file's existing list.)

- [ ] **Step 8: Bulk-rewrite library imports to package-name form**

```bash
grep -rl '"@/' apps/demo/src | xargs sed -i '' 's|"@/|"shadcn-admin-kit/|g'
grep -rn '"@/' apps/demo/src | wc -l
```
Expected count: **0**. (The `@/demo` cases were already fixed in Step 7; this catches `@/components`, `@/lib`, `@/hooks` — with and without trailing path.)

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat(monorepo): extract apps/demo — name-form imports, tailwind @source for package src"
```

---

### Task 4: Extract `apps/website`

**Files:**
- Move: `website/` → `apps/website/`
- Create: `apps/website/package.json`

- [ ] **Step 1: Move**

```bash
git mv website apps/website
```

- [ ] **Step 2: Create `apps/website/package.json`** (deps = audited bare imports of website/src)

```json
{
  "name": "shadcn-admin-kit-website",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5174",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.app.json"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.506.0",
    "ra-core": "^5.14.0",
    "radix-ui": "^1.4.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-shiki": "^0.7.4",
    "tailwind-merge": "^3.5.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.0",
    "@tailwindcss/vite": "^4.3.0",
    "@types/node": "^22.19.12",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^4.7.0",
    "postcss": "^8.4.40",
    "tailwindcss": "^4.3.0",
    "tw-animate-css": "^1.4.0",
    "typescript": "~5.7.2",
    "vite": "^8.0.6"
  }
}
```

- [ ] **Step 3: Verify website self-containment + config drift**

```bash
grep -rn '\.\./src\|\.\./\.\./src' apps/website/src && echo "LEAK" || echo "clean"
grep -n "root:\|__dirname" apps/website/vite.config.ts
cat apps/website/tsconfig.json apps/website/tsconfig.app.json | grep -n "extends\|include\|paths" 
grep -rn "tw-animate\|@import" apps/website/src/*.css apps/website/src/**/*.css 2>/dev/null | head
```
Expected: `clean`; `root: __dirname` still self-referential after the move (fine). If website css does NOT import `tw-animate-css`, delete it from devDependencies above. Website tsconfigs stay verbatim (self-contained — do not force the base).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(monorepo): extract apps/website with own manifest"
```

---

### Task 5: Move `docs/` → `apps/docs` + retarget cross-tree reads

**Files:**
- Move: `docs/` → `apps/docs/`
- Modify: `apps/docs/scripts/check-demo-coverage.mjs`, every `apps/docs/scripts/*.mjs` + typedoc config with a `src/` or `../..`-root assumption

- [ ] **Step 1: Move**

```bash
git mv docs apps/docs
```

- [ ] **Step 2: Find every stale path in docs tooling**

```bash
grep -rn '"\.\./\.\."\|src/components\|src/demo\|resolve(repoRoot' apps/docs/scripts/*.mjs apps/docs/*.json apps/docs/*.mjs | grep -v node_modules
```
This is the authoritative hit list. Apply these two rewrite rules to every hit:
1. repo-root derivation: `resolve(__dirname, "../..")` → `resolve(__dirname, "../../..")` (scripts are one level deeper now).
2. library/demo paths: `src/components/…` → `packages/admin-kit/src/components/…`; `src/demo` → `apps/demo/src`; `registry.json` at repo root → `packages/admin-kit/registry.json`.

Known concrete instances (from trace — there may be more, the grep decides):
- `check-demo-coverage.mjs:20-21`: `repoRoot = resolve(__dirname, "../..")` stays as the DERIVATION but must point at actual repo root → becomes `resolve(__dirname, "../../..")`; `demoRoot = resolve(repoRoot, "src/demo")` → `resolve(repoRoot, "apps/demo/src")`.
- `check-stories.mjs:34`: story path template → `packages/admin-kit/src/components/${item.sourceDir}/${item.slug}.stories.tsx`.
- `check-specs.mjs`: same two rules (root + `src/components` prefix).
- `public-api.mjs` / `public-api.typedoc.json` / `typedoc.json`: entry points referencing `../src/…` → `../../packages/admin-kit/src/…`.

- [ ] **Step 3: Verify zero stale refs**

```bash
grep -rn 'src/components\|src/demo' apps/docs/scripts/*.mjs apps/docs/*.json | grep -v "packages/admin-kit\|apps/demo\|node_modules" && echo "STALE" || echo "clean"
```
Expected: `clean`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(monorepo): move docs to apps/docs, retarget coverage checks at new tree"
```

---

### Task 6: Makefile + knip + root cleanup

**Files:**
- Modify: `Makefile`, `knip.json`
- Delete: nothing yet (eslint/prettier die in Task 9)

- [ ] **Step 1: Rewrite `Makefile`** (full replacement — same target NAMES so CI yml needs zero edits)

```make
.PHONY: help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: package.json ## Install dependencies
	@pnpm install

install-browsers: ## Install Playwright browsers
	@pnpm --filter shadcn-admin-kit exec playwright install --with-deps chromium

run:
	pnpm exec turbo run dev --filter=shadcn-admin-kit-demo

start: run

lint: ## Run linter
	pnpm run lint

build-demo: ## Build the demo
	pnpm exec turbo run build --filter=shadcn-admin-kit-demo
	rm -rf ./public/demo
	cp -r apps/demo/dist ./public/demo

build-registry: ## Build the UI registry
	pnpm exec turbo run registry:build --filter=shadcn-admin-kit
	rm -rf ./public/r
	cp -r packages/admin-kit/dist/r ./public/r

test:
	pnpm exec turbo run test

test-watch: ## Run tests in watch mode
	pnpm --filter shadcn-admin-kit run test:watch

test-browser: ## Run tests in browser mode
	pnpm --filter shadcn-admin-kit run test:browser

test-registry: ## Test the UI registry
	cd packages/admin-kit && ./scripts/test_registry.sh

serve-registry: ## Serve the UI registry locally
	python3 -m http.server -d ./public 8080

clear-registry: ## Clear the UI registry
	rm -rf ./public/r packages/admin-kit/dist/r

storybook: ## Start the storybook
	pnpm --filter shadcn-admin-kit run storybook

run-website: ## Run the website in development mode
	pnpm exec turbo run dev --filter=shadcn-admin-kit-website

start-website: run-website

build-website: ## Build the website
	pnpm exec turbo run build --filter=shadcn-admin-kit-website
	rm -rf ./public/assets ./public/img ./public/index.html
	cp -r apps/website/dist/* ./public/

build: build-website build-doc build-demo build-registry ## Build all components

typecheck: ## Run TypeScript type checking
	@pnpm exec turbo run typecheck

doc: ## launch doc web server
	@pnpm --filter shadcn-admin-kit-doc run dev

check-doc: ## Check the doc sidebar has no orphan pages
	@pnpm --filter shadcn-admin-kit-doc run check-sidebar

check-coverage: ## Run every docs/stories/specs/demo coverage check
	@pnpm --filter shadcn-admin-kit-doc run check-coverage

build-doc: check-coverage ## Build the doc website
	pnpm exec turbo run build --filter=shadcn-admin-kit-doc
	rm -rf ./public/docs
	cp -r apps/docs/dist ./public/docs
```
Notes: `cp -r` not `mv` (mv would gut turbo's cached `dist/`, breaking cache restores). `registry:build` task depends on `registry:generate` via turbo.json, so generate runs automatically. Docs package name `shadcn-admin-kit-doc` is its EXISTING name — don't rename.

- [ ] **Step 2: Rewrite `knip.json` workspace-aware**

```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "ignore": ["public/**", "**/*.d.ts", ".claude/**"],
  "ignoreDependencies": ["@types/*"],
  "ignoreExportsUsedInFile": true,
  "workspaces": {
    "packages/admin-kit": {
      "entry": [
        "src/components/admin/**/*.{ts,tsx}!",
        "src/components/extras/**/*.{ts,tsx}!",
        "src/components/leaflet/**/*.{ts,tsx}!",
        "src/components/supabase/**/*.{ts,tsx}!",
        "src/components/csv-import/**/*.{ts,tsx}!",
        "src/components/rich-text-input/**/*.{ts,tsx}!",
        "src/components/ui/**/*.{ts,tsx}!",
        "src/components/**/*.spec.{ts,tsx}",
        "src/components/**/*.stories.{ts,tsx}",
        "src/examples/**/*.{ts,tsx}",
        "src/lib/**/*.{ts,tsx}!",
        "scripts/**/*.{js,mjs}"
      ],
      "project": ["src/**/*.{ts,tsx}", "scripts/**/*.{js,mjs}"]
    },
    "apps/demo": {
      "entry": ["src/main.tsx", "src/App.*.tsx"],
      "project": ["src/**/*.{ts,tsx}"]
    },
    "apps/website": {
      "entry": ["src/**/*.{ts,tsx}"],
      "project": ["src/**/*.{ts,tsx}"]
    },
    "apps/docs": { "ignore": ["**"] }
  }
}
```
(Old config ignored `docs/**` entirely — `apps/docs` keeps that status. Old `src/demo` + `src/stories` entries map to the demo workspace / are gone.)

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore(monorepo): Makefile targets via turbo + assembly; knip workspaces"
```

---

### Task 7: Install + typecheck gate (first full-tree verification)

- [ ] **Step 1: Fresh install, regenerate lockfile**

```bash
cd /Users/rin/GitHub/shadcn-admin-kit
pnpm install
```
Expected: lockfile rewrites with 4 workspace projects + root. Failures here = version typo in a new package.json — fix and re-run.

- [ ] **Step 2: Typecheck everything**

```bash
pnpm exec turbo run typecheck
```
Expected: 3 tasks (admin-kit, demo, website — docs defines no typecheck script, turbo skips it), all green. Likely failure classes + fixes:
- demo: missed `@/` import → re-run Task 3 Step 8 grep; or missing dep → add to demo package.json from the root version table.
- admin-kit: spec imports a dep not in devDeps → add it (copy version from old root package.json in git history: `git show main:package.json`).
- website: postcss/tailwind plugin mismatch → align devDeps with what `postcss.config.js` references.

- [ ] **Step 3: Single-React sanity**

```bash
pnpm why react
```
Expected: output names exactly one react version (19.x) across all workspace projects. Two distinct versions = peer wiring bug; fix by aligning ranges.

- [ ] **Step 4: Commit lockfile + any fixes**

```bash
git add -A && git commit -m "chore(monorepo): install — workspace lockfile, dep fixes from typecheck gate"
```

---

### Task 8: Behavior gate — tests, registry equivalence, builds, smoke

- [ ] **Step 1: Full test suite (browser provider — background it, ~2-4 min)**

```bash
pnpm exec turbo run test
```
Expected: same pass count as main (1035 specs, 1 known pre-existing date flake in `calendar-list.spec` allowed). New failures = path/alias regression — diagnose before proceeding.

- [ ] **Step 2: Registry byte-equivalence vs baseline**

```bash
pnpm --filter shadcn-admin-kit run registry:generate
git -C packages/admin-kit diff --stat registry.json     # expect: no diff (or whitespace-only)
pnpm exec turbo run registry:build --filter=shadcn-admin-kit
diff -r /tmp/registry-baseline packages/admin-kit/dist/r
```
Expected: `diff` exits silent (byte-identical). Any content diff = generator path leak — STOP and fix (`registry.config.mjs` sourceDirs or homepage drifted).

- [ ] **Step 3: All builds + public/ assembly**

```bash
make build
ls public               # expect: index.html, assets/, img/, demo/, docs/, r/ (same shape as before)
ls public/demo/index.html public/docs/index.html public/r/admin.json
```
Expected: all exist; `make build` exits 0.

- [ ] **Step 4: Storybook boots from package**

```bash
pnpm --filter shadcn-admin-kit exec storybook build --quiet
```
Expected: builds clean (exercises stories glob + preview css path post-move). Build output lands in `packages/admin-kit/storybook-static` (gitignored).

- [ ] **Step 5: Demo visual smoke — Tailwind cross-package scan check**

Start `pnpm --filter shadcn-admin-kit-demo run dev`, open the orders/customers list, confirm styled shadcn UI (cards, tables, buttons have real styling — NOT unstyled HTML). Unstyled output = `@source` path wrong in `apps/demo/src/index.css`. Then stop the server.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A && git commit -m "test(monorepo): behavior gate — suite, registry equivalence, builds, storybook, demo smoke"
```

---

### Task 9: Biome switch (replaces eslint + prettier)

**Files:**
- Create: `biome.json`, `biome-rules/no-tautological-expect.grit`
- Delete: `eslint.config.js`, `.prettierrc.json`, `eslint-rules/`
- Modify: root `package.json` (scripts + devDeps)

- [ ] **Step 1: Install Biome, drop eslint/prettier toolchain**

```bash
pnpm add -w -D @biomejs/biome
```
Then edit root `package.json` scripts — add:
```json
"lint": "biome check .",
"format": "biome check --write ."
```
(eslint/prettier deps were already left out of the new root manifest in Task 1; verify none re-entered via lockfile: `grep -n "eslint\|prettier" package.json` → expect no hits.)

- [ ] **Step 2: Create `biome.json`**

Rule names/locations below target Biome 2.x. FIRST run `pnpm exec biome --version`, then verify each rule's group with `pnpm exec biome explain <ruleName>` — if a rule lives in a different group in the installed version (e.g. `noRestrictedImports` in `nursery`), move it to that group rather than dropping it.

```jsonc
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": {
    "includes": ["**", "!public/**", "!**/dist/**", "!**/storybook-static/**", "!apps/docs/.astro/**"]
  },
  "formatter": { "enabled": true, "indentStyle": "space" },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "warn",
        "useHookAtTopLevel": "error"
      },
      "suspicious": {
        "noConsole": { "level": "error", "options": { "allow": ["warn", "error"] } }
      },
      "style": {
        "useComponentExportOnlyModules": "warn",
        "noRestrictedImports": {
          "level": "error",
          "options": {
            "paths": {
              "radix-ui": "Import from the package's components/ui/* instead. Primitive libraries (radix-ui, @base-ui/react) must only be referenced inside components/ui/ so the primitive backend can be swapped in one place.",
              "@base-ui/react": "Import from the package's components/ui/* instead. Primitive libraries (radix-ui, @base-ui/react) must only be referenced inside components/ui/ so the primitive backend can be swapped in one place."
            }
          }
        }
      }
    }
  },
  "overrides": [
    {
      "includes": ["packages/admin-kit/src/components/ui/**", "apps/website/src/components/ui/**"],
      "linter": { "enabled": false },
      "formatter": { "enabled": false }
    },
    {
      "includes": ["packages/admin-kit/src/components/block-editor/blocks/**", "packages/admin-kit/src/components/block-editor/extensions/**"],
      "linter": { "rules": { "style": { "useComponentExportOnlyModules": "off" } } }
    }
  ],
  "plugins": ["./biome-rules/no-tautological-expect.grit"]
}
```
Decisions encoded: ui dirs were eslint-ignored AND prettier-styled differently (semi-less shadcn upstream style) — formatter+linter disabled there entirely to keep upstream-diffability (stronger than the old prettier override, same intent). Subpath patterns (`radix-ui/*`) — if the installed Biome supports `patterns` for noRestrictedImports, ADD them; `paths` alone misses subpath imports — verify with a deliberate bad import in a scratch file before trusting it.

- [ ] **Step 3: Port `no-tautological-expect` to GritQL**

The eslint rule flags `expect(<literal>).toBe|toEqual|toStrictEqual(<same literal>)`. Create `biome-rules/no-tautological-expect.grit`:

```grit
language js

or {
  `expect($a).toBe($b)`,
  `expect($a).toEqual($b)`,
  `expect($a).toStrictEqual($b)`
} where {
  $a <: literal(),
  $b <: literal(),
  $a <: $b,
  register_diagnostic(span=$b, message="Tautological expect: literal compared to itself always passes.")
}
```
Validate: create scratch `/tmp/taut.spec.ts` with `expect(1).toBe(1);` → `pnpm exec biome lint /tmp/taut.spec.ts --config-path .` must flag it. **Fallback if GritQL plugin fails to load or can't express literal-equality:** delete the plugin line + the .grit file, and record the drop in the final summary (rule had 1 custom check; suite review covers it).

- [ ] **Step 4: Run + reconcile**

```bash
pnpm run lint 2>&1 | tail -30
```
Biome's recommended set ≠ eslint's — expect a wave of NEW diagnostics. Policy: fix mechanical ones (`biome check --write .` for safe fixes), then re-run; for residual rule classes that conflict with codebase idiom, disable that one rule in biome.json with a one-line comment why. Do NOT reformat-the-world silently: run `pnpm run format` once and eyeball `git diff --stat` — formatting churn should concentrate in files prettier already owned (same shape, spaces, 80col); wholesale rewrites of untouched dirs = config error (check indentStyle/lineWidth).

- [ ] **Step 5: Delete the old toolchain**

```bash
git rm eslint.config.js .prettierrc.json
git rm -r eslint-rules
grep -rn "eslint\|prettier" package.json apps/*/package.json packages/*/package.json Makefile .github/workflows/*.yml | grep -v node_modules
```
Expected: grep finds ONLY the root `lint`/`format` biome scripts (Makefile `lint` target calls `pnpm run lint` — already correct). Any eslint/prettier devDeps surviving in app/package manifests: remove, `pnpm install`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(tooling): replace eslint+prettier with Biome — single root config, GritQL port of no-tautological-expect"
```

---

### Task 10: CI + docs-of-record + final verify

**Files:**
- Modify: `.github/workflows/test.yml` (only if needed), `AGENTS.md`, `README.md`
- Verify: `deploy.yml`, `release.yml` need zero edits

- [ ] **Step 1: Audit workflows against new tree**

```bash
grep -n "make \|pnpm \|path" .github/workflows/test.yml .github/workflows/deploy.yml .github/workflows/release.yml
```
All three drive everything through `make` targets + `pnpm i --frozen-lockfile` + `public/` paths — all preserved by design. Expected edits: **none**. If any workflow references a deleted root script (e.g. `pnpm run lint` style steps) — retarget to the equivalent root script.
⚠️ `--frozen-lockfile` requires committing `pnpm-lock.yaml` (done in Task 7).

- [ ] **Step 2: Update root `AGENTS.md` + `README.md` paths**

```bash
grep -n "src/components\|src/demo\|website/\|docs/\|scripts/" AGENTS.md README.md
```
Rewrite each hit with the new location (`packages/admin-kit/src/components`, `apps/demo/src`, `apps/website`, `apps/docs`, `packages/admin-kit/scripts`). Keep prose unchanged otherwise. Also update the dev commands section if it names `pnpm run dev` semantics that changed (root `dev` now proxies turbo→demo).

- [ ] **Step 3: Full battery, one last time**

```bash
pnpm run lint && pnpm exec turbo run typecheck test && make build && pnpm run knip
```
Expected: all green; knip may list pre-existing findings — only NEW findings (vs `git stash`-able main run) need action: a new unused-dep finding = a dep landed in the wrong manifest; move it.

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "chore(monorepo): CI audit, docs-of-record path updates, final verification"
git log --oneline main..HEAD
```
Leave branch `monorepo-reorg` unpushed/unmerged for review.

---

## Known-unknowns the executor must resolve inline (not placeholders — each has a decision rule)

1. **Biome rule group drift** (Task 9 Step 2): resolve via `biome explain`; keep the rule, move the group.
2. **website `tw-animate-css`** (Task 4 Step 3): keep iff css imports it.
3. **GritQL feasibility** (Task 9 Step 3): validate on scratch file; drop with note if the plugin engine can't express it.
4. **knip new findings** (Task 10 Step 3): only act on deltas vs main.
5. **Leftover `scripts/` files** (Task 2 Step 2): classify by what they read.

## Out of scope (do NOT do, even if adjacent)

- Renaming URLs/brand (marmelab.com bases stay verbatim this pass)
- exports map / npm-publish hardening for the package
- pnpm catalogs, admin/ dir flatten, docs sidebar orphans
- Reformatting `components/ui/**` (explicitly toolchain-exempt)
