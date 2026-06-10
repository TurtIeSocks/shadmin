# Monorepo Reorg — Goals (Phase 2)

Mode: **participate** (Q&A run 2026-06-09). All decisions below user-confirmed.

## Drivers

- **Boundary clarity** — enforced separation library / demo / website / docs; no accidental cross-imports; per-area ownership of config.
- **Dep isolation** — root package.json currently holds ALL deps (library + demo + website mixed); each app/package declares only what it uses.

Explicit NON-drivers: npm publishing (registry-only distribution stays), CI/build speed.

## Decisions (user-confirmed)

| # | Decision |
|---|----------|
| 1 | **One library package** — `packages/admin-kit` holds all 11 blocks. Per-block dep isolation stays logical (registry config), not physical. |
| 2 | **Storybook lives inside the package** (`packages/admin-kit/.storybook`) — stories/specs/config travel together; vitest addon-vitest stays package-local. |
| 3 | **Apps import by package name** — `shadcn-admin-kit/components/admin/...` via workspace dep + exports map pointing at **source** (no build step). Underneath, consuming apps still alias `@/*` → package src for the package's internal `@/` imports. Demo's library imports get rewritten to the name form. |
| 4 | **Turborepo** for orchestration — turbo.json task graph; Makefile thins to wrappers (CI continuity). |
| 5 | **Package named `shadcn-admin-kit`**; workspace root renames (private, never published). |
| 6 | **Big-bang branch** — one branch, `git mv` for history, full verify, single review. |

## Constraints

- **HARD — registry model:** package source keeps `@/components/...`, `@/lib/...`, `@/hooks/...` imports verbatim (shadcn CLI rewrites them on the consumer side). Package's own tsconfig keeps `@/*` → `./src/*`.
- **SOFT — URLs/naming:** no users to migrate ("new project post-defork; names/URLs change later; this pass is organizing only"). Keep public/ assembly shape so deploy.yml keeps working — convenience, not contract.
- No behavior changes: full suite green (1035 specs), lint, typecheck, all 4 builds + registry generate produce equivalent output.
- No autonomous push/merge to main; work on branch for review.

## Out of scope (this pass)

- Rename pass (marmelab.com homepage/base URLs, brand strings) — user plans separately.
- npm publishing build/exports hardening.
- Per-block package split.
- Flattening the 320-file `admin/` dir (deferred since org-pass).
