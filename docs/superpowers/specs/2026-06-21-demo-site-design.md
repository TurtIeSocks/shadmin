# Demo Site — Design Spec

**Date:** 2026-06-21
**Branch:** web-v2
**Status:** Approved (brainstorm complete) — ready for implementation plan

## Goal

A single, fresh demo that doubles as (a) a "look what you can build" flagship admin and (b) the **live visual companion to the docs** that renders **every** shadmin component — also serving as a manual **visual pass-test surface**. Purple→indigo theme by default. Built fresh; the old `apps/demo` is referenced only to salvage blocks (seeds, resource pages).

## Architecture (one app, folded into www-v2)

The demo is **not** a separate SPA. It folds into `apps/www-v2` as **lazy routes** under `/demo`, so docs↔demo navigation is a client-side `<Link>` (no page reload) and the two share one shell/theme. Heavy deps (`ra-core`, `leaflet`, `ra-data-fakerest`, i18n, the 562-file `admin/` source) are code-split into the demo chunk — they only download/compile when `/demo` is opened.

### The `@/` collision bridge

`admin/` source imports internally via `@/` (562 files — a hard shadcn-registry constraint, cannot change). www-v2's own source uses `@/` → `www-v2/src` (298 files). A Vite project has one `@` target, so they collide. Bridge:

1. **Importer-aware Vite resolver (~20 lines):** resolve `@/` → `packages/shadmin/src` when the importing file lives under `packages/shadmin/`, else → `apps/www-v2/src`. Handles all 860 sites by importer path. **No codemod.**
2. **Scoped package aliases** for the dist-excluded parts only: `shadmin/components/admin/*` and `shadmin/leaflet/* → packages/shadmin/src/...`. The public API (`shadmin/components/ui/*`, `shadmin/lib/*`, core) keeps resolving to **dist via node_modules** — docs/landing are unchanged; the "www-v2 consumes built dist" decision (unified-site-rebuild spec) stays intact. Only admin/leaflet come from source (they have to — not in dist exports).

### Build/router mechanics

- Demo routes are `lazy()` and **excluded from the prerender list** in `react-router.config.ts` (they're client-only ra-core; cannot SSG). Global `ssr:false` already in place; SPA fallback serves `/demo/*`.
- New www-v2 deps: `ra-core`, `ra-data-fakerest`, plus whatever the realtime/i18n demos need (lifted from old demo's deps).
- Accepted cost: a full `tsc`/build now reaches admin + ra-core + leaflet. Dev stays light because demo routes are lazy (admin only compiles when `/demo` is hit).

## Shell, theme, chrome

**Single shell** (one sidebar, one data layer — no nested `<Admin>`): one `<CoreAdminContext>` (dataProvider = fakerest, authProvider = localStorage stub, i18nProvider) wrapping shadmin's **real `<Layout>` + a custom `<Menu>`** with three groups — App / Components / Features. React Router routes render into that one Layout. This dogfoods the real `AppSidebar`/`AppBar`/`Breadcrumb`; those same pieces also get isolated gallery entries. The 6 resources are registered so References resolve names.

**Theme:** reuse www-v2's brand tokens (`--brand-from` violet `#8b5cf6` → `--brand-to` indigo `#4f46e5`). shadcn `--primary` = brand violet; active nav, buttons, dashboard charts ride the gradient. Demo matches the site by default. A **Themes switcher** (Features) swaps presets live.

**Dark mode:** share www-v2's `.dark` on `<html>` — one theme system; the site's existing toggle flips the demo too.

**Auth:** real `LoginPage` gate **prefilled with `demo` / `demo`** (one click in). localStorage stub accepts the seeded creds. Shows the real login component while staying frictionless.

## Three zones

### Zone 1 — App (flagship)

The 6 resources rendered as a small cohesive admin (List / Edit / Show / Create + dashboard). Where page components and chrome are shown **in real product context**.

### Zone 2 — Components (the gallery, coverage workhorse + pass-test)

Sidebar mirrors the docs **component** categories 1:1: Page Components, Viewing, Editing, UI & Layout, Widgets. **One isolated live example per component (~200), gallery entry ↔ docs page exactly.**

### Zone 3 — Features

Bigger-than-one-component demos: **Map** (Leaflet, plots customers' geo), **CSV Import**, **MDX Editor**, **Rich Text Input**, **Block Editor**, **Realtime** (live list/show via localStorage pub/sub provider, lifted from old demo), plus the conceptual App-Config pages as interactive demos — **Themes** (preset switcher), **I18N** (en + fr, `LocalesMenuButton` + `TranslatableInputs/Fields`). **Supabase excluded** (needs env/backend).

## Data backbone (6 resources, ra-data-fakerest)

Resources exist only to (a) back the flagship, (b) provide reference targets, (c) feed list mechanics, (d) feed the map. **Presentational** gallery examples fabricate inline data instead (no resource needed for CronInput, DurationField, etc.).

| Resource | Carries (→ components covered) |
|---|---|
| **customers** | text, email, phone, url, avatar(image), birthday(date), datetime, color, rating, totalSpent(currency), boolean, nullable-boolean, notes(long text), metadata(json), **lat/lng(geo→Map)**, tags(reference-array), reference-many→orders, reference-one→latest order |
| **categories** | text, self-reference(parent tree), reference-many→products — reference target |
| **products** | text, description(markdown/rich/block), image, datasheet(file), price(currency), stock(number), rating, category(reference), tags(reference-array), color, status(select enum), featured(boolean), launchDate(date), warranty(duration), specs(json), variants(array-of-objects → ArrayInput/ArrayField/SimpleFormIterator/DatagridInput) |
| **orders** | number, customer(reference), date(datetime), status(select), items(array line-items), total/shipping(currency), deliveryTime(duration), trackingUrl(url) + list mechanics (filter/sort/pagination/export/count) + bulk-action context |
| **reviews** | rating, customer(reference), product(reference), approved(boolean), date — **bulk-moderation surface** (approve/reject bulk buttons, SelectAllButton), two references at once |
| **tags** | text, color — pure reference target → ChipField/BadgeField/SingleFieldList chips |

**Data:** in-memory `ra-data-fakerest` + seeds adapted from the old demo's retail generator (orders/products/customers/categories already exist there) + localStorage auth stub. Resets on reload.

## Routing & declaration

- `/demo` → small launcher home.
- `/demo/login` → the prefilled login gate.
- `/demo/app/**` → flagship pages for the 6 resources (rendered into the single shell; ra-core `<List>/<Edit>/<Show>/<Create>`).
- `/demo/components/<category>/<slug>` → gallery example. **Path mirrors docs exactly** (`/docs/viewing/data-table` ↔ `/demo/components/viewing/data-table`).
- `/demo/features/<slug>` → feature demo.

**Glob-driven nav:** an `examples/` tree mirrors the docs content tree (`examples/viewing/data-table.tsx` ↔ `content/viewing/data-table.mdx`). `import.meta.glob` auto-discovers; the sidebar is built with the **same `buildNavTree` pattern the docs use** — adding an example = adding a file, no manual nav edits.

**Coverage radar:** cross-check discovered examples against the canonical slug list in the docs `_meta.ts` files. Any slug with **no example file renders a loud "not yet covered" stub** — missing coverage is visible, not silent. This is how full coverage is eyeballed.

**Deep-link:** docs component pages get a "View live →" link to the mirrored `/demo/components/...` URL.

## Gallery example module contract

One file per slug under `examples/`, mirroring the docs tree:

```tsx
// examples/viewing/rating-field.tsx
export const meta = { title: "RatingField" }; // optional; else derived from _meta slug

export default function Example() {
  return (
    <RecordContextProvider value={{ rating: 4 }}>
      <RatingField source="rating" />
    </RecordContextProvider>
  );
}
```

- **`export default`** = the live preview JSX. States worth showing (empty / filled / long) are rendered stacked inline — no "scenes" framework (YAGNI).
- **Presentational** examples wrap inline data (`RecordContextProvider`/`ResourceContextProvider`). **Provider-dependent** ones (`<List resource="orders">…`) use the gallery's shared `<CoreAdminContext>` — no per-file provider boilerplate.
- **Gallery page frame** around every Example: bezel preview surface (reuse the docs `ComponentPreview` look), title, "View docs →" backlink, and a **"Show code" toggle**.
- **"Show code"** = the file's own source imported `?raw` and highlighted at runtime with **`react-shiki`** (already a www-v2 dep). Preview and code are the same file — cannot drift; no hand-copied snippets.

## Visual pass-test (downstream, not this round)

Because every entry is a stable 1:1 URL, a later Playwright pass can iterate all gallery URLs and snapshot them — also feeding the deferred `/docs/images` regeneration. The gallery becomes the screenshot source of truth. Flagged, not built now.

## Scope

**In:** the fold-in build mechanics + resolver bridge; 6 fakerest resources + seeds; single shell (Layout + 3-zone Menu + CoreAdminContext); purple→indigo theme; prefilled login; flagship pages; ~200 gallery examples (1:1 with docs component pages); coverage radar; show-code toggle; the Feature demos listed above.

**Out:** Supabase (needs env); the docs-side iframe embedding (deep-links only for now); the Playwright screenshot harness; any new public package API (`extras` stays dispersed — examples import from real `admin/<subdir>/` paths).

**Salvage from old `apps/demo`:** retail seed/data generator, resource page blocks (orders/products/customers/categories list/edit/show), realtime localStorage pub/sub provider, i18n setup. Rewrite imports to real `shadmin/components/admin/<subdir>/` paths (the old `shadmin/components/extras/*` paths are stale and do not exist).

## Open questions

None blocking. The ~200 gallery examples are mechanical but voluminous — the implementation plan should batch them by category and lean on the coverage radar to track completion.
