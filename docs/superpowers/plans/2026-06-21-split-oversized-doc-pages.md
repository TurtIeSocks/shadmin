# Split Oversized Doc Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Break the 5 oversized docs pages into 3-level-nested sub-pages with a prev/next footer, so no page exceeds ~280 lines, without losing content or breaking links.

**Architecture:** The docs nav is filesystem-driven (`import.meta.glob` over `content/**`), assembled by a pure `buildNavTree`. We add nested-group support (`indexSlug`), make `SectionNav` recurse, redirect bare split-page URLs to their Overview, add a prev/next footer + multi-level breadcrumb, then physically split 5 MDX pages into sub-page files and rewrite inbound anchor links.

**Tech Stack:** React Router 7 (SPA prerender), Vite, React 19, MDX (`@mdx-js/rollup`), shadcn `Collapsible`/`Breadcrumb`, Tailwind v4. Tests: `node --test` on pure `.ts` only (no `.tsx`/browser test runner in www-v2).

## Global Constraints

- Only these 5 pages change structurally: `getting-started/quick-start-guide`, `page-components/edit`, `page-components/list`, `viewing/data-table`, `editing/simple-form`. No other page's content changes except inbound cross-link/anchor rewrites.
- Nav stays filesystem-driven. Nav titles come from frontmatter `title` (via `nav-content.ts`), ordering from `_meta.ts`.
- Anchor ids are produced by `rehype-slug` (lowercase; runs of non-alphanumerics → single `-`; e.g. `## Mutation Mode` → `#mutation-mode`, `` ## `render` `` → `#render`). New cross-links must use those exact anchors.
- `@/` = package src. Components that also export non-components must keep hooks/types in sibling `.ts` files (avoid `react-refresh/only-export-components`).
- Every task ends green: `pnpm --filter www-v2 test`, `pnpm --filter www-v2 typecheck`, and (for component/content tasks) `pnpm --filter www-v2 build`. Final task additionally asserts 0 stale bare split-page links / dead `#anchors` in built HTML.
- Work happens in `apps/www-v2`. Commit directly to the `web-v2` branch.

---

## File Structure

**New files:**
- `apps/www-v2/src/docs/nav-sequence.ts` — pure helpers: `findGroup`, `flattenLeaves`, `prevNext` (sibling `.ts` so it stays node-testable + dodges react-refresh).
- `apps/www-v2/src/docs/nav-sequence.test.ts` — node:test for the above.
- `apps/www-v2/src/docs/prev-next.tsx` — the footer component.
- Per split page: a directory of sub-page `.mdx` files + a `_meta.ts` (replacing the old single `index.mdx`).

**Modified files:**
- `apps/www-v2/src/docs/types.ts` — add `indexSlug?` to `DocGroup`.
- `apps/www-v2/src/docs/nav.ts` — compute `indexSlug` in `buildNavTree`.
- `apps/www-v2/src/docs/nav.test.ts` — cover nested groups.
- `apps/www-v2/src/docs/docs-layout.tsx` — `SectionNav` recursion.
- `apps/www-v2/src/docs/mdx-page.tsx` — group redirect, multi-level breadcrumb, prev/next mount.
- `apps/www-v2/src/docs/category-index.tsx` — render child groups as cards.
- The 4 parent `_meta.ts` (`getting-started`, `page-components`, `viewing`, `editing`) — flip the split page's entry from `{ slug }` to `{ dir }`.

---

## Content-Split Procedure (applies to Tasks 7–11)

Each content task converts one `<section>/<page>/index.mdx` into a directory of sub-pages. The mechanical steps are identical; only the per-task data (sub-file map, `_meta`, frontmatter) differs.

1. Read the source `index.mdx`. Note its frontmatter and the exact `##` heading texts (the task's map references them by text).
2. For each target sub-page, create `<section>/<page>/<file>.mdx` with:
   - frontmatter `title:` and `description:` from the task's table,
   - the verbatim body content of its assigned `##` sections, in source order, **unchanged** (do not edit prose/code; only move it).
3. Create `<section>/<page>/_meta.ts` listing the sub-files in order (see task).
4. Delete the original `<section>/<page>/index.mdx`.
5. Flip the parent `<section>/_meta.ts` entry for this page from `{ slug: "<page>", title: "X" }` to `{ dir: "<page>", title: "X" }` (same title).
6. Verify: `pnpm --filter www-v2 build` succeeds; the sub-pages prerender (`build/client/docs/<section>/<page>/<file>/index.html` exist); bare `/docs/<section>/<page>` redirects to the Overview (manual preview); the sidebar shows the page as an expandable group.
7. Commit.

**Frontmatter template** for every sub-page:
```mdx
---
title: "<Sub-page Title>"
description: "<one line>"
---

<moved section bodies>
```
Do **not** re-add a top-level `# Heading` (the renderer prints `title`).

---

## Task 1: Nested-group `indexSlug` in buildNavTree

**Files:**
- Modify: `apps/www-v2/src/docs/types.ts`
- Modify: `apps/www-v2/src/docs/nav.ts`
- Test: `apps/www-v2/src/docs/nav.test.ts`

**Interfaces:**
- Produces: `DocGroup.indexSlug?: string` — the slug of a group's first leaf descendant (in `_meta` order). Consumed by Tasks 3, 4, 6.

- [ ] **Step 1: Write the failing test** — append to `nav.test.ts`:

```ts
test("buildNavTree sets indexSlug to a group's first leaf descendant", () => {
  const slugs = [
    "page-components/edit/overview",
    "page-components/edit/layout",
    "page-components/show",
  ];
  const metas = {
    "": [{ dir: "page-components", title: "Page Components" }],
    "page-components": [{ dir: "edit", title: "Edit" }, { slug: "show", title: "Show" }],
    "page-components/edit": [{ slug: "overview" }, { slug: "layout" }],
  };
  const tree = buildNavTree(slugs, metas, (s) => s.split("/").pop()!);
  const section = tree.find((g) => g.dir === "page-components")!;
  const editGroup = section.children.find(
    (c): c is import("./types").DocGroup => c.kind === "group" && c.dir === "page-components/edit",
  )!;
  assert.equal(editGroup.indexSlug, "page-components/edit/overview");
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm --filter www-v2 test`
Expected: FAIL — `editGroup.indexSlug` is `undefined`.

- [ ] **Step 3: Add the type** — in `types.ts`, change `DocGroup` to:

```ts
export interface DocGroup { kind: "group"; dir: string; title: string; indexSlug?: string; children: DocNode[]; }
```

- [ ] **Step 4: Implement in `nav.ts`** — add this helper above `buildNavTree`:

```ts
function firstLeafSlug(nodes: DocNode[]): string | undefined {
  for (const n of nodes) {
    if (n.kind === "leaf") return n.slug;
    const s = n.indexSlug ?? firstLeafSlug(n.children);
    if (s) return s;
  }
  return undefined;
}
```

In `build`, where groups are pushed (both the meta-ordered branch and the appended-alphabetical branch), set `indexSlug`. Change each `{ kind: "group", dir: full, title: ..., children: build(full) }` to capture children first:

```ts
const children = build(full);
ordered.push({ kind: "group", dir: full, title: e.title ?? titleize(e.dir), indexSlug: firstLeafSlug(children), children });
```

and similarly for the alphabetical-append branch:

```ts
.forEach((d) => {
  const children = build(d);
  ordered.push({ kind: "group", dir: d, title: titleize(d.split("/").pop()!), indexSlug: firstLeafSlug(children), children });
});
```

- [ ] **Step 5: Run test, verify it passes**

Run: `pnpm --filter www-v2 test`
Expected: PASS (5/5).

- [ ] **Step 6: Commit**

```bash
git add apps/www-v2/src/docs/types.ts apps/www-v2/src/docs/nav.ts apps/www-v2/src/docs/nav.test.ts
git commit -m "feat(www-v2): compute indexSlug for nested nav groups"
```

---

## Task 2: Prev/next sequence helpers

**Files:**
- Create: `apps/www-v2/src/docs/nav-sequence.ts`
- Test: `apps/www-v2/src/docs/nav-sequence.test.ts`

**Interfaces:**
- Consumes: `DocGroup` (with `indexSlug`), `DocNode` from `./types`.
- Produces:
  - `findGroup(nodes: DocNode[], dir: string): DocGroup | undefined`
  - `prevNext(slug: string, tree: DocGroup[]): { prev?: string; next?: string }` — returns the previous/next **sibling sub-page slug** within `slug`'s immediate parent group; returns `{}` unless the parent dir is a split-page dir (i.e. contains a `/`). Consumed by Task 5.

- [ ] **Step 1: Write the failing test** — create `nav-sequence.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert";
import { buildNavTree } from "./nav.ts";
import { prevNext, findGroup } from "./nav-sequence.ts";

const slugs = [
  "page-components/edit/overview",
  "page-components/edit/layout",
  "page-components/edit/advanced",
  "page-components/show",
];
const metas = {
  "": [{ dir: "page-components", title: "Page Components" }],
  "page-components": [{ dir: "edit", title: "Edit" }, { slug: "show", title: "Show" }],
  "page-components/edit": [{ slug: "overview" }, { slug: "layout" }, { slug: "advanced" }],
};
const tree = buildNavTree(slugs, metas, (s) => s.split("/").pop()!);

test("prevNext returns neighbours within the split group", () => {
  assert.deepEqual(prevNext("page-components/edit/layout", tree), {
    prev: "page-components/edit/overview",
    next: "page-components/edit/advanced",
  });
  assert.deepEqual(prevNext("page-components/edit/overview", tree), {
    next: "page-components/edit/layout",
  });
  assert.deepEqual(prevNext("page-components/edit/advanced", tree), {
    prev: "page-components/edit/layout",
  });
});

test("prevNext returns empty for a non-split (section-level) page", () => {
  assert.deepEqual(prevNext("page-components/show", tree), {});
});

test("findGroup locates a nested group by dir", () => {
  assert.equal(findGroup(tree, "page-components/edit")?.dir, "page-components/edit");
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm --filter www-v2 test`
Expected: FAIL — cannot find module `./nav-sequence.ts`.

- [ ] **Step 3: Implement `nav-sequence.ts`:**

```ts
import type { DocGroup, DocNode } from "./types";

export function findGroup(nodes: DocNode[], dir: string): DocGroup | undefined {
  for (const n of nodes) {
    if (n.kind !== "group") continue;
    if (n.dir === dir) return n;
    const found = findGroup(n.children, dir);
    if (found) return found;
  }
  return undefined;
}

/** Prev/next sibling sub-page within `slug`'s parent group. Only meaningful for
 *  split sub-pages, whose parent dir is itself nested (contains a "/"). */
export function prevNext(
  slug: string,
  tree: DocGroup[],
): { prev?: string; next?: string } {
  const parentDir = slug.split("/").slice(0, -1).join("/");
  if (!parentDir.includes("/")) return {}; // section-level page, not a split set
  const group = findGroup(tree, parentDir);
  if (!group) return {};
  const leaves = group.children
    .filter((c): c is import("./types").DocLeaf => c.kind === "leaf")
    .map((c) => c.slug);
  const i = leaves.indexOf(slug);
  if (i === -1) return {};
  return { prev: leaves[i - 1], next: leaves[i + 1] };
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm --filter www-v2 test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/www-v2/src/docs/nav-sequence.ts apps/www-v2/src/docs/nav-sequence.test.ts
git commit -m "feat(www-v2): prevNext + findGroup nav-sequence helpers"
```

---

## Task 3: SectionNav renders nested groups recursively

**Files:**
- Modify: `apps/www-v2/src/docs/docs-layout.tsx`

**Interfaces:**
- Consumes: `DocGroup.indexSlug`, `DocNode` (Task 1).

Today `SectionNav` maps `navTree` and renders each section's children filtered to `kind === "leaf"`, dropping nested groups. Rewrite so a section's children render via a recursive node renderer: a leaf → `SidebarMenuButton` + `NavLink` (unchanged); a nested group → a `Collapsible` whose `CollapsibleTrigger` is a `NavLink` to `group.indexSlug` plus a chevron, with its children rendered one indent deeper.

- [ ] **Step 1: Add a recursive child renderer** inside `docs-layout.tsx` (above `SectionNav`). It reuses the existing `open`/`toggle`/`activeSlug`/`onNavigate` props:

```tsx
function NavChildren({
  nodes,
  depth,
  ...nav
}: { nodes: DocNode[]; depth: number } & NavProps) {
  return (
    <SidebarMenu>
      {nodes.map((node) =>
        node.kind === "leaf" ? (
          <SidebarMenuItem key={node.slug}>
            <SidebarMenuButton asChild isActive={node.slug === nav.activeSlug} size="sm">
              <NavLink to={`/docs/${node.slug}`} onClick={nav.onNavigate} style={{ paddingLeft: `${depth * 0.75}rem` }}>
                {node.title}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          <Collapsible
            key={node.dir}
            open={nav.open.has(node.dir)}
            onOpenChange={(o) => nav.toggle(node.dir, o)}
            className="group/sub"
          >
            <SidebarMenuItem>
              <div className="flex items-center">
                <SidebarMenuButton asChild isActive={node.indexSlug === nav.activeSlug} size="sm" className="flex-1">
                  <NavLink to={`/docs/${node.indexSlug}`} onClick={nav.onNavigate} style={{ paddingLeft: `${depth * 0.75}rem` }}>
                    {node.title}
                  </NavLink>
                </SidebarMenuButton>
                <CollapsibleTrigger className="px-1.5 text-muted-foreground hover:text-foreground">
                  <ChevronRight className="size-4 transition-transform group-data-[state=open]/sub:rotate-90" />
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <NavChildren nodes={node.children} depth={depth + 1} {...nav} />
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ),
      )}
    </SidebarMenu>
  );
}
```

- [ ] **Step 2: Use it inside the section loop** — replace the existing `leaves.map(...)` block in `SectionNav` (the `<SidebarMenu>` body that filtered to leaves) with:

```tsx
<SidebarGroupContent>
  <NavChildren nodes={section.children} depth={0} activeSlug={activeSlug} open={open} toggle={toggle} onNavigate={onNavigate} />
</SidebarGroupContent>
```

Remove the now-unused `leaves` const and the `DocLeaf` filter. Ensure `DocNode` is imported from `./types`.

- [ ] **Step 3: Auto-open the active sub-group on nav** — in `DocsLayout`, the `activeSection` effect already opens the top section. Add: also open every ancestor dir of `activeSlug`. Replace the `open` initial state + effect to seed all ancestor dirs:

```tsx
const ancestorDirs = (slug: string): string[] => {
  const parts = slug.split("/");
  const dirs: string[] = [];
  for (let i = 1; i < parts.length; i++) dirs.push(parts.slice(0, i).join("/"));
  return dirs; // e.g. "a/b/c" -> ["a","a/b"]
};
```

Seed `useState` with `new Set([...ancestorDirs(activeSlug), "getting-started"])` and in the effect add every `ancestorDirs(activeSlug)` entry not already open.

- [ ] **Step 4: Verify build + types**

Run: `pnpm --filter www-v2 typecheck && pnpm --filter www-v2 build`
Expected: both succeed. (Full visual verification happens in Task 7, the first real split.)

- [ ] **Step 5: Commit**

```bash
git add apps/www-v2/src/docs/docs-layout.tsx
git commit -m "feat(www-v2): recursive nested-group rendering in SectionNav"
```

---

## Task 4: mdx-page group redirect + multi-level breadcrumb

**Files:**
- Modify: `apps/www-v2/src/docs/mdx-page.tsx`

**Interfaces:**
- Consumes: `findGroup` (Task 2), `DocGroup.indexSlug` (Task 1).

- [ ] **Step 1: Redirect bare split-page URLs.** Import `Navigate` from `react-router` and `findGroup` from `./nav-sequence`. After the existing top-level section check (`const section = navTree.find((g) => g.dir === slug); if (section) return <CategoryIndex .../>;`) and before the `bySlug.get(slug)` lookup, add:

```tsx
const group = findGroup(navTree, slug);
if (group?.indexSlug) return <Navigate to={`/docs/${group.indexSlug}`} replace />;
```

- [ ] **Step 2: Multi-level breadcrumb.** Add a title resolver above the component:

```tsx
import { findGroup } from "./nav-sequence";

function titleForLeaf(slug: string): string | undefined {
  // walk the tree for a leaf with this slug
  const visit = (nodes: typeof navTree[number]["children"]): string | undefined => {
    for (const n of nodes) {
      if (n.kind === "leaf" && n.slug === slug) return n.title;
      if (n.kind === "group") { const t = visit(n.children); if (t) return t; }
    }
    return undefined;
  };
  for (const sec of navTree) { if (sec.dir === slug.split("/")[0]) { const t = visit(sec.children); if (t) return t; } }
  return undefined;
}
```

Replace the current breadcrumb (Docs / sectionTitle / title) with one that walks every ancestor. Build the ancestor list from the slug and render a `BreadcrumbLink` per ancestor (top section → `/docs/<dir>`; nested group → `/docs/<group.indexSlug>`), and the leaf as `BreadcrumbPage`:

```tsx
const parts = slug.split("/");
const crumbs = parts.slice(0, -1).map((_, i) => {
  const dir = parts.slice(0, i + 1).join("/");
  if (i === 0) {
    const sec = navTree.find((g) => g.dir === dir);
    return sec ? { to: `/docs/${dir}`, label: sec.title } : null;
  }
  const g = findGroup(navTree, dir);
  return g?.indexSlug ? { to: `/docs/${g.indexSlug}`, label: g.title } : null;
}).filter(Boolean) as { to: string; label: string }[];
```

Render: `Docs` link, then each `crumb` as `BreadcrumbLink` separated by `BreadcrumbSeparator`, then `BreadcrumbPage` = `title`.

- [ ] **Step 3: Verify**

Run: `pnpm --filter www-v2 typecheck && pnpm --filter www-v2 build`
Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add apps/www-v2/src/docs/mdx-page.tsx
git commit -m "feat(www-v2): redirect bare split-page URLs + multi-level breadcrumb"
```

---

## Task 5: Prev/next footer component

**Files:**
- Create: `apps/www-v2/src/docs/prev-next.tsx`
- Modify: `apps/www-v2/src/docs/mdx-page.tsx`

**Interfaces:**
- Consumes: `prevNext` (Task 2), `titleForLeaf` pattern — but to avoid export churn, `PrevNext` resolves titles itself from `navTree`.

- [ ] **Step 1: Implement `prev-next.tsx`:**

```tsx
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { navTree } from "./nav-content";
import { prevNext } from "./nav-sequence";
import type { DocNode } from "./types";

function titleOf(slug: string): string {
  const visit = (nodes: DocNode[]): string | undefined => {
    for (const n of nodes) {
      if (n.kind === "leaf" && n.slug === slug) return n.title;
      if (n.kind === "group") { const t = visit(n.children); if (t) return t; }
    }
    return undefined;
  };
  return visit(navTree) ?? slug.split("/").pop()!;
}

export function PrevNext({ slug }: { slug: string }) {
  const { prev, next } = prevNext(slug, navTree);
  if (!prev && !next) return null;
  const ease = "cubic-bezier(0.32,0.72,0,1)";
  return (
    <nav className="not-prose mt-16 flex items-stretch justify-between gap-4 border-t border-border/60 pt-8">
      {prev ? (
        <Link to={`/docs/${prev}`} className="group flex items-center gap-3 rounded-xl border border-border px-5 py-3 text-left transition-colors hover:bg-muted" style={{ transitionTimingFunction: ease }}>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted transition-transform duration-300 group-hover:-translate-x-0.5" style={{ transitionTimingFunction: ease }}>
            <ArrowLeft className="size-4" />
          </span>
          <span><span className="block text-xs text-muted-foreground">Previous</span><span className="block text-sm font-medium text-foreground">{titleOf(prev)}</span></span>
        </Link>
      ) : <span />}
      {next ? (
        <Link to={`/docs/${next}`} className="group flex items-center gap-3 rounded-xl border border-border px-5 py-3 text-right transition-colors hover:bg-muted" style={{ transitionTimingFunction: ease }}>
          <span><span className="block text-xs text-muted-foreground">Next</span><span className="block text-sm font-medium text-foreground">{titleOf(next)}</span></span>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted transition-transform duration-300 group-hover:translate-x-0.5" style={{ transitionTimingFunction: ease }}>
            <ArrowRight className="size-4" />
          </span>
        </Link>
      ) : <span />}
    </nav>
  );
}
```

- [ ] **Step 2: Mount in `mdx-page.tsx`** — import `PrevNext` and render it after `<Content />`, inside the `<article>`:

```tsx
<Content />
<PrevNext slug={slug} />
```

- [ ] **Step 3: Verify**

Run: `pnpm --filter www-v2 typecheck && pnpm --filter www-v2 build`
Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add apps/www-v2/src/docs/prev-next.tsx apps/www-v2/src/docs/mdx-page.tsx
git commit -m "feat(www-v2): prev/next footer for split sub-pages"
```

---

## Task 6: CategoryIndex renders child groups as cards

**Files:**
- Modify: `apps/www-v2/src/docs/category-index.tsx`

**Interfaces:**
- Consumes: `DocGroup.indexSlug` (Task 1).

`CategoryIndex` currently maps `section.children` filtered to leaves into cards (`to={/docs/${leaf.slug}}`). Extend the card list to include child **groups**: for a group node, card `to = /docs/${group.indexSlug}`, title = `group.title`, description = the overview page's frontmatter description.

- [ ] **Step 1:** Change the children mapping to handle both node kinds. Build the card list as:

```tsx
const cards = section.children.flatMap((c) =>
  c.kind === "leaf"
    ? [{ to: `/docs/${c.slug}`, title: c.title, slug: c.slug }]
    : c.indexSlug ? [{ to: `/docs/${c.indexSlug}`, title: c.title, slug: c.indexSlug }] : [],
);
```

Render `cards.map(...)` instead of the leaf-only map. Keep the existing frontmatter-description lookup keyed by the card's `slug` (the overview slug for groups).

- [ ] **Step 2: Verify**

Run: `pnpm --filter www-v2 typecheck && pnpm --filter www-v2 build`
Expected: both succeed.

- [ ] **Step 3: Commit**

```bash
git add apps/www-v2/src/docs/category-index.tsx
git commit -m "feat(www-v2): show nested page-groups as cards on category index"
```

---

## Task 7: Split `editing/simple-form` (pilot + integration checkpoint)

Smallest reference page (496 lines) — split it first, then **fully preview-verify the whole nav stack** (Tasks 1–6) against it.

**Files:**
- Create: `editing/simple-form/{overview,validation,guides}.mdx`, `editing/simple-form/_meta.ts`
- Delete: `editing/simple-form/index.mdx`
- Modify: `editing/_meta.ts`

Follow the **Content-Split Procedure**. Data:

| File | Title | Description | `##` sections (verbatim, in order) |
|---|---|---|---|
| overview | Overview | "The SimpleForm layout — usage and props." | Usage · Props · `component` |
| validation | Validation | "Validate SimpleForm inputs with schemas or per-field rules." | Validation |
| guides | Guides | "Defaults, unsaved-changes warning, custom toolbar, and more." | Default Values · Warn On Unsaved Changes · Toolbar · Using Fields As Children · Subscribing To Form Changes · Headless Version · Access Control |

`editing/simple-form/_meta.ts`:
```ts
import type { MetaEntry } from "@/docs/types";
export default [
  { slug: "overview", title: "Overview" },
  { slug: "validation", title: "Validation" },
  { slug: "guides", title: "Guides" },
] satisfies MetaEntry[];
```

`editing/_meta.ts`: change `{ slug: "simple-form", title: "SimpleForm" }` → `{ dir: "simple-form", title: "SimpleForm" }`.

- [ ] Steps 1–5: per Content-Split Procedure.
- [ ] **Step 6 (integration verify):** `pnpm --filter www-v2 build`; then via preview (`www-v2` dev server): sidebar shows **SimpleForm** as an expandable group under Editing with Overview/Validation/Guides; clicking it lands on Overview; bare `/docs/editing/simple-form` redirects to `…/overview`; breadcrumb reads Docs / Editing / SimpleForm / Validation on the validation page; prev/next footer pages Overview→Validation→Guides; the `/docs/editing` category card for SimpleForm links to the overview.
- [ ] **Step 7: Commit**
```bash
git add apps/www-v2/src/docs/content/editing
git commit -m "refactor(www-v2): split SimpleForm into overview/validation/guides"
```

---

## Task 8: Split `viewing/data-table` (609 → Overview + 2)

**Files:** Create `viewing/data-table/{overview,columns,advanced}.mdx` + `_meta.ts`; delete `viewing/data-table/index.mdx`; modify `viewing/_meta.ts`.

Follow the **Content-Split Procedure**. Data:

| File | Title | Description | `##` sections |
|---|---|---|---|
| overview | Overview | "The DataTable component — usage, props, and cell rendering." | Usage · Props · Cell Rendering |
| columns | Columns | "Sorting, row expansion, and showing/hiding/reordering columns." | Sorting · Row Expansion · Hiding or Reordering Columns · Conditional Formatting |
| advanced | Advanced | "Bulk actions, access control, TypeScript, and custom DataTables." | Bulk Actions · Access Control · Typescript · Composing a custom DataTable |

`_meta.ts`: `[{ slug: "overview", title: "Overview" }, { slug: "columns", title: "Columns" }, { slug: "advanced", title: "Advanced" }]`.
`viewing/_meta.ts`: `{ slug: "data-table" }` → `{ dir: "data-table", title: "DataTable" }`.

> Note: `Row Expansion` has `###` subsections (`Expand-all header button`, `` `expand` ``) — keep them with their parent `##` in `columns.mdx`.

- [ ] Steps 1–7 per Content-Split Procedure (Step 6 = build + prerender check + sidebar spot-check). Commit message: `refactor(www-v2): split DataTable into overview/columns/advanced`.

---

## Task 9: Split `page-components/edit` (1117 → Overview + 4)

**Files:** Create `page-components/edit/{overview,layout,data-mutations,customization,advanced}.mdx` + `_meta.ts`; delete `page-components/edit/index.mdx`; modify `page-components/_meta.ts`.

Follow the **Content-Split Procedure**. Data:

| File | Title | Description | `##` sections |
|---|---|---|---|
| overview | Overview | "The Edit page component — usage and core props." | Usage · Props · `render` · `offline` · `error` · `component` · `aside` |
| layout | Layout & Title | "Customize the edit page's content area, actions toolbar, and title." | Main Content Area · Actions Toolbar · Page Title |
| data-mutations | Data & Mutations | "Fetching, mutation options, side effects, redirection, and data transforms." | Data Fetching Options · Mutation Options · Success and Error Side Effects · Changing The Notification Message · Redirection After Submission · Mutation Mode · Transforming Data |
| customization | Customization | "Scaffolding, prefilling, linking inputs, controlled and headless modes." | Scaffolding An Edit Page · Cleaning Up Empty Strings · Prefilling the Form · Linking Two Inputs · Controlled Mode · Headless Version |
| advanced | Advanced | "Access control, live updates, and record locking." | Access Control · Live Updates · Locking Edition |

`_meta.ts`: overview, layout, data-mutations, customization, advanced (titles: Overview, Layout & Title, Data & Mutations, Customization, Advanced).
`page-components/_meta.ts`: `{ slug: "edit" }` → `{ dir: "edit", title: "Edit" }`.

- [ ] Steps 1–7 per Content-Split Procedure. Commit: `refactor(www-v2): split Edit into overview + 4 guide pages`.

---

## Task 10: Split `page-components/list` (927 → Overview + 4)

**Files:** Create `page-components/list/{overview,layout,filtering-sorting,data-export,advanced}.mdx` + `_meta.ts`; delete `page-components/list/index.mdx`; modify `page-components/_meta.ts`.

Follow the **Content-Split Procedure**. Data:

| File | Title | Description | `##` sections |
|---|---|---|---|
| overview | Overview | "The List page component — usage and core props." | Usage · Props · `empty` · `component` · `aside` |
| layout | Layout & Title | "Customize the list's content area, actions toolbar, and title." | Main Content Area · Actions toolbar · Page Title |
| filtering-sorting | Filtering & Sorting | "Pagination, sorting, permanent filters, and the filter button/form combo." | Pagination · Sort · Permanent Filter · Filter Button/Form Combo |
| data-export | Data & Export | "Exporting data, fetching options, and parameter persistence." | Exported Data · Data Fetching Options · Parameters Persistence |
| advanced | Advanced | "Scaffolding, live updates, empty/controlled/headless, and access control." | Scaffolding a List page · Live Updates · Rendering An Empty List · Controlled Mode · Headless Version · Access Control |

`_meta.ts`: overview, layout, filtering-sorting, data-export, advanced (titles: Overview, Layout & Title, Filtering & Sorting, Data & Export, Advanced).
`page-components/_meta.ts`: `{ slug: "list" }` → `{ dir: "list", title: "List" }`.

- [ ] Steps 1–7 per Content-Split Procedure. Commit: `refactor(www-v2): split List into overview + 4 guide pages`.

---

## Task 11: Split `getting-started/quick-start-guide` (1215 → 5 chapters)

**Files:** Create `getting-started/quick-start-guide/{setup,building-the-list,detail-editing,polish,auth-production}.mdx` + `_meta.ts`; delete `getting-started/quick-start-guide/index.mdx`; modify `getting-started/_meta.ts`.

Follow the **Content-Split Procedure**. Data:

| File | Title | Description | `##` sections |
|---|---|---|---|
| setup | 1. Setup | "Install shadmin and point it at an API data source." | Setting Up · Using an API as the Data Source · Mapping API Endpoints with Resources |
| building-the-list | 2. Building the List | "Write the list page, compose fields, and handle relationships." | Writing a Page Component · Composing Components · Selecting Columns · Writing A Custom Field · Handling Relationships |
| detail-editing | 3. Detail & Editing | "Add show, edit, and create views with optimistic updates." | Adding A Detail View · Adding Editing Capabilities · Adding Creation Capabilities · Optimistic Rendering And Undo |
| polish | 4. Polish | "Add search and filters, custom menu icons, and a home page." | Adding Search And Filters To The List · Customizing the Menu Icons · Using a Custom Home Page |
| auth-production | 5. Auth & Production | "Add authentication and connect to a real API." | Adding Authentication · Connecting To A Real API · Conclusion |

`_meta.ts`: setup, building-the-list, detail-editing, polish, auth-production (titles as in table).
`getting-started/_meta.ts`: `{ slug: "quick-start-guide", title: "Quick Start" }` → `{ dir: "quick-start-guide", title: "Quick Start" }`.

> Note: this is a linear tutorial — the prev/next footer is the primary nav between chapters. Verify in Step 6 that prev/next chains setup→…→auth-production.

- [ ] Steps 1–7 per Content-Split Procedure. Commit: `refactor(www-v2): split Quick Start tutorial into 5 chapters`.

---

## Task 12: Cross-link & anchor migration + final verification

**Files:** any `content/**/*.mdx` containing inbound links to the 5 split pages.

**Interfaces:**
- Consumes: the section→sub-page maps from Tasks 7–11.

- [ ] **Step 1: Find inbound links.** For each split page `P` in {`getting-started/quick-start-guide`, `page-components/edit`, `page-components/list`, `viewing/data-table`, `editing/simple-form`}, list every reference across `content/`:

```bash
cd apps/www-v2/src/docs/content
grep -rn "/docs/page-components/edit\|/docs/page-components/list\|/docs/viewing/data-table\|/docs/editing/simple-form\|/docs/getting-started/quick-start-guide" .
```

- [ ] **Step 2: Build the anchor→sub-page map.** For each moved `##` heading, its anchor is `rehype-slug(heading)` and its new home is the sub-page from the task tables. Example (edit): `#mutation-mode` → `data-mutations`, `#access-control` → `advanced`, `#page-title` → `layout`. A bare `/docs/<P>` (no anchor) → `/docs/<P>/overview` (or `/setup` for quick-start).

- [ ] **Step 3: Rewrite.** For each found link:
  - `/docs/<P>#<anchor>` → `/docs/<P>/<subpage-for-anchor>#<anchor>`
  - bare `/docs/<P>` and `/docs/<P>/` → `/docs/<P>/<landing>` (overview, or setup for quick-start)
  - Also fix **intra-page** links inside the now-split pages that point to a sibling section now on a different sub-page (same mapping, absolute form).

- [ ] **Step 4: Verify no stale targets.**

```bash
pnpm --filter www-v2 build
cd apps/www-v2/build/client
# (a) no bare split-page links survive in built HTML:
grep -rEo 'href="/docs/(page-components/(edit|list)|viewing/data-table|editing/simple-form|getting-started/quick-start-guide)"' . | sort -u   # expect empty
```

- [ ] **Step 5: Dead-anchor scan.** Write a throwaway node script (or manual grep) that, for each in-page `#anchor` link target, confirms an element with that `id` exists in the destination page's built HTML. Resolve any misses by correcting the sub-page in the link. Expected: 0 dead anchors.

- [ ] **Step 6: Full gate.**

Run: `pnpm --filter www-v2 test && pnpm --filter www-v2 typecheck && pnpm --filter www-v2 build`
Expected: all green; re-measure — no page over ~300 lines among the 5.

- [ ] **Step 7: Commit**

```bash
git add apps/www-v2/src/docs/content
git commit -m "refactor(www-v2): rewrite inbound links/anchors for split pages"
```

---

## Self-Review

**Spec coverage:** filesystem model → Tasks 7–11 + procedure; nav `indexSlug` → T1; SectionNav recursion → T3; mdx-page redirect + breadcrumb → T4; prev/next → T2 (logic) + T5 (UI); CategoryIndex → T6; per-page maps → T7–T11; anchor migration → T12; testing → T1/T2 node tests + T7 integration preview + T12 build asserts. All spec sections mapped.

**Placeholder scan:** no TBD/"handle edge cases"/"similar to Task N" — the shared Content-Split Procedure is referenced by data-bearing tasks, each carrying its full unique map/`_meta`/frontmatter.

**Type consistency:** `indexSlug` (T1) used identically in T3/T4/T6; `prevNext`/`findGroup` signatures (T2) match their uses in T4/T5; `DocGroup`/`DocLeaf`/`DocNode` per `types.ts`.
