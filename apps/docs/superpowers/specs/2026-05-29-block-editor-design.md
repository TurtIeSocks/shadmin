# Block Editor — WYSIWYG Component-Block Editor

**Status:** Approved (design)
**Date:** 2026-05-29
**Author:** brainstorming session (participate mode + visual companion)

## Decision

Ship a new **block-document WYSIWYG editor** as a sibling feature folder
`src/components/block-editor/`. It is a hybrid: a vertical prose document
(Notion-style) that is also a host for **custom component blocks**, including
**admin-data blocks** that bind to ra-core resources and render live data. The
editor's block types are supplied through an **open extension API** so
app-authors register their own blocks; the kit ships a batteries-included
content set plus opt-in admin-data blocks as reference implementations.

The editor stores its value as **TipTap JSON** (not HTML). Data-blocks store a
*reference* (e.g. `{ resource, id }`) that resolves live at render. A
`<BlockDocField>` renders the stored doc read-only in Show views.

The existing `RichTextInput` / `minimal-tiptap` (HTML output, simple prose)
stays untouched for the lightweight case.

## Problem

The kit has the building blocks for a rich editor — a TipTap integration
(`rich-text-input/minimal-tiptap`) with a proven React node-view pattern
(`ImageViewBlock`: resize handles, actions, async upload), and dnd-kit usage
elsewhere (`layout-builder`, `kanban-board`) — but no editor where authors can
compose **custom component blocks**, reorder them by **drag**, and embed **live
admin data** inside long-form content. `RichTextInput` emits HTML and is tuned
for simple prose; it cannot round-trip arbitrary block props or host live
data-driven components.

## Goals

- A doc-flow WYSIWYG editor that hosts custom component blocks interleaved with
  rich text.
- An **open block extension API**: a block = `{ schema, render, config,
  catalog metadata }`. App-authors register their own; the kit ships reference
  blocks.
- **Admin-data blocks** that bind to ra-core resources and render live data
  (reference record, record list, chart).
- **Drag-to-reorder** blocks via a gutter handle; **searchable grouped catalog**
  insertion (⊕ button + slash menu).
- **Per-block config** via a selection toolbar + anchored, schema-driven popover.
- Store **TipTap JSON**; provide a read-mode `<BlockDocField>`.
- Ship as **registry items**, integrate with ra-core forms (`useInput`), follow
  the kit's layering and testing conventions.
- **Never lose data** on unknown/foreign block types.

## Non-Goals (v1)

- Real-time collaboration / multiplayer (no Yjs); no comments / track-changes.
- Markdown import/export serialization (paste still works via StarterKit).
- HTML mirror output — JSON only.
- Free-canvas positioning — doc-flow only.
- Multi-hole **columns** (true independent-content columns) — deferred to v2
  (the hardest piece; pulls intra-node drag back in). Single doc-flow + atoms +
  single-content blocks is enough to prove the model.
- History beyond editor undo/redo.
- Shared `lib/tiptap/` extraction and a static JSON-walker renderer — both are
  later optimizations; v1 is self-contained and reuses an `editable:false`
  editor for read mode.

## Resolved decisions (brainstorm forks)

| Fork | Decision |
|---|---|
| Paradigm | Hybrid component-block document (prose flow + component host) |
| Block model | Open extension API **and** admin-data blocks |
| Data model | TipTap JSON; data-blocks store references resolved live |
| Insert / reorder | Gutter (⠿ drag, ⊕ add) + **searchable grouped catalog** picker + slash menu |
| Block config | Selection toolbar + **anchored schema-driven popover** (inline = opt-in later) |
| Architecture | **New sibling `block-editor/` feature**; `RichTextInput` left intact |
| Drag mechanism | **ProseMirror-native drag handle**, not dnd-kit |
| Read mode | Same editor with `editable:false` (reuse render fns + live hooks) |

## Architecture

### Folder layout & layering

New sibling feature. Same tier as `rich-text-input/` and `realtime/`. May import
from `admin/`, `ui/`, `lib/`, `hooks/`, and ra-core. `admin/` **must not** import
it. Dependency direction: `extras → block-editor → admin → ui`.

```
src/components/block-editor/
  index.ts                      # public exports
  block-editor-input.tsx        # ra-core input (useInput), JSON value — form integration
  block-editor.tsx              # editor composition (EditorContent + chrome)
  block-doc-field.tsx           # read-mode renderer for Show views (editable:false)
  use-block-editor.ts           # builds TipTap extensions from registry + base
  block-registry.ts             # register / get blocks, emit TipTap nodes
  define-block.tsx              # defineBlock() + BlockDefinition type
  chrome/
    block-gutter.tsx            # ⠿ drag handle + ⊕ add, follows hovered/selected node
    catalog-picker.tsx          # grouped, searchable picker (cmdk) for ⊕ and "/"
    block-toolbar.tsx           # selection floating toolbar (move / duplicate / configure / delete)
    block-config-popover.tsx    # schema-driven config form
  extensions/
    base.ts                     # StarterKit + link/image/etc. (self-contained in v1)
    block-node.ts               # generic ProseMirror node factory for registered blocks
    unknown-block.ts            # fallback node — preserves foreign nodes (data-safety)
  blocks/                       # built-in reference blocks (the v1 catalog)
    callout.tsx
    toggle.tsx
    image.tsx
    embed.tsx
    reference-record.tsx        # admin-data (opt-in item)
    record-list.tsx             # admin-data (opt-in item)
    chart.tsx                   # admin-data (opt-in item)
  block-editor.spec.tsx
```

### Registry packaging

- `block-editor` — core item: editor + chrome + registry + content blocks
  (`defaultBlocks`: callout, toggle, image, embed).
- `block-editor-data` — opt-in item: admin-data blocks (reference record, record
  list, chart). Pulls ra-core/admin deps, so consumers who don't need live data
  blocks aren't forced to install them.

### New dependencies

- `@tiptap/extension-drag-handle-react` (official) — gutter drag handle.
- `@tiptap/suggestion` (official) — slash menu.
- cmdk (already a dep) — catalog picker.
- dompurify (already a dep) — embed sanitization.

## Block extension API (core contract)

```ts
interface BlockDefinition<A extends Record<string, unknown> = Record<string, unknown>> {
  /** Unique id — also the ProseMirror node name. */
  name: string;

  // Catalog (drives the searchable ⊕ / slash picker)
  label: string;
  group: "content" | "media" | "layout" | "data" | (string & {}); // custom groups allowed
  icon: LucideIcon;
  keywords?: string[];
  description?: string;

  /** Zod schema for attrs. Drives defaults, node addAttributes, validation, and config:"auto". */
  schema: z.ZodType<A>;

  /** Single render fn for BOTH editor and read mode. Data-blocks call ra-core hooks here. */
  render: React.ComponentType<BlockRenderProps<A>>;

  /** Editing-only chrome override. Omit → default NodeViewWrapper + selection toolbar. */
  edit?: React.ComponentType<BlockRenderProps<A>>;

  /** Popover config form. "auto" derives fields from the Zod schema; or a custom form. */
  config?: "auto" | React.ComponentType<BlockConfigProps<A>>;

  /** PM node shape. Default: atom (no inner content). Opt into editable inner prose. */
  content?: string;        // e.g. "block+" ; omit = atom
  atom?: boolean;          // default true when no content
}

interface BlockRenderProps<A> {
  attrs: A;
  mode: "edit" | "read";
  selected?: boolean;
  updateAttrs?: (patch: Partial<A>) => void; // edit mode only
}

interface BlockConfigProps<A> {
  attrs: A;
  onChange: (patch: Partial<A>) => void;      // writes back to node attrs
}

declare function defineBlock<A extends Record<string, unknown>>(
  def: BlockDefinition<A>,
): BlockDefinition<A>;
```

**Decisions baked into the contract:**

- **Zod drives everything** — one schema yields attr defaults, PM `addAttributes`
  (one node attribute per top-level schema key), validation on config save, and
  the auto-generated config form. Attrs must stay JSON-serializable.
- **One `render`, `mode`-discriminated** — same component in editor and
  `BlockDocField`, so visuals + live data never drift. `edit` override only when
  editing chrome must differ.
- **Atoms by default**; `content: "block+"` opts a block into editable inner prose.
- **`config: "auto" | CustomForm`** — auto-form from schema for simple blocks;
  custom form (kit inputs like `ReferenceInput`) for data-blocks.
- **No global registry** — explicit `blocks` prop, tree-shakeable. `defaultBlocks`
  is the batteries-included content set.

### Example blocks

Content block (editable inner prose):

```tsx
export const calloutBlock = defineBlock({
  name: "callout",
  label: "Callout",
  group: "content",
  icon: Lightbulb,
  keywords: ["note", "info", "warning"],
  schema: z.object({ variant: z.enum(["info", "warning", "success"]).default("info") }),
  content: "block+",
  config: "auto",
  render: ({ attrs }) => <Callout variant={attrs.variant}><NodeViewContent /></Callout>,
});
```

Admin-data block (live ra-core data, stores a reference):

```tsx
export const referenceRecordBlock = defineBlock({
  name: "referenceRecord",
  label: "Reference record",
  group: "data",
  icon: Boxes,
  schema: z.object({
    resource: z.string(),
    id: z.union([z.string(), z.number()]).nullable().default(null),
    fields: z.array(z.string()).optional(),
    layout: z.enum(["card", "inline"]).default("card"),
  }),
  render: ({ attrs }) => {
    const { data, isPending, error } = useGetOne(attrs.resource, { id: attrs.id });
    if (!attrs.id) return <BlockEmpty label="Pick a record" />;
    if (isPending) return <BlockSkeleton />;
    if (error) return <BlockError label="Record unavailable" />;
    return <RecordCard record={data} fields={attrs.fields} layout={attrs.layout} />;
  },
  config: ReferenceRecordConfig, // ResourceSelect + ReferenceInput to pick the record
});
```

Registration — explicit, no magic global:

```tsx
import { defaultBlocks } from "@/components/block-editor";
<BlockEditorInput source="body" blocks={[...defaultBlocks, referenceRecordBlock, myCustomBlock]} />
```

## Editor composition & wiring

```
<EditorContext.Provider>
  TopToolbar          — inline marks (bold/italic/link) + block insert ⊕
  EditorContent       — the ProseMirror doc
  BlockGutter         — ⠿ drag handle + ⊕ add, follows hovered/selected node
  CatalogPicker       — cmdk grouped + searchable list (opened by ⊕ and "/")
  BlockToolbar        — floating selection toolbar (move / duplicate / configure / delete)
  BlockConfigPopover  — anchored schema-driven form
</EditorContext.Provider>
```

- **Insert / reorder is ProseMirror-native, not dnd-kit.** In-doc drag reorder +
  gutter handle uses TipTap's official drag-handle extension; dnd-kit fights
  contentEditable DOM and is the wrong tool for in-doc DnD. dnd-kit remains the
  right choice for the unrelated `kanban-board` / `layout-builder` surfaces,
  which are untouched.
- Catalog picker = cmdk; slash menu = TipTap `suggestion` opening the same picker.
- Insert = `editor.commands.insertContent({ type: name, attrs: schemaDefaults })`.
- Config popover anchors to the selected block; `config:"auto"` maps Zod →
  fields (string→`TextInput`, enum→`SelectInput`, boolean→`BooleanInput`); custom
  forms use kit inputs. Writes via `updateAttributes`.
- Reuse the node-view + drag-resize pattern proven by `ImageViewBlock` (pattern,
  not code path).

## Data flow

### Write (`BlockEditorInput`)

```tsx
function BlockEditorInput({ source, blocks = defaultBlocks, ... }: BlockEditorInputProps) {
  const { id, field, isRequired } = useInput({ source, defaultValue: EMPTY_DOC });
  // EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] }
  return (
    <FormField id={id} name={field.name}>
      <BlockEditor
        value={field.value}            // TipTap JSON object
        onChange={field.onChange}      // debounced editor.getJSON()
        onBlur={field.onBlur}
        blocks={blocks}
        editable={!disabled && !readOnly}
      />
    </FormField>
  );
}
```

- Value is a **JSON object**, stored nested; the data provider serializes. No
  `format`/`parse` needed.
- **Debounced onChange** (~300ms) — `editor.getJSON()` into RHF; avoids
  per-keystroke form thrash.
- Client-only (TipTap needs the DOM) — fine for this Vite SPA admin (no SSR).

### Read (`BlockDocField`)

```tsx
function BlockDocField({ source, blocks = defaultBlocks }) {
  const record = useRecordContext();
  const doc = get(record, source);
  return <BlockEditor value={doc} blocks={blocks} editable={false} />;
}
```

- Read mode is **the same editor with `editable={false}`** — node-views render
  with `mode:"read"`; data-blocks' ra-core hooks resolve live. Max reuse, zero
  render drift. A static JSON-walker renderer is a later optimization, not v1.

## v1 block catalog

Baseline rich text (headings, lists, blockquote, code block, bold/italic/link,
HR) comes from **StarterKit** — the editing floor, not catalog blocks.

**`defaultBlocks` — content set (core `block-editor` item):**

| Block | Kind | Notes |
|---|---|---|
| Callout | `content: block+` | info/warning/success variants, editable inner prose |
| Toggle | `content: block+` | collapsible; demonstrates inner-content blocks |
| Image | atom | reuse upload + drag-resize pattern from `ImageViewBlock` |
| Embed | atom | paste URL (YouTube/iframe), sanitized |

**Admin-data blocks — opt-in `block-editor-data` item:**

| Block | Stores | Renders |
|---|---|---|
| Reference record | `{resource, id, fields?, layout}` | record card or inline, live `useGetOne` |
| Record list | `{resource, filter?, columns?, perPage}` | small live list, `useGetList` |
| Chart | `{resource, x, y, type, filter?}` | recharts chart from live aggregation |

## Error handling & edge cases

- **Unknown block type (data-safety, critical).** A stored doc may contain a
  node whose `name` isn't in the current `blocks` set (block removed, or authored
  where another plugin was installed). ProseMirror's default is to **drop unknown
  nodes on parse → silent data loss.** Mitigation: register a fallback
  `unknownBlock` node that preserves the original name + attrs + raw content and
  renders an "Unknown block" placeholder. Round-trips without destroying data.
  Covered by a dedicated round-trip test.
- **Missing / deleted referenced record** — `useGetOne` error → `<BlockError>`
  placeholder; attrs preserved so a restored record re-resolves. In editor, offer
  re-pick via config.
- **Permission denied (403)** on a referenced resource — neutral "no access"
  placeholder; never leak the payload. Reference/List/Chart blocks must respect
  the `authProvider` access checks.
- **Malformed JSON value** — validate shape on load; bad value → fall back to
  `EMPTY_DOC` + non-destructive console warning; never throw in render.
- **Attr drift / forward-compat** — on load, coerce missing attrs from Zod
  defaults; on config save, validate attrs against Zod, reject invalid.
- **Image upload failure** — reuse `ImageViewBlock`'s existing error UI.
- **Read-mode query fan-out** — many data-blocks on one page = many queries;
  react-query (via ra-core) dedupes/caches; list/chart paginate. Advise against
  block-doc fields in List views. Not a v1 blocker.

### Security

The Embed block accepts user-supplied URLs/iframes. Sanitize with `dompurify`
and allow-list providers (YouTube/Vimeo/known hosts) plus a constrained set of
iframe attributes — never inject raw user HTML. Data blocks must respect
ra-core's `authProvider`: a record the user cannot read degrades to the
"no access" placeholder, never exposes data.

## Testing

Story-driven specs per the kit's convention (import stories, render with the
shared `StoryAdmin` wrapper + fake dataProvider).

**Pure / unit (fast, non-browser):**

- Registry register/get; one block → one PM node.
- Zod schema → PM `addAttributes` derivation (defaults, coercion).
- **Unknown-block preservation round-trip** (load → serialize keeps the foreign node).
- JSON validation / coercion of malformed values.

**Browser (run at end of each TDD task):**

- Empty doc renders; typing produces paragraphs.
- Insert a block via the catalog picker (⊕ → callout → node present).
- Slash menu inserts a block.
- Config popover edits attrs → JSON updates.
- Data-block resolves from fakerest → card; missing-id empty state; error state.
- `BlockDocField` renders read-only with live data.
- `BlockEditorInput` ↔ RHF: value in/out, submit yields JSON.
- **Drag reorder:** assert via the editor's move command (programmatic) as the
  reliable signal; one Playwright pointer-drag smoke test (drag is flaky in the
  browser provider — don't gate the suite on it).

## Documentation

Per AGENTS.md, ship docs pages under `docs/src/content/docs/`:

- `BlockEditorInput.md`, `BlockDocField.md` — Usage → Props → per-prop sections.
- A "Custom blocks" guide — the `defineBlock` API, a worked content block, a
  worked admin-data block, and the catalog/config model.

## Open follow-ups (post-v1)

- Multi-hole columns (true independent-content columns).
- Shared `lib/tiptap/` base-extension extraction (DRY with `RichTextInput`).
- Static JSON-walker renderer for read mode (avoid instantiating an editor).
- Inline-first config as an opt-in per block.
- Markdown / HTML export.
