# Unified Site Design — landing + docs + demo, one Vite app

**Date:** 2026-06-20
**Status:** Approved (brainstorm) — Phase 1 scoped for implementation
**App:** `apps/www-v2` (becomes the canonical site)

## Problem

The inherited website/docs/demo apps are over-engineered — not server-bound
(everything is already static), but heavy and fragile from stacking parent-repo
(marmelab react-admin) concepts:

- **Dual component copies.** `apps/www-v2` carries its own 56-file
  `src/components/ui/` copy while `packages/shadmin` already ships all of them.
  Two sources of truth → drift, "where do I edit this" confusion.
- **Fragile docs nav.** Navigation lives in *three disconnected places*:
  `packages/shadmin/registry.json` → a **manually run** generate script →
  committed `apps/website/src/docs/registry-manifest.json` → plus hand-maintained
  `guidesGroup` + `categoryExtras` overlays in `guides-nav.ts`. Forget to run
  `docs:manifest` and a page silently vanishes; a sidebar entry with no MDX 404s
  silently.
- **Weight.** framer-motion everywhere, an Aurora glass layer, and 293 MDX
  files eager-globbed into one chunk.
- **Demo welded to ra-core.** `apps/demo` is tight but married to ra-core +
  `data-generator-retail` + `@mdxeditor/editor` (~500 KB), in 4+ variants.

## Goals (from brainstorm)

Primary: **maintenance simplicity** + **live interactive demos in docs**.
The landing page was "mostly right." The docs are where it fell apart, and the
demo hadn't been integrated yet.

## Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **One Vite + React Router app**, `apps/www-v2` → canonical site. One build, one GitHub Pages deploy. | Everything is already static; no reason for 3 apps. |
| D2 | **Vite SPA + static prerender** (`vite-react-ssg` or RR7 `prerender`). Real HTML per route, hydrates to interactive. Demos stay client-only behind lazy boundaries. | Keeps the scaffold (no framework switch), gets per-page HTML/SEO, fewest new concepts. |
| D3 | **Kill the dual copy.** Delete www-v2's `src/components/ui/`; import the real components from the `shadmin` package. | One source of truth; dogfoods the registry. |
| D4 | **Build `shadmin` to dist** (lib build + `exports` map) to resolve the `@/`-in-source registry constraint. www-v2 keeps its own `@/`, no alias juggling. | Registry rules force shadmin's source to use `@/`; building resolves it at build time. Also makes shadmin npm-publishable later. |
| D5 | **Filesystem = source of truth for docs.** `content/` tree IS the sidebar, discovered by `import.meta.glob`. Delete the generate script, `registry-manifest.json`, `guides-nav.ts`, and `categoryExtras`. | Drop a file → it appears. Phantom links impossible (sidebar built *from* files). One obvious place to edit. |
| D6 | **Live demos = preview + code tabs.** Demo `.tsx` files import the real shadmin component; a Code tab shows the source. Admin-tier blocks wrap in a shared `<DemoAdmin>` (minimal `<Admin>` + fakerest + seed data). Primitives render bare. | Interactive without the cost/complexity of an in-browser editor. |
| D7 | **No Sandpack/editable playground.** Deferred. | YAGNI for now. |
| D8 | **Demo app = reference, not copy.** The unified `/demo` is rebuilt *with precision* (Phase 3), accounting for all components added since `apps/demo` was written and the move to a single demo. `apps/demo` is read for reference only — never `cp`'d in. | Many new components; combining into one demo needs care. |
| D9 | **Phase the work.** Phase 1 = docs. Land it, iterate, then port landing + rebuild demo. | "Take it slower" — prove the docs model before porting the rest. |

## Architecture — route map

| Route | Content | Bundle | Phase |
|---|---|---|---|
| `/` | Landing (thin nav now; full port later) | eager | nav now / content P2 |
| `/docs/*` | Filesystem-sourced MDX + live previews | route-split per page | **P1** |
| `/demo/*` | Unified demo (precise rebuild) | lazy, code-split | P3 |
| `/r/*.json` | Static registry (from shadmin build) | static files | existing |

## Phase 1 — Docs site (implementable scope)

### 1a. Foundation (component sourcing)
- Add a lib build to `packages/shadmin` (tsup or vite lib mode) that resolves
  internal `@/` and emits a `dist/` + `exports` map. Registry generation stays
  src-based and unchanged (additive — see A3).
- `apps/www-v2`: add `"shadmin": "workspace:*"`; Tailwind v4 `@source` the
  shadmin dist so its utility classes generate; **delete** the 56
  `src/components/ui/` files; rewrite local imports
  `@/components/ui/*` → `shadmin/components/ui/*`.
- Turbo: www-v2 `build` depends on shadmin `build`.

### 1b. Docs engine
```
src/docs/content/
  getting-started/
    _meta.ts          # order + titles for THIS folder only
    install.mdx
    quick-start.mdx
  components/
    data-table/
      index.mdx
      demos/basic.tsx # live demo source
```
- **Discovery:** `import.meta.glob('./content/**/*.mdx')` builds the route list
  AND the sidebar tree from actual files. No generate script, no manifest JSON,
  no `guides-nav.ts`, no `categoryExtras`.
- **Ordering/titles:** tiny co-located `_meta.ts` per folder (one place,
  findable). Title falls back to frontmatter if omitted.
- **Install commands:** import shadmin's registry JSON directly; look up by slug
  at render time. No copied manifest.
- **MDX pipeline:** keep the plugins the content depends on — frontmatter, gfm,
  callout directives, code-meta, relative-links. Cut *only* the manifest
  machinery.
- **Validation:** a link/entry with no backing MDX fails loudly at prerender
  (sidebar is derived from the files).

### 1c. Live previews
- `<ComponentPreview name="data-table/basic" />` MDX component.
  - Preview pane renders the demo `.tsx` (imports the real component from
    `shadmin`).
  - Code tab shows that file's source (`?raw` import + Shiki).
- `<DemoAdmin>` shared wrapper in `src/docs/demo-kit/`: minimal `<Admin>` +
  fakerest provider + tiny seed dataset, reused across admin-block demos.
  Primitives render bare.

### 1d. Content migration
- Move the ~293 MDX (~80% substantial hand-written prose) into the `content/`
  tree as-is. Adjust frontmatter/links only where the new structure requires.

### 1e. Top nav + shell
- Thin top nav on `/`: **Home / Docs / Demo**. Home + Demo are stubs/placeholder
  routes in Phase 1; Docs is live.
- Site consumes shadmin's own theme CSS (dogfoods native shadcn theming).

### 1f. Build + deploy
- Wire `vite-react-ssg`/RR7 prerender over the route list + docs glob.
- Single Vite build → GitHub Pages. Static `/r/*.json` registry copied in.

## Later phases (north star — not in the Phase 1 plan)

- **Phase 2 — Landing.** Port/clean the home content from `apps/website`. Keep
  its look but import primitives from `shadmin` (no dual copy). Drop the Aurora
  glass layer unless the landing genuinely uses it.
- **Phase 3 — Demo.** Rebuild the unified `/demo` *with precision* (D8):
  `apps/demo` as reference, all current components accounted for, lazy/code-split
  routes, never load ra-core/mdxeditor on landing/docs.
- **Phase 4 — Teardown.** At parity, delete `apps/website` + `apps/demo`;
  optionally rename `apps/www-v2` → `apps/web`.

## Assumptions (veto points)

- **A1** — Phase 1 ships only a thin nav on `/`; the landing *content* port is
  Phase 2.
- **A2** — `www-v2` becomes *the* site; old apps deleted after parity, not run
  in parallel.
- **A3** — Registry generation stays src-based & unchanged; the lib build is
  separate and additive.
- **A4** — No Sandpack/editable playground (D7).
- **A5** — Final dir name: keep `www-v2` for now; rename at teardown is cosmetic.

## Out of scope (Phase 1)

Landing content port, demo rebuild, deleting old apps. Captured above as Phases
2–4.

## Open questions for the Phase 1 plan

- Prerender lib: `vite-react-ssg` vs RR7 native `prerender` — decide during
  writing-plans by which integrates cleaner with the docs glob.
- `_meta.ts` shape: ordered slug array vs `{slug,title,order}` records — pick the
  minimal form that covers ordering + title override.
