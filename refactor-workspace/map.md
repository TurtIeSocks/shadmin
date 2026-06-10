# Monorepo Reorg — Old→New Map (Phase 4)

Primary deliverable. Decisions from goals.md; verdicts from assessment.md (+ user
amendment: **eslint+prettier → Biome, single root config**).

## New Structure

```
shadcn-admin-kit/                      (repo root; root pkg renames `shadcn-admin-kit-monorepo`, private)
├── apps/
│   ├── demo/
│   │   ├── package.json               ← new. deps: react, react-dom, shadcn-admin-kit (workspace:*),
│   │   │                                 ra-core + data/i18n providers, data-generator-retail, …
│   │   │                                 (final list = audit of bare imports in demo src during exec)
│   │   ├── index.html                 ← was /index.html. Action: move (script src ./src/main.tsx)
│   │   ├── vite.config.ts             ← was /vite.config.ts. Action: move + rework aliases:
│   │   │                                 `shadcn-admin-kit/*` → ../../packages/admin-kit/src/*  (name imports)
│   │   │                                 `@/*`               → ../../packages/admin-kit/src/*  (package internals)
│   │   │                                 preserve base path + plugins (react, tailwind)
│   │   ├── tsconfig.json              ← extends /tsconfig.base.json; paths mirror the two aliases
│   │   └── src/
│   │       ├── main.tsx               ← was src/main.tsx. Action: move (import ./App)
│   │       ├── index.css              ← NEW thin entry: @import "tailwindcss" theme bits +
│   │       │                             @import "shadcn-admin-kit/index.css" +
│   │       │                             @source "../../../packages/admin-kit/src"
│   │       │                             (Tailwind v4 won't scan package src outside app root otherwise)
│   │       ├── App.tsx, App.*.tsx     ← was src/demo/App*.tsx. Action: move (6 swap-variants kept)
│   │       └── customers|products|workspace|planning|scheduled-jobs/
│   │                                  ← was src/demo/<dir>. Action: move + import rewrite:
│   │                                    `@/components/…` → `shadcn-admin-kit/components/…` (mechanical)
│   │                                    `@/lib/…` `@/hooks/…` → `shadcn-admin-kit/lib|hooks/…`
│   │                                    `@/demo/…` → relative (2 files)
│   ├── website/
│   │   ├── package.json               ← new (was second Vite entry in ROOT pkg). deps: audit of
│   │   │                                 website/src bare imports (react, tailwind, own ui libs…)
│   │   └── (everything else)          ← was /website/*. Action: move as-is — already isolated,
│   │                                     own `@/` → its src, own components.json. Zero source edits.
│   └── docs/                          ← was /docs. Action: move; already workspace pkg
│       │                                (`shadcn-admin-kit-doc`)
│       └── scripts/check-*.mjs        ← Action: retarget `src/…` reads →
│                                         `$repo/packages/admin-kit/src/…` (check-stories:34,
│                                         check-demo-coverage:21 → ../apps/demo/src)
└── packages/
    └── admin-kit/
        ├── package.json               ← new: name **`shadcn-admin-kit`**, private, JIT (no build).
        │                                 react/react-dom/ra-core → peerDeps (+devDeps for harness)
        │                                 to keep apps single-react. All library runtime deps here.
        │                                 devDeps: vitest+browser+playwright, storybook stack, shadcn CLI,
        │                                 typescript, tailwind (harness css). NO exports map needed this
        │                                 pass (name imports resolved via app alias + tsconfig paths;
        │                                 exports hardening = future npm-publish task, out of scope).
        ├── components.json            ← was /components.json. Action: move (describes library aliases/css)
        ├── registry.json              ← was /registry.json. Action: move (generated artifact)
        ├── tsconfig.json              ← was /tsconfig.app.json. Action: move+rename; keeps `@/*` → ./src/*
        ├── vitest.config.ts           ← was /vitest.config.ts. Action: move; 9 per-block globs unchanged
        │                                 (package root mirrors old root: src/components/<block>/…)
        ├── vitest.global-setup.ts     ← was root. Action: move
        ├── vitest.browser-setup.ts    ← was root. Action: move
        ├── .storybook/                ← was /.storybook. Action: move; glob `../src/**` + css import
        │                                 `../src/index.css` still resolve (relative paths preserved)
        ├── scripts/
        │   ├── registry.config.mjs    ← was /scripts/. Action: move; sourceDirs `src/components/…`
        │   │                             unchanged (cwd = package root)
        │   ├── generate-registry.mjs  ← Action: move; repoRoot → package root
        │   ├── build_registry.mjs     ← Action: move + output `public/r` → `dist/r` (package-local,
        │   │                             turbo-cacheable; root Makefile assembles into /public/r)
        │   ├── test_registry.sh       ← Action: move + path touch-ups
        │   └── package-test.json      ← was /package-test.json. Action: move (test_registry scaffold)
        └── src/
            ├── components/<11 blocks> ← was src/components. Action: move VERBATIM (zero content edits —
            │                             registry model: internal `@/` imports stay)
            ├── hooks/, lib/, test/, assets/
            │                          ← was src/<same>. Action: move verbatim
            ├── examples/example-admin.tsx
            │                          ← was src/examples/. Action: move verbatim (registry item)
            └── index.css              ← was src/index.css. Action: move verbatim (registry extraFile)
```

## Root (stays / rewritten)

```
package.json          → rewrite: name shadcn-admin-kit-monorepo, private; scripts delegate
                        (`turbo run …`, `biome check .`); devDeps: turbo, @biomejs/biome, knip, prettier REMOVED
pnpm-workspace.yaml   → packages: ["apps/*", "packages/*"]   (drop literal "docs")
turbo.json            → NEW (sketch below)
biome.json            → NEW (sketch below); replaces eslint.config.js + .prettierrc.json + eslint-rules/
tsconfig.base.json    → NEW shared base (was root tsconfig.json compilerOptions); per-pkg tsconfigs extend
tsconfig.json         → solution-style refs to packages (editor entry) or dropped — decide at exec
knip.json             → rewrite workspace-aware (knip native `workspaces` key)
Makefile              → thin: build-* targets → `turbo run …` + keep the public/ ASSEMBLY (rm/mv/cp)
                        `make build` = turbo run build registry:build + assemble public/{,demo,docs,r}
public/               → stays: deploy aggregation target (gh-pages), same shape this pass
.github/workflows/    → retarget: test.yml + deploy.yml keep `make …` entry points; release.yml untouched
                        (public/r path unchanged)
rules/, AGENTS.md, README.md, CHANGELOG.md, LICENSE → stay root
```

## turbo.json (sketch)

```jsonc
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "registry:generate": { "outputs": ["registry.json"] },
    "registry:build": { "dependsOn": ["registry:generate"], "outputs": ["dist/r/**"] },
    "typecheck": {},                       // per-pkg `tsc --noEmit` (no incremental → no outputs)
    "test": {},                            // admin-kit only (vitest browser)
    "check": { "inputs": ["$TURBO_DEFAULT$", "$TURBO_ROOT$/packages/admin-kit/src/**", "$TURBO_ROOT$/apps/demo/src/**"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

- admin-kit is JIT (no `build` task); demo declares `shadcn-admin-kit: workspace:*` so the graph is honest.
- docs' `check-coverage` → `check` task; inputs reach package+demo src via `$TURBO_ROOT$` (no `../`).
- lint/format = root-level Biome (`biome check .`), NOT a turbo task — single config, sub-second, no graph shape.

## biome.json (sketch — replaces eslint+prettier)

```jsonc
{
  "formatter": { "indentStyle": "space" },          // prettier base was defaults (spaces, 80, double, semi)
  "linter": { "rules": { "recommended": true,
    "correctness": { "noUnusedVariables": "error" },             // `_` prefix honored natively
    "suspicious": { "noConsole": { "options": { "allow": ["warn", "error"] } } },
    "style": { "useComponentExportOnlyModules": "warn" },        // ≈ react-refresh/only-export-components
    "nursery|style": { "noRestrictedImports": {                  // radix/base-ui containment rule
      "options": { "patterns": ["radix-ui", "radix-ui/*", "@radix-ui/*", "@base-ui/react", "@base-ui/react/*"] } } }
  }},
  "overrides": [
    { "includes": ["packages/admin-kit/src/components/ui/*.tsx", "apps/website/src/components/ui/*.tsx"],
      "formatter": { "semicolons": "asNeeded", "trailingCommas": "es5" }, "linter": { "enabled": false } },
    { "includes": ["packages/admin-kit/src/components/block-editor/{blocks,extensions}/**"],
      "linter": { "rules": { "style": { "useComponentExportOnlyModules": "off" } } } }
  ],
  "plugins": ["./biome-rules/no-tautological-expect.grit"]       // port of eslint-rules custom rule (GritQL)
}
```

**Biome migration losses (accepted, flagged):**
- `eslint-plugin-storybook` rules — no Biome equivalent. Dropped.
- Prettier md/mdx formatting — Biome markdown support immature. Docs content goes unformatted (or manual).
- `no-tautological-expect` → GritQL port attempted; if GritQL can't express it, keep rule's intent via
  review + delete (flag at exec time).
- react-hooks coverage via Biome `useHookAtTopLevel` / `useExhaustiveDependencies` (≈ parity).

## Bulk 1:1 moves

| Old | New | Notes |
|-----|-----|-------|
| src/components/** | packages/admin-kit/src/components/** | verbatim, `git mv` |
| src/{hooks,lib,test,assets,examples,index.css} | packages/admin-kit/src/… | verbatim |
| src/demo/** | apps/demo/src/** | + import rewrite to name form |
| src/main.tsx, index.html, vite.config.ts | apps/demo/… | + alias rework |
| website/** | apps/website/** | verbatim + new package.json |
| docs/** | apps/docs/** | + check-script path retarget |
| .storybook/, vitest.*, tsconfig.app.json | packages/admin-kit/… | relative refs survive |
| scripts/*, registry.json, components.json, package-test.json | packages/admin-kit/… | output path → dist/r |

## Dropped (not in new tree)

- `eslint.config.js`, `.prettierrc.json`, `eslint-rules/` (rule logic → biome-rules/*.grit + biome.json) — Biome switch
- eslint+prettier+typescript-eslint+plugins from devDeps; `lint`/`prettier:*` scripts → `biome check`
- `dist/`, `storybook-static/` — build artifacts
- Root `src/`, `website/`, `docs/`, `scripts/` dirs (emptied by moves)

## Gotchas (execution-critical)

1. **Tailwind v4 content scanning** — demo (and any app compiling package source) needs `@source` pointing
   at `packages/admin-kit/src`, else classes used only inside package components vanish from the build.
   Storybook-in-package unaffected (scans own root). Verify by visual smoke on demo build.
2. **Dual React** — package declares react/ra-core as peers; apps own them. pnpm dedupe check after split
   (`pnpm why react` — one version). Hook errors at runtime = this.
3. **Registry byte-equivalence** — `registry:generate` before/after must diff clean (only path-prefix
   changes inside generator, none in output). `dist/r` vs old `public/r` content diff clean.
4. **Demo import rewrite** is sed-able but audit stragglers: `grep -r "@/" apps/demo/src` must end EMPTY
   (demo never uses `@/` again; `@/` alias exists only for package internals).
5. **Biome `noRestrictedImports` option shape** — verify patterns syntax against installed Biome version;
   fall back to explicit path list if patterns unsupported.
6. **base paths** — demo vite `base`, docs astro `base` (`/shadcn-admin-kit/docs/`) preserved verbatim this
   pass (rename pass later).
7. **knip workspace rewrite** — entries per workspace; keep `!` production markers semantics.

## Verification plan (big-bang branch, before review)

- `pnpm install` clean (lockfile rebuilt, no phantom deps)
- `turbo run typecheck test build registry:build` all green (suite = 1035 specs in package)
- `biome check .` clean (or annotated baseline)
- `make build` → public/ tree diff vs pre-move build: identical shape, registry content identical
- storybook boots from package (`pnpm --filter shadcn-admin-kit storybook`)
- demo dev server visual smoke (tailwind gotcha #1)
- knip clean
- CI workflows dry-read (paths exist)

## Deferred (explicitly out of this pass)

- Rename pass: marmelab.com homepage/base URLs, brand strings (user-planned, separate)
- exports map + npm-publish hardening for the package
- pnpm catalogs for version sync (polish)
- admin/ dir flatten (320 files — standing deferral from org-pass)
- docs sidebar orphans (standing deferral)
