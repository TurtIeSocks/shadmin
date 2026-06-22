# shadmin Phase 7 — Docs in the Website, Generated from the Registry

*Date: 2026-06-17. Status: spec ratified by recon; execution staged below. Sibling to [the strategic replan](./2026-06-17-shadmin-strategic-replan.md). Phases 5 (vanilla base, `d3b0823d7`) and 6 (glass, `b04604334`) are shipped; this is the last replan phase.*

## Goal

Replace the standalone Astro/Starlight `apps/docs` with a `/docs` route inside `apps/website`, with per-component install instructions + nav **generated from the registry** (the payoff of the `author`/`categories`/`docs` fields added 2026-06-17). End state: `apps/docs` deleted, one site, docs that can't drift from the registry.

## Current state (recon 2026-06-17)

- **`apps/website`** = `shadmin-website`, Vite 8 + React 19 SPA. **No router**, **no markdown/MDX renderer** (only `react-shiki` for code highlighting). `src/main.tsx` mounts `<App/>` (one stacked-section landing page). `vite base: "./"`. Marketing design uses the aurora primitives in `src/components/aurora/` + the library `src/styles/aurora.css` (imported directly via relative path).
- **`apps/docs`** = `shadmin-doc`, Astro 6 + Starlight 0.38. Content at `src/content/docs/`: **602 files but only ~290 real `.md`/`.mdx` pages** — the rest are `props/*.json` (typedoc-generated, ~247) + `images/` (~54). Nav is hand-authored in `sidebar.config.mjs` (12 groups). Two Astro behaviors to re-implement: relative-markdown-link rewriting + build-time `CHANGELOG.md` inlining.
- **`registry.json`** = 199 items, each `{name, type, title, description?, categories:["shadmin",<facet>], files, registryDependencies, dependencies, author, docs?}`. Install form: `npx shadcn@latest add @shadmin/<name>` → resolves to `https://shadmin.turtlesocks.dev/r/<name>.json`. Only 4 items carry a `docs` string (leaflet-admin, csv-import, monaco, supabase).

## Reasonable default calls (made on the user's behalf, delegate mode)

| # | Decision | Default | Why |
|---|---|---|---|
| 1 | Router | **`react-router-dom`** | Lightest fit for an existing Vite SPA; the monorepo already uses `react-router`. TanStack Router is heavier with no payoff here. |
| 2 | Markdown pipeline | **`@mdx-js/rollup` + `import.meta.glob`** | Preserves the existing `.md`/`.mdx` authoring + code-groups with least rewrite; pairs with the present `react-shiki`. |
| 3 | Docs visual design | **Reuse the website's existing aurora/glass primitives** | Zero new design surface; the docs match the marketing aesthetic for free. (Does NOT require the aurora axe — see open decision.) |
| 4 | Nav | **Hybrid** | Top "guides" section hand-curated (install, quick-start, app config); component/block sections **generated from `categories[1]`**. |
| 5 | Per-component pages | **Generated** install command (all 4 pkg managers) + `docs`/`description` callout from the registry; link to ported prose where it exists. |
| 6 | Content scope (stage 2) | **Port the real ~290 pages by copy + transform**, DROP the ~8 `enterpriseEntry` RA-EE pages + the `raCoreEntry` external stubs + `props/*.json` (regenerate via typedoc only if prop tables are still wanted) + collapse `guides-and-concepts.md`. Keep `migrating-from-ra-ui-materialui.md`. |
| 7 | `apps/docs` deletion | **Gated on `/docs` reaching parity** — delete only once the website docs render the ported content + nav. Move the `superpowers/specs/` dir out first. |
| 8 | Redirects | Re-implement `/`→`/docs/install` is dropped (landing stays at `/`); re-implement the legacy redirects + SPA deep-link fallback (host rewrite / `_redirects`). |

## Staged execution

1. **Generation (lowest risk, do first).** A script reading `registry.json` → a `docs-manifest` ({ per-item install commands ×4 managers, category-grouped nav, docs/description }). Pure transform + unit test. This is Phase 7 goal #3, standalone-testable.
2. **Foundation.** Add `react-router-dom`; wrap `main.tsx`; extract the landing into a `/` route; add a `/docs` route + `DocsLayout` (sidebar from the manifest + curated guides, content pane, optional TOC) reusing the aurora/glass primitives. Render the **generated component catalog** first (no MDX yet) → preview-verify the route + nav.
3. **MDX pipeline + core guides.** Wire `@mdx-js/rollup` + `import.meta.glob`; re-implement relative-link rewriting + CHANGELOG inlining; port the **backbone guides** (install, quick-start, admin, resource, list, edit, create, show, data-table, simple-form, data-providers, security, themes, translation). Preview-verify.
4. **Full content port.** Copy the remaining real `.md`/`.mdx` pages + `images/`; apply the drop list (#6). Fan out via workflow (pipeline over pages: copy → transform frontmatter/links → verify renders).
5. **Cutover.** Repoint `header.tsx` Docs nav to internal `/docs`; add SPA fallback + legacy redirects; move `superpowers/specs/` to a repo-level home; **delete `apps/docs`** + its `check-*` scripts.

## OPEN DECISION — needs the user (the one genuine human-input gate)

**Marketing-site aurora migration.** Completing the replan's "AXE aurora" (deferred from Phase 6) means migrating `apps/website`'s ~19 marketing components + `apps/docs` (being deleted) off the aurora `@utility glass`/`bezel`/`text-aurora`/`bg-aurora` + `.aurora-orb` onto the new `glass.css`, then deleting `src/styles/aurora.css`. This **changes the look of the public marketing site** — and the user explicitly reserved judgement on glass aesthetics (aurora "underwhelmed"). Options:

- **(A) Migrate now** as part of Phase 7 (one consistent glass system; risk: marketing look shifts, done blind).
- **(B) Keep marketing on aurora; ship docs reusing aurora primitives** (no look change; the `--glass-*`/`.glass` namespace collision stays latent — glass.css + aurora.css never co-load today, registry ships neither). Delete `apps/docs`'s aurora usage only (it's being removed anyway).
- **(C) Migrate marketing to glass.css but treat it as a marketing redesign with the user reviewing the result.**

Recommendation: **(B) for Phase 7**, then (C) as a separate, reviewable marketing pass. Phase 7 ships the docs; the marketing repaint is its own effort with eyes on it.

## Acceptance

- `/docs` route live in `apps/website`; sidebar nav + per-component install generated from `registry.json`; backbone guides render; deep links don't 404.
- `apps/docs` deleted (after parity); no broken internal links.
- `pnpm build` green across the monorepo; the docs route preview-verified (screenshot).
- Generation has a unit test; the registry remains the single source of truth for install commands + component nav.
