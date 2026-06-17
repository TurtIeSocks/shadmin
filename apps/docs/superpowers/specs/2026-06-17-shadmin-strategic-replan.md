# shadmin Strategic Replan — Ratified Roadmap

*Date: 2026-06-17. Status: design ratified; per-phase specs pending. No users yet → breaking changes are free. Lazy/DRY wins every tie; idiomatic-shadcn is the north star.*

This is a **roadmap/strategy doc**, not a single implementation spec. The work decomposes into independent sub-projects (phases below). **Each phase gets its own `writing-plans` spec + plan before any code is written.**

---

## Net shape

Every "more packages / both primitives / glass package / build core now" instinct converges to the **same destination** — idiomatic-shadcn reaches it with:

> **`shadmin-core` (npm, headless logic) ← `shadmin` (one flat `@shadmin` registry: UI wrappers + `headless/` + everything), Radix-only, vanilla-by-default with opt-in glass-as-style, docs folded into the website and generated from the registry.**

The heavy moves (the actual RA→core rewrite, npm-publishing core, a Base-UI track) are sequenced behind cheap directory/seam refactors and paid only when real code mass or a real user forces them.

---

## Ratified decisions

| # | Decision | Ratified | Rationale |
|---|---|---|---|
| 1 | Package model | **Hybrid** | `shadmin-core` = its own **npm package** (UI-agnostic logic); abstracted headless **components** live under the `shadmin` registry as `src/headless/`. |
| 2 | `shadmin-core` distribution | **npm, UI-agnostic** | Logic is a *dependency you import* (like `ra-core`), not registry copy-in. Must be importable with any UI → **hooks/types/providers only, zero JSX/shadcn deps**. |
| 2b | `shadmin-core` timing | **Workspace pkg now, publish deferred** | Create as the import seam now (route `ra-core` imports through it); keep `private`/unpublished until it holds real in-house logic instead of `export * from "ra-core"`. |
| 3 | Radix vs Base UI | **Radix-only** | A registry can't declare dual support (it's a consumer `init --base` choice + shadcn's private CLI transform). Admin layer is already primitive-agnostic → future flip stays a `ui/`-only swap. |
| 4 | Item naming | **Basename-strip + collision guard** | Decouples `name` from path (idiomatic shadcn). Delivers "organized source, flat consumer" with ZERO consumer rename. |
| 5 | Glass packaging | **`registry:style`, not a package** | A package breaks the copy-in idiom; the material is one CSS file the consumer owns. |
| 5b | Glass mechanism | **Skin the shared `ui/` primitives** | One material file (`lib-glass`); all 163 admin components inherit glass through existing imports. Spike-proven on ONE primitive first. |
| 6 | Glass default | **Opt-in; default = vanilla shadcn** | User requirement. Default `style-shadmin` base; glass `style-glass` `extends` it. |
| 7 | Docs site | **`/docs` route inside `apps/website`** | One app, one design system, zero new framework; generate install+nav from the registry. |
| 8 | Compound merges (cosmetic) | **Defer** | Merging leaf inputs/fields/menus is internal churn, no consumer payoff (granular install is a feature). |
| 9 | Structural de-RA (light wrappers) | **Library-wide, audit-driven** | NOT app-sidebar-only: **145/163 admin + ~96 other files import ra-core (~246 total)**. Isolate RA so shadcn primitives aren't buried; app-sidebar is the *worst* example, not the whole list. Audit enumerates the real offenders. |

---

## Package model

```
shadmin-core   (npm package — headless, type-safe, UI-agnostic)
   │ exports: hooks, types, data/auth providers. NO JSX, NO shadcn deps.
   │ today: re-exports ra-core; migrates symbol-by-symbol to in-house logic.
   ▼
shadmin        (one flat @shadmin registry — copy-in UI)
   ├─ src/headless/         ra-core-free primitives (pickers, combobox, color-picker, …)
   ├─ src/components/ui/     shadcn primitives (+ glass skins under style-glass)
   └─ src/components/admin/  RA-wrapping admin components, organized by facet
```

- **Dependency direction:** UI depends on core; core never depends on UI.
- **The seam:** all `from "ra-core"` imports route through `shadmin-core` (or `@/core` alias). The eventual RA→in-house swap is then a per-symbol migration *inside one package*, not a repo-wide hunt.
- **Boundary enforcement:** Biome `noRestrictedImports` — `src/headless/**` may not import `ra-core`/core; `shadmin-core` may not import React components/shadcn.

---

## Per-axis augmented approach

### Organization (the "careful agreement" area)
- **Decouple name from path** in `granularize-block.mjs` (derive item name from **basename**, not path-join). Add a **dedupe assertion** (duplicate `ours` name → loud build failure, not silent double-write).
- **Directory taxonomy:** `admin/{inputs,fields,buttons,layout,auth,data-table,list,edit,show,create}/`. Stories/specs move *with* their component (already excluded by `isTestOrStory` at any depth).
- **Consumer output stays flat** — basename-strip guarantees `inputs/text-input.tsx` ships as `text-input`.
- **Compound exports:** adopt one-file-emits-children with flat PascalCase exports (`SidebarHeader`, never `Sidebar.Header` — dot-namespaces break tree-shaking + `only-export-components`). *Cosmetic merges of leaf families are deferred* (granular install is a feature).

### De-RA (structural) — library-wide
**Scope reality:** ~246 files import `ra-core` (145/163 admin + 42 extras + 24 realtime + 18 supabase + 5 leaflet + 5 block-editor + 4 monaco + 2 mdx + 1 csv). De-RA is NOT a single-component fix. Two distinct layers:
1. **Seam re-route (Phase 2, mechanical):** every `from "ra-core"` → `shadmin-core`. Covers all ~246 files; prep, not a swap.
2. **Structural light-wrapper refactor (audit-driven):** isolate RA so the shadcn primitives aren't *buried* under RA glue — the `app-sidebar` pattern (RA-free shell + light pass-through children; RA coupling pushed into an injected/default child, e.g. `<Menu/>`). app-sidebar is the **worst example**, not the list. A **de-RA audit** enumerates and ranks offenders (which components bury primitives vs. are already thin). Do the top offenders pre-rewrite (makes the eventual swap clean); the long tail gets structurally de-RA'd *during* the actual RA→core rewrite (deferred). The seam re-route is the only part that touches all files now.

### Styles / base
- **Default = `style-shadmin` (`registry:base`)** — `extends` omitted (extend shadcn primitives), `config: { style:"shadmin", iconLibrary:"lucide", tailwind:{ baseColor:"neutral" } }`, vanilla `cssVars` from `src/index.css`. Entry point: `npx shadcn init <…>/r/style-shadmin.json`.
- **Keep the 5 palettes as `registry:theme`** but **strip glass out of aurora** (palette-only, like the others). Drop the bespoke `aurora:true` branch (DRY win). Fixes the latent "theme overwrites `:root`, no neutral default" bug.

### Glass (spike-first)
1. **AXE aurora** — delete `aurora.css`, `theme-aurora`'s glass, `aurora:true`, `AURORA_UTILITIES_CSS`, website's local `.aurora-orb`; re-point the ~4 stray `glass`/`bezel` usages.
2. **`lib-glass`** — port the liquid-glass-css skill's `glass.css` (6-layer tokens, L1–L3, presets) = single source of truth. This is the *substance* aurora lacked (specular L4, refraction L3 via `feDisplacementMap`).
3. **`glass-filter` (registry:ui) + `use-glass-pointer` (registry:hook)** — thin React mounting the SVG defs + writing `--mx/--my`. Zero glass look in TS.
4. **Spike: glass-skin ONE primitive** (e.g. card), prove the refraction/specular actually lands, THEN skin ~5 more (button, dialog, sheet, sidebar, app-bar).
5. **`style-glass` (registry:style, extends base)** — `registryDependencies` = glass primitives + `lib-glass` + `glass-filter`. One `shadcn add @shadmin/style-glass` = whole glass admin. No `@shadmin-glass` namespace, no npm package.

### Docs
- **AXE `apps/docs`** (Astro/Starlight — the RA-era artifact).
- **`/docs` route tree in `apps/website`** (Vite + React 19 + Tailwind v4; already has Shiki + theme toggle + glass primitives post-axe). Add an MDX rollup plugin.
- **Generate from the registry:** a build step reads `dist/r/*.json` → per-item `shadcn add` block, deps list, category-grouped sidebar, the `docs` hint. *Payoff of the `author`/`categories`/`docs` fields just shipped.*
- **Live previews from the 259 colocated `*.stories.tsx`** (import the story render fn as preview, source as Code tab). Port the ~292 prose bodies MD→MDX; keep the typedoc props pipeline as a React `<PropsTable>`.

---

## Dependency-ordered sequencing

**Concurrency landmine:** `registry.config.mjs` (`extraFiles` hard-codes `src/lib/*`), `generate-registry.mjs`, and `granularize-block.mjs` (`fileToItemRef` path map, `OUR_UI_ITEMS`/`OUR_HOOK_ITEMS`) all hard-code `src/` prefixes. The file-move (Org), the seam (Packages), and the aurora-axe (Styles) all edit this path logic — **serialize them; do the path refactor once.**

| Phase | Work | Size | Breaking? | Gate / blocks |
|---|---|---|---|---|
| **0** | Cleanups, independent: delete **dead** `combobox.tsx` (zero importers, never wired — our combobox is `autocomplete-input` on Command+Popover) + drop the now-unused `@base-ui/react` dep; lint-ban primitive imports outside `ui/`. | S | internal | none |
| **1** | Granularizer name-decoupling: basename derivation + dedupe guard. **Pre-flight: audit current tree is basename-collision-free.** Regenerate; **assert `registry.json` byte-identical to `main`** (no moves yet ⇒ proves behavior-preserving). | S | none | precedes the move |
| **2** | `shadmin-core` workspace pkg + seam: route all `from "ra-core"` → core (codemod). Biome boundary lint. `private`/unpublished. | M | internal | the swap seam; precedes any core work |
| **3** | Org refactor (jointly w/ headless move): create `src/{headless,components/admin/<taxonomy>}/`, move files, rewrite intra-package imports, update `fileToItemRef` path map + `extraFiles`. Regenerate; **assert `dist/r/` filenames unchanged.** | L | internal imports; **consumer names unchanged** | after 1+2; touches shared path logic |
| **4** | **De-RA audit + worst offenders:** enumerate/rank components that bury shadcn primitives under RA glue (app-sidebar = #1); refactor the top offenders into light wrappers (RA isolated/injected, primitives exposed), as flat-PascalCase compound families where it fits. Bulk structural de-RA of the ~246 RA-coupled files coincides with the core rewrite (deferred). | L→ongoing | internal | after 2 (seam) + 3 (taxonomy) |
| **5** | Styles base layer: `registry:base` `style-shadmin` (vanilla) + strip glass from aurora + drop `aurora:true`. | M | `theme-aurora` loses glass | default-vanilla must precede glass |
| **6** | Glass rebuild (spike-first): `lib-glass`, `glass-filter`, `use-glass-pointer`, skin 1→~6 primitives, ship `style-glass`. Apply across website/demo. | L | aurora utilities gone | after 5 (extends base) + 3 (settled primitive names) |
| **7** | Docs: axe `apps/docs`; `/docs` in website; registry-driven install/nav generator; story-sourced previews; port MDX + props table; re-derive redirects. | L | `/docs/*` URLs remap | after 5+6 (glass feel exists) + stable registry surface |

**Cross-axis rationale:** Org precedes Docs (docs generates nav from the registry); default-vanilla (5) precedes glass (6, `extends` the base); the seam (2) precedes anything RA-related; headless extraction folds into Org (3), not its own phase; **all of this is independent of the actual RA→core rewrite** — it organizes the tree so that rewrite is later a per-component retarget.

---

## Risks / landmines to honor in every phase

- **Leaflet build — verified GREEN 2026-06-17** (the ~21 react-leaflet v5 / geoman `PM` errors no longer reproduce; full lint+typecheck+build+test pass on main, uncached). The Phase 2–4 typecheck/build gates are therefore real. *Caveat that remains:* don't trust a turbo-*cached* green typecheck — run `--force`/direct `tsc` when it matters.
- **Testing gate:** the file-move (3) + compound merge (4) break story/test import paths. Each phase must re-green the suite (the 259 stories double as the docs preview corpus — don't let them rot).
- **CI for the assert-gates:** Phases 1 & 3 hinge on "dist/r unchanged" / "registry.json byte-identical." Promote these from manual `git diff` to a committed CI check (the validators are still ephemeral in `/tmp`).
- **Tailwind `@source` + turbo `inputs`:** every file move + `apps/docs` axe + `/docs` add changes `@source` globs and turbo cache inputs. Update them per phase.
- **Basename-collision pre-flight (Phase 1):** flat-basename naming only holds if no two admin subdirs share a leaf basename. Audit before committing; the dedupe guard is the backstop.
- **MDX-in-Vite (Phase 7):** shadcn picked Fumadocs/Next for a reason (SSR/search/docgen). Validate MDX rollup + story previews handle our needs before fully axing `apps/docs`; the ~292 prose bodies are real authored value — "port" is the largest single labor item.
- **Versioning:** "no users → breaking is free" excludes the in-repo consumers (demo, website). Confirm they ride the barrel/insulation before declaring a change free.

---

## Ponytail DEFER list

Build none of these now; each has a trigger:

- **Publishing `shadmin-core` to npm** → when `core` holds real in-house logic (not an `ra-core` re-export).
- **`@shadmin/headless` as a separate package** → when `src/headless/` exceeds ~30–40 substantive files AND you want npm publish. Today it's ~18+3, mostly layout glue.
- **Base-UI variant track (`@shadmin-base`)** → when real `--base base` users ask AND the empirical CLI-transform test shows remote transform fails.
- **Broad compound merges (menus, leaf families)** → when docs work proves the surface needs it.
- **Fumadocs/Next docs app** → when Vite+MDX measurably falls short (search/docgen).
- **`target`-per-item grouped consumer tree** → when you actually want installed files grouped under `components/admin/inputs/` on the consumer side (today flat is correct + free).
- **`@shadmin/glass` npm package** → **reject permanently** (breaks copy-in).

---

## Execution protocol

When a phase is greenlit: invoke `writing-plans` to produce that phase's spec + plan, execute via `subagent-driven-development`, gate on the asserts above, then return here for the next phase.
