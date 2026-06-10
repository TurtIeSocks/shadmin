# Monorepo Reorg — Assessment (Phase 3)

Verdicts per top-level area. Reorg pass → verdicts are placement + config-rewrite calls,
not keep/rewrite-code calls (no code rewrites anywhere).

### src/components, src/hooks, src/lib, src/test, src/index.css, src/examples, src/assets
- Verdict: **Move → packages/admin-kit/src/** (content untouched)
- Evidence: the library; registry sourceDirs + colocated specs/stories all point here
- Confidence: High

### src/demo/ + src/main.tsx + index.html + vite.config.ts (root)
- Verdict: **Move → apps/demo/** + rewrite library imports `@/…` → `shadcn-admin-kit/…`
- Evidence: one-way dep on library; root dev entry; 6 App swap-variants preserved as-is
- Confidence: High

### website/
- Verdict: **Move → apps/website/** + gets own package.json (deps extracted from root)
- Evidence: fully isolated already (own `@/` → website/src); only missing its manifest
- Confidence: High

### docs/
- Verdict: **Move → apps/docs/** (already a workspace package; path updates only)
- Evidence: `shadcn-admin-kit-doc`, Astro; check-scripts reach into ../src — must retarget to packages/admin-kit/src
- Confidence: High

### .storybook/, vitest.config.ts, vitest.*-setup.ts, tsconfig.app.json
- Verdict: **Move → packages/admin-kit/** (per decision #2; test globs/setup follow the source)
- Confidence: High

### scripts/ (registry pipeline: registry.config.mjs, generate-registry.mjs, build_registry.mjs, test_registry.sh + package-test.json)
- Verdict: **Move → packages/admin-kit/scripts/** — registry generation is the package's distribution concern. Output target (public/r) becomes a parameter/turbo-orchestrated copy at root.
- Evidence: reads src/components/<block>; writes registry.json + public/r
- Confidence: Medium (output-path wiring decided in map)

### registry.json
- Verdict: **Move → packages/admin-kit/registry.json** (generated artifact follows generator)
- Confidence: Medium

### public/
- Verdict: **Stay root** — deploy aggregation target (gh-pages). Shape kept this pass.
- Confidence: High

### eslint.config.js + eslint-rules/
- Verdict: **Stay root** (flat config spans all areas) with path updates; revisit per-package configs only if friction
- Confidence: Medium

### knip.json
- Verdict: **Stay root, rewrite workspace-aware** (knip native workspaces support)
- Confidence: High

### Makefile
- Verdict: **Keep, thin** — targets become `turbo run …` / `pnpm --filter …` wrappers; CI keeps `make build`
- Confidence: High

### .github/workflows/ (test, deploy, release)
- Verdict: **Keep, retarget commands** (same make entry points where possible)
- Confidence: High

### rules/AGENTS.md, AGENTS.md, README.md, CHANGELOG.md, LICENSE, components.json
- Verdict: **Stay root** — components.json stays at root? NO → **Move → packages/admin-kit/** (shadcn CLI config describes the library's aliases/css). Root keeps repo docs.
- Confidence: Medium (components.json placement: package)

### Root package.json + pnpm-workspace.yaml
- Verdict: **Rewrite** — root: private shell (name TBD e.g. `shadcn-admin-kit-monorepo`, devDeps: turbo/prettier/knip/eslint shared toolchain). workspace: `apps/*`, `packages/*`, drop `docs` literal. Deps distributed: library deps → package, demo-only (data-generator-retail, ra-data-json-server…) → apps/demo, website-only → apps/website.
- Confidence: High

### dist/, storybook-static/, node_modules
- Verdict: **Delete/ignore** — build artifacts, not migrated
- Confidence: High
