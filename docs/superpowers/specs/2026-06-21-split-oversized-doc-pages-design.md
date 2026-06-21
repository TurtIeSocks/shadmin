# Split Oversized Doc Pages — Design

**Goal:** Break the 5 oversized docs pages into navigable sub-pages (3-level sidebar nesting + prev/next), so no page exceeds ~280 lines, without losing content or breaking links.

**Status:** Approved (brainstorming, 2026-06-21). Next: writing-plans.

## Problem

Of 293 docs pages, 3 are monsters (>800 lines) and 5 are oversized: `getting-started/quick-start-guide` (1215), `page-components/edit` (1117), `page-components/list` (927), `viewing/data-table` (609), `editing/simple-form` (496). They are walls of prose + code with everything expanded — `progressive-disclosure` / `content-priority` violations. The remaining 285 pages are fine (<400 lines) and are **out of scope**.

## Decisions (locked)

- **Nav model:** 3-level sidebar nesting (Section → Page group → sub-pages) + a prev/next footer. Not tabs, not flat.
- **Scope:** exactly the 5 pages above. `autocomplete-input` (436), `autocomplete-array-input` (432), `install` (410) stay single-page; revisit later.
- **Reference granularity:** Overview + themed guides, adaptive (split the recipe tail into themed sub-pages only when still oversized).
- **Tutorial:** quick-start → 5 thematic chapters.

## Global Constraints

- Only the 5 named pages change structurally. No other page's content is edited except to rewrite inbound cross-links/anchors that now point into a split page.
- `@/` = package src (registry constraint). Nav stays filesystem-driven; titles come from frontmatter / `_meta.ts` (per `nav-content.ts`).
- Anchor slugs are produced by `rehype-slug` (lowercase, non-alphanumerics → hyphens). New cross-links must use those exact anchors.
- All gates green before done: `pnpm test`, `pnpm typecheck`, `pnpm build` with **0 stale `/docs/images` or broken `#anchor` targets**, 4/4 (or more) node tests.

## Architecture

### 1. Filesystem / URL model

A split page becomes a directory of sub-page `.mdx` files (no `index.mdx`) plus a local `_meta.ts` ordering them. The first entry is the landing sub-page.

```
page-components/edit/
  _meta.ts          → [overview, layout, data-mutations, customization, advanced]
  overview.mdx      → /docs/page-components/edit/overview
  layout.mdx        → /docs/page-components/edit/layout
  data-mutations.mdx
  customization.mdx
  advanced.mdx
```

Reference pages already live in their own dir (`edit/index.mdx`), so `index.mdx` is replaced by `overview.mdx` + guides. `quick-start-guide/index.mdx` → 5 chapter files.

Each sub-page gets frontmatter `title` (the sub-page name, e.g. "Layout & Title") and a one-line `description`. The **parent group title** (e.g. "Edit") comes from the parent section's `_meta.ts` `dir` entry.

### 2. Nav code changes

**`nav.ts` (`buildNavTree`)** — already builds nested groups recursively. Add: each `DocGroup` carries an `indexSlug` = the slug of its first leaf descendant (in `_meta` order). Used for the group-label link and the bare-dir redirect. (`types.ts`: add `indexSlug?: string` to `DocGroup`.)

**`docs-layout.tsx` (`SectionNav`)** — currently renders only `kind === "leaf"` children, dropping nested groups. Rewrite the children renderer to recurse: a nested group renders as a `Collapsible` whose label is a `NavLink` to `group.indexSlug` **and** an expand chevron, with its children indented one level (depth-based `pl-*`). Top-level section behavior is unchanged.

**`mdx-page.tsx`** — a bare split-page slug (`page-components/edit`) is no longer a real page. Add a recursive `findGroup(navTree, slug)`; if the slug matches a group, render `<Navigate to={group.indexSlug} replace />`. (Top-level section slugs keep rendering `<CategoryIndex>`.)

**Breadcrumb (`mdx-page.tsx`)** — currently Docs / section / page. Walk every slug segment, resolving each segment's title from the nav tree, so `page-components/edit/layout` → Docs / Page Components / Edit / Layout & Title. Each ancestor links to its `indexSlug`; the leaf is the current page.

### 3. Prev/next footer

New component `docs/prev-next.tsx`. Given the current slug, find its **parent group** in the nav tree, flatten that group's ordered leaf children, locate the current index, and render `← <prevTitle>` / `<nextTitle> →` links (omit the missing side at the ends). Rendered at the bottom of the `<article>` in `mdx-page.tsx`, only when the parent group has >1 leaf (i.e. the page is part of a split set). Styling per high-end-visual-design: rounded-full pill links, the trailing/leading arrow nested in its own circle, hover translate, custom cubic-bezier — consistent with the `/docs` landing CTAs.

### 4. CategoryIndex

`category-index.tsx` lists a section's leaf pages as cards. Extend it to also render **child groups** as cards: card title = group title, link = `group.indexSlug`, description = the overview's frontmatter `description`. So `/docs/page-components` shows an "Edit" card linking to `…/edit/overview`.

### 5. Cross-link & anchor migration

Splitting moves sections to new sub-page URLs, so inbound links break. Process:

1. For each split page, build a map: `oldAnchor → newSubpageSlug`, where `oldAnchor` is the `rehype-slug` of each moved `##` heading and `newSubpageSlug` is the sub-page it landed on.
2. Rewrite every inbound reference across `content/`:
   - `/docs/<splitpage>#<anchor>` → `/docs/<splitpage>/<subpage>#<anchor>`
   - bare `/docs/<splitpage>` (and trailing-slash) → `/docs/<splitpage>/<overview>` (the landing)
   - relative in-page anchors that now cross sub-pages → absolute cross-page links
3. Verify: build, then assert the built HTML has **0** links to a `/docs/<splitpage>` bare URL or to an `#anchor` id that no longer exists on its target page.

## Per-page split maps

### quick-start-guide (1215 → 5 chapters)
| File | Title | Steps |
|---|---|---|
| setup | 1. Setup | Setting Up · Using an API · Mapping Resources |
| building-the-list | 2. Building the List | Page Component · Composing · Selecting Columns · Custom Field · Relationships |
| detail-editing | 3. Detail & Editing | Detail View · Editing · Creation · Optimistic/Undo |
| polish | 4. Polish | Search & Filters · Menu Icons · Custom Home |
| auth-production | 5. Auth & Production | Authentication · Real API · Conclusion |

### page-components/edit (1117 → Overview + 4)
| File | Title | Sections |
|---|---|---|
| overview | Overview | Usage · Props · `render` `offline` `error` `component` `aside` |
| layout | Layout & Title | Main Content Area · Actions Toolbar · Page Title |
| data-mutations | Data & Mutations | Data Fetching · Mutation Options · Side Effects · Notification Msg · Redirection · Mutation Mode · Transforming Data |
| customization | Customization | Scaffolding · Cleaning Empty Strings · Prefilling · Linking Inputs · Controlled Mode · Headless |
| advanced | Advanced | Access Control · Live Updates · Locking Edition |

### page-components/list (927 → Overview + 4)
| File | Title | Sections |
|---|---|---|
| overview | Overview | Usage · Props · `empty` `component` `aside` |
| layout | Layout & Title | Main Content Area · Actions toolbar · Page Title |
| filtering-sorting | Filtering & Sorting | Pagination · Sort · Permanent Filter · Filter Button/Form |
| data-export | Data & Export | Exported Data · Data Fetching · Parameters Persistence |
| advanced | Advanced | Scaffolding · Live Updates · Empty List · Controlled Mode · Headless · Access Control |

### viewing/data-table (609 → Overview + 2)
| File | Title | Sections |
|---|---|---|
| overview | Overview | Usage · Props · Cell Rendering |
| columns | Columns | Sorting · Row Expansion · Hiding/Reordering Columns · Conditional Formatting |
| advanced | Advanced | Bulk Actions · Access Control · TypeScript · Composing a custom DataTable |

### editing/simple-form (496 → Overview + 2)
| File | Title | Sections |
|---|---|---|
| overview | Overview | Usage · Props · `component` |
| validation | Validation | Validation (full ~227-line section) |
| guides | Guides | Default Values · Warn On Unsaved Changes · Toolbar · Fields As Children · Subscribing To Form Changes · Headless · Access Control |

## Testing

- `nav.test.ts`: extend for nested groups — `indexSlug` resolution, recursive children, ordering by nested `_meta`.
- New unit test for the prev/next sequence builder (given a slug + tree → prev/next slugs).
- Build verification: every sub-page prerenders; bare split-page URLs redirect; 0 stale anchors/bare links (grep built HTML).
- Preview (manual): sidebar nesting renders + indents, group label navigates to Overview, prev/next footer works, breadcrumb shows 4 levels.

## Out of scope

- The 285 healthy pages; `autocomplete-input`, `autocomplete-array-input`, `install`.
- Screenshot regeneration / image work (tracked separately in `project_docs_images_pending`).
- Broader visual redesign beyond the prev/next footer + nesting styles.
