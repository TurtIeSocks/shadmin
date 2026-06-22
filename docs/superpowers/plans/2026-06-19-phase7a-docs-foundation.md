# Phase 7a — Docs foundation in the website (generation + route + MDX + backbone guides)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a working, glass-styled `/docs` route inside `apps/website` with registry-generated nav + per-component install, an MDX pipeline that renders the existing Starlight-flavored content (Tabs, callouts, PropsTable), and the backbone guides ported. This is the foundation; the full ~276-page port (7b) and `apps/docs` deletion (7c) follow once this pipeline is proven.

**Architecture:** `react-router-dom` over the existing Vite SPA; landing stays at `/`, docs at `/docs/*`. `@mdx-js/rollup` + `import.meta.glob` load `.md`/`.mdx`. Starlight-only authoring constructs get React shims (`<Tabs>/<TabItem>`, `:::callouts` via `remark-directive`, `<PropsTable>` reading `props/*.json`); code highlighting via the already-installed `react-shiki`. Nav + install commands generate from `packages/shadmin/registry.json`. Docs UI reuses the website's glass/aurora primitives.

**Tech Stack:** React 19, Vite 8, Tailwind v4 (CSS-first `@theme` in index.css — NO tailwind.config), react-router-dom, @mdx-js/rollup, remark-directive + remark-gfm, react-shiki (installed), framer-motion (installed).

## Global Constraints

- Commit directly to `main`; do not push. End commits with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Work in `apps/website`. Do NOT modify `apps/docs` in 7a (it stays the live docs until 7c cutover). Do NOT touch `packages/shadmin` except reading `registry.json`.
- Reuse the website's glass/aurora primitives from `apps/website/src/components/aurora/` for docs UI; match the marketing aesthetic. No new design system.
- Tailwind v4 CSS-first: any new utilities go in `src/index.css` `@theme`/`@utility`, never a config file.
- Install command host is `https://shadmin.turtlesocks.dev/r/<name>.json` and the namespaced form `npx shadcn@latest add @shadmin/<name>` (NOT marmelab — that's stale in some recon notes; the AUTHOR const is `Shadmin <https://shadmin.turtlesocks.dev>`).
- `react-shiki` is already a dep; use it (don't add another highlighter).
- Verify commands: typecheck `pnpm --filter shadmin-website typecheck` (confirm the script name; else `tsc -b` in apps/website); build `pnpm --filter shadmin-website build`; preview via the `preview_*` tools (port per the +100 convention if a launch config is added).

---

### Task 1: Registry → docs-manifest generator

**Files:**
- Create: `apps/website/scripts/generate-docs-manifest.mjs`
- Create (generated, committed): `apps/website/src/docs/registry-manifest.json`
- Create: `apps/website/scripts/generate-docs-manifest.test.mjs` (node:test)
- Modify: `apps/website/package.json` (add `docs:manifest` script + wire into `build`/`predev` if appropriate)

**Interfaces:**
- Produces: `registry-manifest.json` shaped as:
  ```ts
  interface DocsManifest {
    generatedAt: null; // stamped post-gen; keep null in the file to stay deterministic
    items: Array<{
      name: string; title: string; description: string | null;
      type: string; category: string;       // categories[1], or "misc" if absent
      docs: string | null;                    // registry `docs` note
      install: { npm: string; pnpm: string; yarn: string; bun: string };
    }>;
    nav: Array<{ category: string; label: string; items: Array<{ name: string; title: string }> }>;
  }
  ```
  Task 2's DocsLayout imports this JSON.

- [ ] **Step 1: Write the generator**

`generate-docs-manifest.mjs`: read `../../packages/shadmin/registry.json` (relative to the script), map each item → manifest item. Install commands per manager:
```js
const base = `@shadmin/${name}`;
const install = {
  npm: `npx shadcn@latest add ${base}`,
  pnpm: `pnpm dlx shadcn@latest add ${base}`,
  yarn: `yarn dlx shadcn@latest add ${base}`,
  bun: `bunx shadcn@latest add ${base}`,
};
```
`category = item.categories?.[1] ?? "misc"`. Build `nav` by grouping items by category, sorted: a curated category order array first (e.g. `["dashboard","layout","fields","inputs","buttons","data-providers","authentication","maps","editor","data-import","theme","style","ui","hooks","library","components","misc"]`), items alpha by title within. Map category → human label (`fields`→"Fields", `data-providers`→"Data Providers", etc.). Write pretty JSON to `src/docs/registry-manifest.json`.

- [ ] **Step 2: Write the unit test**

`generate-docs-manifest.test.mjs` (node:test + assert): import the pure transform (export a `buildManifest(registry)` fn from the generator), feed a small fixture registry (2-3 items incl. one with `docs`, one without `categories`), assert: install commands for all 4 managers correct; `category` falls back to `"misc"`; nav groups + sorts as specified; `description: null` when absent.

- [ ] **Step 3: Run generator + test**

Run: `cd apps/website && node scripts/generate-docs-manifest.mjs && node --test scripts/generate-docs-manifest.test.mjs`
Expected: writes `src/docs/registry-manifest.json` (198 items); test passes.

- [ ] **Step 4: Wire the npm script**

In `apps/website/package.json` add `"docs:manifest": "node scripts/generate-docs-manifest.mjs"`. (Do NOT block `build` on it yet — manifest is committed; regenerate manually for now. A `prebuild` hook is fine if it's fast.)

- [ ] **Step 5: Commit**

```bash
git add apps/website/scripts/generate-docs-manifest.mjs apps/website/scripts/generate-docs-manifest.test.mjs apps/website/src/docs/registry-manifest.json apps/website/package.json
git commit -m "feat(website): registry -> docs-manifest generator + manifest"
```

---

### Task 2: Router foundation + `/docs` route + DocsLayout + generated catalog

**Files:**
- Modify: `apps/website/package.json` (add `react-router-dom`)
- Modify: `apps/website/src/main.tsx` (wrap in `<BrowserRouter>`)
- Create: `apps/website/src/routes/landing.tsx` (the current `App` body, extracted)
- Modify: `apps/website/src/app.tsx` (becomes the route switch: `/` → Landing, `/docs/*` → DocsLayout)
- Create: `apps/website/src/docs/docs-layout.tsx` (sidebar from manifest nav + curated guides links, content `<Outlet/>`, optional TOC)
- Create: `apps/website/src/docs/components-catalog.tsx` (renders the generated per-component install cards at `/docs/components`)
- Create: `apps/website/src/docs/install-command.tsx` (a small tabbed install-command block: npm/pnpm/yarn/bun, copy button)

**Interfaces:**
- Consumes: `registry-manifest.json` (Task 1).
- Produces: `DocsLayout` (the shell with `<Outlet/>`); routes `/docs` (index → a docs home), `/docs/components` (catalog), `/docs/components/:name` (single-component install + description/docs callout). Task 3 adds `/docs/:slug` MDX guide routes inside this layout.

- [ ] **Step 1: Add router + wrap main**

Add `react-router-dom` (`pnpm --filter shadmin-website add react-router-dom`). In `main.tsx`, wrap `<App/>` in `<BrowserRouter>`. Reconcile the lockfile (`pnpm install`).

- [ ] **Step 2: Extract landing, add route switch**

Move the current `App` JSX (PageAurora/GlassFilter/Header/main/Footer) into `src/routes/landing.tsx` as `<Landing/>`. Rewrite `app.tsx` to:
```tsx
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/docs" element={<DocsLayout />}>
    <Route index element={<DocsHome />} />
    <Route path="components" element={<ComponentsCatalog />} />
    <Route path="components/:name" element={<ComponentPage />} />
  </Route>
</Routes>
```
Keep `<PageAurora/>` + `<GlassFilter/>` mounted app-wide (move them above `<Routes>`) so both landing and docs get the glass atmosphere.

- [ ] **Step 3: Build DocsLayout (glass-styled)**

`docs-layout.tsx`: a two-column shell — left sidebar (curated "Guides" links placeholder + the manifest `nav` groups, each a collapsible section linking `/docs/components/:name`), right `<Outlet/>` in a glass content panel (reuse `<GlassPanel>`). Reuse `Header`/`Footer` or a docs-specific slim header with the same nav. Sidebar active-state via `useLocation`. Mobile: a `<Drawer>`/disclosure.

- [ ] **Step 4: Catalog + single-component + install block**

`components-catalog.tsx`: render the manifest grouped by `nav`, each item a glass card linking to its page. `ComponentPage` (`/docs/components/:name`): look up the manifest item, render title + description + the `docs` note (if any) in a callout + `<InstallCommand install={item.install} />`. `install-command.tsx`: 4-tab (npm/pnpm/yarn/bun) block with a copy-to-clipboard button, glass-styled.

- [ ] **Step 5: Typecheck + build + preview-verify**

Run: `pnpm --filter shadmin-website typecheck && pnpm --filter shadmin-website build`. Then preview-verify: start the preview, navigate to `/docs/components`, confirm the catalog renders the generated nav + a component page shows the install tabs. Capture a screenshot.

- [ ] **Step 6: Commit**

```bash
git add apps/website/src apps/website/package.json pnpm-lock.yaml
git commit -m "feat(website): /docs route + DocsLayout + registry-generated component catalog"
```

---

### Task 3: MDX pipeline + Starlight-construct shims

**Files:**
- Modify: `apps/website/package.json` (add `@mdx-js/rollup`, `remark-directive`, `remark-gfm`; `react-shiki` already present)
- Modify: `apps/website/vite.config.ts` (add the mdx plugin + the relative-link remark plugin + the CHANGELOG-inline plugin)
- Create: `apps/website/src/docs/mdx/tabs.tsx` (`<Tabs>`/`<TabItem>` React shim)
- Create: `apps/website/src/docs/mdx/callout.tsx` (`<Callout type>` for `:::note/tip/warning`)
- Create: `apps/website/src/docs/mdx/props-table.tsx` (`<PropsTable name>` reading `props/*.json`)
- Create: `apps/website/src/docs/mdx/code-block.tsx` (react-shiki wrapper for fenced code, honoring `title`/`lang`/`diff`)
- Create: `apps/website/src/docs/mdx/mdx-components.tsx` (the `MDXProvider` component map: a/img/pre/code → our shims)
- Create: `apps/website/scripts/remark-relative-links.mjs` (rewrite `./page` / `./page.md#x` → `/docs/page#x`)
- Create: `apps/website/scripts/vite-inline-changelog.mjs` (port the Astro CHANGELOG inliner)

**Interfaces:**
- Consumes: nothing from Tasks 1-2 directly; produces the MDX rendering capability Task 4 relies on.
- Produces: `<Tabs>`, `<TabItem>`, `<Callout>`, `<PropsTable>`, the `mdxComponents` map, and the vite config that compiles `.mdx` with these globally available.

- [ ] **Step 1: Wire @mdx-js/rollup**

In `vite.config.ts`, add `mdx({ remarkPlugins: [remarkGfm, remarkDirective, remarkRelativeLinks, remarkCalloutDirective], providerImportSource: "@/docs/mdx/mdx-components" })` BEFORE `react()` (mdx must run first). Add the CHANGELOG-inline plugin (port `apps/docs`'s `inlineChangelogPlugin`: on `id.endsWith("changelog.mdx")`, append repo-root `CHANGELOG.md`). Set `.mdx`/`.md` handling.

- [ ] **Step 2: Tabs + Callout shims**

`tabs.tsx`: `<Tabs>` renders a tab bar from its `<TabItem label>` children + a panel; glass-styled, keyboard-accessible. `callout.tsx`: `<Callout type="note|tip|warning|danger">` glass admonition with an icon. Add a small remark plugin (`remarkCalloutDirective`) converting `:::note ... :::` (remark-directive `containerDirective` named note/tip/warning) → `<Callout type=...>`.

- [ ] **Step 3: PropsTable shim**

`props-table.tsx`: `<PropsTable name="X" />` — kebab-case the name (with the ABBREVIATION_OVERRIDES from `apps/docs/src/components/props-table.astro`: `BBox`→`bbox`, `GeoJson`→`geojson`), `import.meta.glob` the `props/*.json` (Task 4 copies them to `apps/website/src/docs/content/props/`), render a table (name/type/optional/comment). Render nothing gracefully if the JSON is missing.

- [ ] **Step 4: Code highlighting**

`code-block.tsx`: wrap `react-shiki` to render fenced code with the `title` (filename chip) + `lang` + `diff` support, glass-framed. Wire it into `mdx-components.tsx` as the `pre`/`code` mapping.

- [ ] **Step 5: mdx-components map + relative-link remark**

`mdx-components.tsx`: export `useMDXComponents`/the component map — `a` → react-router `<Link>` (internal) or `<a>` (external), `img` → a styled img, `pre`/`code` → CodeBlock, plus `Tabs`/`TabItem`/`Callout`/`PropsTable` so MDX can use them without imports. `remark-relative-links.mjs`: rewrite link URLs starting `./` (and `.md`/`.mdx` + `#anchor`) → `/docs/<page>#anchor`.

- [ ] **Step 6: Smoke-test with one MDX file**

Create a throwaway `apps/website/src/docs/content/_smoke.mdx` exercising a Callout, a Tabs/TabItem, a fenced code block with a title, a relative link, and `<PropsTable name="InspectorButton" />` (copy that one props JSON for the test). Add a temporary route, preview-verify all 5 render, then delete the smoke file + route.

- [ ] **Step 7: Typecheck + build + commit**

Run: `pnpm --filter shadmin-website typecheck && pnpm --filter shadmin-website build`. Commit:
```bash
git add apps/website/src apps/website/scripts apps/website/vite.config.ts apps/website/package.json pnpm-lock.yaml
git commit -m "feat(website): MDX pipeline + Starlight-construct shims (Tabs/Callout/PropsTable/code/links)"
```

---

### Task 4: Port the backbone guides + wire guide routes

**Files:**
- Create: `apps/website/src/docs/content/*.mdx` (the ~14 backbone guides, copied + transformed from `apps/docs/src/content/docs/`)
- Create: `apps/website/src/docs/content/props/*.json` (only the props JSON referenced by the backbone guides)
- Create: `apps/website/src/docs/content/images/*` (only images referenced by the backbone guides)
- Modify: `apps/website/src/app.tsx` (add `/docs/:slug` route resolving MDX via `import.meta.glob`)
- Modify: `apps/website/src/docs/docs-layout.tsx` (wire the curated Guides nav section to these slugs)

**Interfaces:**
- Consumes: the MDX pipeline (Task 3), the manifest nav (Task 1).

- [ ] **Step 1: Glob-load the guide MDX + add the route**

In `app.tsx` (or a `docs-routes.tsx`), `const guides = import.meta.glob("./docs/content/*.mdx", { eager: true })`; add `<Route path="/docs/:slug" element={<MdxGuide guides={guides} />} />` that renders the matched module's default export inside `DocsLayout`'s outlet, with the frontmatter `title` as the page H1 (MDX frontmatter via the mdx plugin's frontmatter handling — confirm `@mdx-js/rollup` exposes it, else add `remark-frontmatter` + `remark-mdx-frontmatter`).

- [ ] **Step 2: Port the 14 backbone guides**

Copy these from `apps/docs/src/content/docs/` → `apps/website/src/docs/content/`, transforming each: drop the `@astrojs/starlight/components` import (Tabs/TabItem now global), keep `<PropsTable>`/callout syntax (the pipeline handles them), leave relative links as-is (the remark plugin rewrites). Guides: `install.mdx`, `quick-start-guide.mdx`, `admin.md→.mdx`, `resource.md`, `list.md`, `edit.md`, `create.md`, `show.md`, `data-table.md`, `simple-form.md`, `data-providers.md`, `security.md`, `theming.md` (confirm exact filename), `translation.md` (confirm). Copy the props JSON + images each references (grep each guide for `PropsTable name=` and `./images/`).

- [ ] **Step 3: Wire the Guides nav**

In `docs-layout.tsx`, populate the curated "Guides" sidebar section with these slugs (hand-ordered: Install, Quick Start, Admin, Resource, …).

- [ ] **Step 4: Typecheck + build + preview-verify the whole 7a**

Run: `pnpm --filter shadmin-website typecheck && pnpm --filter shadmin-website build`. Preview-verify: `/docs/install` and `/docs/quick-start-guide` render with Tabs/callouts/code; a `<PropsTable>` page renders a table; the sidebar shows Guides + the generated component groups; internal links navigate; dark/light parity holds. Screenshot the rendered install guide.

- [ ] **Step 5: Commit**

```bash
git add apps/website/src
git commit -m "feat(website): port backbone docs guides + MDX guide routes"
```

---

## Out of scope (7b / 7c — separate plans after 7a is proven)

- **7b — full content port** (~276 remaining real pages + their images/props): fan out via workflow (pipeline: copy → transform → verify-renders), apply the drop list (7 `enterpriseEntry` RA-EE pages, collapse `guides-and-concepts.md`, drop `raCoreEntry` stubs [none active]). Designed against this proven pipeline.
- **7c — cutover:** repoint `header.tsx` Docs nav → `/docs`; SPA deep-link fallback + legacy redirects; move `apps/docs/superpowers/specs/` to a repo-level home; re-home or retire the `check-sidebar/docs/stories/specs/coverage` scripts (decide then — they guard doc coverage); **delete `apps/docs`** + the now-docs-only library `aurora.css`; confirm no root CI script references the deleted paths.

## Assumptions (delegate-mode calls, flag for review)

1. **Incremental delivery** (7a now; 7b/7c follow) rather than one-shotting 290 pages — so the port transform is designed against a working pipeline.
2. **Keep prop tables** (copy `props/*.json` + a React `<PropsTable>`) — real docs value; the typedoc regen pipeline is deferred (the committed JSON is current).
3. **Docs UI = the website's glass primitives** (per the user's "same style as the website").
4. **`react-router-dom`** + **`@mdx-js/rollup`** per the ratified Phase 7 spec defaults.

## Self-Review

- **Spec coverage (Phase 7 stages 1-3):** Stage 1 (generation) → Task 1; Stage 2 (foundation + catalog) → Task 2; Stage 3 (MDX pipeline + shims + backbone guides) → Tasks 3+4. Stages 4-5 explicitly deferred to 7b/7c.
- **Placeholders:** the MDX-infra steps name exact plugins/files/APIs; some steps say "confirm the exact filename/script name" where recon couldn't pin it — those are verification instructions, not placeholders.
- **Type consistency:** `DocsManifest` shape (Task 1) is consumed by DocsLayout/catalog (Task 2); the `mdxComponents` map + shims (Task 3) are used by the ported guides (Task 4).
