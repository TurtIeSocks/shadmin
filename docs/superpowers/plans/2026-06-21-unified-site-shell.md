# Unified Site Shell (Phase 1.5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** One sidebar-07-style `SiteShell` shared across **docs + demo** (incl. `/docs` index), replacing the docs' bespoke offcanvas shell AND the demo's shadmin `<Layout>` usage — so the two surfaces feel seamless. Landing page untouched.

**Architecture:** A www-v2-owned `SiteShell` built on `shadmin/components/ui/sidebar` primitives in the **sidebar-07** shape (`collapsible="icon"`, `SidebarRail`, header dropdown, footer). It owns the `SidebarProvider` + `SidebarInset` (header = trigger + breadcrumb + right actions; content = `<Outlet/>`). NO ra-core — the demo keeps its `<CoreAdminContext>` in `DemoLayout`, and `SiteShell` sits inside it. shadmin's `AppSidebar` is ALREADY sidebar-07 (`variant="floating" collapsible="icon"`, header/content/footer) — model the shell on it so the look is essentially identical to what shadmin users get.

**Tech Stack:** React Router 7 (framework, ssr:false), `shadmin/components/ui/*` (src-resolved), shadcn `sidebar-07` block (reference), Tailwind v4, Biome, `node:test`.

## Global Constraints

- **Path A:** ONE shared `SiteShell`. The demo drops shadmin's admin `<Layout>`/`<AppBar>`/`<AppSidebar>` as its chrome (those components are still demoed in the UI&Layout gallery). The demo keeps `<CoreAdminContext>` (DemoLayout).
- **Landing untouched** — `SiteNav` (top NavBar) stays for non-docs/non-demo routes.
- **Top dropdown = a section nav**, not a team selector: Home / Docs / Demo switcher in the sidebar header (replaces the standalone NavBar for docs+demo).
- **Breadcrumb in the inset header**, next to the `SidebarTrigger`, for BOTH surfaces (docs computes from slug; demo uses ra-core's breadcrumb portal).
- **Collapse = icon** (`collapsible="icon"`) + `SidebarRail` — replaces the docs offcanvas. `/docs` index loads with the sidebar **collapsed** by default, cards in the content.
- Docs KEEP: ToC (right rail), doc-search, prose width — re-homed into the new inset.
- ra-core APIs from `shadmin-core` (never `ra-core`); radix never direct (use `shadmin/components/ui/*`).
- Tests `node:test` pure-logic only; UI verified via typecheck + build + preview. Commands: `pnpm turbo run {typecheck,build,test} --filter=www-v2`, `biome check apps/www-v2`.
- After route/layout changes restart the dev server (HMR misses new route modules); resize preview to desktop (viewport reads vw:0).

---

### Task 1: SiteShell + SiteSidebar + SectionSwitcher (the shared shell)

**Files:**
- Create: `apps/www-v2/src/components/site-shell/site-shell.tsx`
- Create: `apps/www-v2/src/components/site-shell/site-sidebar.tsx`
- Create: `apps/www-v2/src/components/site-shell/section-switcher.tsx`
- Reference (read-only): `packages/shadmin/src/components/admin/layout/app-sidebar.tsx`

**Interfaces:**
- Produces: `SiteShell({ sidebar: ReactNode, breadcrumb?: ReactNode, actions?: ReactNode, defaultOpen?: boolean, children: ReactNode })` — renders `<SidebarProvider defaultOpen>` + the passed `sidebar` + `<SidebarRail/>` + `<SidebarInset>` (header: `<SidebarTrigger/>` + a `<Separator/>` + `breadcrumb` + right-aligned `actions`; body: `children`). `SiteSidebar({ header?, children, footer? })` — `<Sidebar variant="floating" collapsible="icon">` with `<SidebarHeader>{header ?? <SectionSwitcher/>}</SidebarHeader><SidebarContent>{children}</SidebarContent><SidebarFooter>{footer}</SidebarFooter>`. `SectionSwitcher` — a `DropdownMenu` in the header listing Home / Docs / Demo (active highlighted), styled like sidebar-07's TeamSwitcher.

- [ ] **Step 1:** Pull the sidebar-07 reference into a scratch dir to lift the rail/dropdown-header/collapsible patterns: `npx shadcn@latest add sidebar-07 --cwd /tmp/sb07 --yes` (or `view`/`get_item_examples` via the shadcn MCP). Read `team-switcher.tsx`, `nav-user.tsx`, the page header (SidebarTrigger + Separator + Breadcrumb), and `SidebarRail` usage. Do NOT commit the scratch.
- [ ] **Step 2:** Implement `site-shell.tsx` per the interface. Inset header: `flex h-12 items-center gap-2 border-b px-4`, `<SidebarTrigger/>` + `<Separator orientation="vertical" className="h-4"/>` + `{breadcrumb}` + `<div className="ml-auto flex items-center gap-2">{actions}</div>`. Provide an element with `id="breadcrumb"` in the header so ra-core's breadcrumb portal (demo) has a target.
- [ ] **Step 3:** Implement `site-sidebar.tsx` (variant="floating" collapsible="icon"; brand width vars `--sidebar-width`/`--sidebar-width-icon` like AppSidebar).
- [ ] **Step 4:** Implement `section-switcher.tsx` (DropdownMenu: Home `/`, Docs `/docs`, Demo `/demo`; current section highlighted via `useLocation`).
- [ ] **Step 5:** Smoke-mount via a temporary route or by wiring into one surface in the next task. Run typecheck + build (green). Controller previews the empty shell.
- [ ] **Step 6:** Commit `feat(site): SiteShell + SiteSidebar + SectionSwitcher (sidebar-07 shell)`.

---

### Task 2: Shared NavTree renderer

**Files:**
- Create: `apps/www-v2/src/components/site-shell/nav-tree.tsx`
- Reference: `apps/www-v2/src/docs/docs-layout.tsx` (the existing `SectionNav`)

**Interfaces:**
- Produces: `NavTree({ tree: DocGroup[], hrefFor: (slug: string) => string, activeSlug?: string, openDirs, onToggle })` — renders the collapsible-group / leaf nav with `SidebarGroup`/`SidebarMenu`/`Collapsible`/`SidebarMenuSub*`, generalized over `hrefFor` so docs (`/docs/<slug>`) and the gallery (`/demo/components/<slug>`) share it.
- Consumes: `DocGroup`/`DocNode` from `@/docs/types`.

- [ ] **Step 1:** Extract the nav-rendering JSX from docs `SectionNav` into `NavTree`, parameterized by `hrefFor` + active logic (don't hard-code `/docs/`). Keep the collapsible open-state handling.
- [ ] **Step 2:** Typecheck + build green. (No standalone test — it's presentational; verified when docs adopts it in Task 3.)
- [ ] **Step 3:** Commit `feat(site): shared NavTree renderer`.

---

### Task 3: Migrate docs to SiteShell

**Files:**
- Modify: `apps/www-v2/src/docs/docs-layout.tsx`
- Modify: `apps/www-v2/src/docs/docs-index.tsx` (sidebar collapsed default + cards stay)
- Possibly remove: the inline `SectionNav` (now `NavTree`), `DocsTopBar` (folds into SiteShell inset)

**Interfaces:**
- Consumes: `SiteShell`, `SiteSidebar`, `NavTree` (Tasks 1-2); docs nav tree from `@/docs/nav-content`.

- [ ] **Step 1:** Rewrite `docs-layout.tsx` to render `<SiteShell sidebar={<SiteSidebar><NavTree tree={docNav} hrefFor={s=>`/docs/${s}`} .../></SiteSidebar>} breadcrumb={<DocsBreadcrumb slug={activeSlug}/>} actions={<><DocSearch/><ThemeToggle/></>}><Outlet/><Toc/></SiteShell>`. Keep the ToC (right rail) + prose width inside the inset content. Mobile: rely on icon-collapse + rail; keep the `Sheet` only if mobile UX needs it.
- [ ] **Step 2:** `/docs` index: pass `defaultOpen={false}` (sidebar collapsed) and keep the existing category cards as content.
- [ ] **Step 3:** Breadcrumb: compute from the active doc slug (section → page). A small `DocsBreadcrumb` using shadcn `Breadcrumb` primitives.
- [ ] **Step 4:** Typecheck + build green. Controller previews `/docs`, `/docs/viewing/data-table`, `/docs` index: sidebar icon-collapses, breadcrumb + trigger in the inset header, ToC + search work, section switcher jumps Home/Docs/Demo, no console errors.
- [ ] **Step 5:** Commit `feat(docs): adopt the unified SiteShell`.

---

### Task 4: Migrate demo to SiteShell

**Files:**
- Modify: `apps/www-v2/src/demo/shell/demo-shell.tsx` (use SiteShell, drop shadmin `<Layout>`)
- Modify: `apps/www-v2/src/demo/shell/demo-sidebar.tsx` (becomes the SiteSidebar content: 3 zones)

**Interfaces:**
- Consumes: `SiteShell`, `SiteSidebar` (Task 1); shadmin admin `Breadcrumb` portal (ra-core) targets the inset header `#breadcrumb`.

- [ ] **Step 1:** Rewrite `demo-shell.tsx`: `<SiteShell sidebar={<SiteSidebar>{demoZones}</SiteSidebar>} breadcrumb={<DemoBreadcrumb/>} actions={<><ThemeToggle/><UserMenu.../></>}><Outlet/></SiteShell>`. Drop the `shadmin/components/admin` `Layout` import. Keep `DemoLayout`'s `<CoreAdminContext>` wrapping.
- [ ] **Step 2:** Demo breadcrumb: the flagship pages already render ra-core breadcrumbs that portal to `#breadcrumb`; ensure SiteShell's inset header provides that element (Task 1 Step 2). For the gallery/features (Phase 2/3) a static breadcrumb is fine.
- [ ] **Step 3:** `demo-sidebar.tsx` content stays 3 zones (App resources from `demoResources`, Components/Features placeholders) — now rendered inside `SiteSidebar`. The Components zone will get `NavTree` in Phase 2.
- [ ] **Step 4:** Typecheck + build green. Controller previews `/demo/app` + a resource page: sidebar-07 chrome, icon-collapse + rail, breadcrumb in header, 6 resources nav, section switcher works, DataTable/forms render, no console errors. Confirm the SkipNavigation/sidebar still behave (Tailwind @source already covers admin src).
- [ ] **Step 5:** Commit `feat(demo): adopt the unified SiteShell, drop shadmin Layout`.

---

### Task 5: Cohesion + cleanup

**Files:**
- Modify: `apps/www-v2/src/components/site-nav.tsx` (confirm it's landing-only now)
- Remove any now-dead code (old `SectionNav`, `DocsTopBar`, `DemoShell` shadmin-Layout remnants)

- [ ] **Step 1:** Verify `SiteNav` (top NavBar) only renders on landing (and any non-docs/non-demo route). Cross-nav: landing → Docs/Demo lands in SiteShell; SectionSwitcher returns to Home.
- [ ] **Step 2:** Delete dead code surfaced by Tasks 3-4. Grep for unused `DocsTopBar`/`SectionNav`/`Layout` imports.
- [ ] **Step 3:** Full gate: `pnpm turbo run typecheck build test --filter=www-v2` + `biome check apps/www-v2` (all green). Controller previews landing + docs + docs-index + demo, light/dark, desktop + a mobile width — confirms seamless + no regressions.
- [ ] **Step 4:** Commit `chore(site): remove superseded shells + cohesion pass`.

---

## Notes
- This is a refactor of the WORKING docs shell — watch for regressions (ToC, search, anchor scroll, mobile). Verify docs thoroughly in Task 3.
- The `SiteShell` is where the Phase 2 gallery + Phase 3 features live — building it now means the gallery is authored into the final chrome, not retrofitted.
