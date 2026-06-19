# Block Editor (WYSIWYG Component-Block) — Implementation Plan (Plan 1: Foundation + Exemplar Blocks)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a doc-flow WYSIWYG block editor with an open `defineBlock` extension API, drag-reorder, searchable-catalog insertion, schema-driven config, TipTap-JSON storage, a read-mode field, and unknown-block data-safety — proven end-to-end by two exemplar blocks (a content block and a live admin-data block).

**Architecture:** New sibling feature `src/components/block-editor/` (tier: `extras → block-editor → admin → ui`; `admin/` must not import it). The editor is TipTap/ProseMirror. Each block is a `BlockDefinition` the registry turns into a ProseMirror node (React node-view) + a catalog entry + a config form. Value is TipTap JSON; data-blocks store references resolved live via ra-core hooks. Read mode reuses the same editor with `editable:false`. `RichTextInput`/`minimal-tiptap` are left untouched.

**Tech Stack:** React 19, TipTap v3 (`@tiptap/react`, `@tiptap/core`, StarterKit), `@tiptap/extension-drag-handle-react`, `@tiptap/suggestion`, cmdk (`@/components/ui/command`), Zod v4, ra-core (`useInput`, `useRecordContext`, `useGetOne`), Vitest + Playwright browser provider, `vitest-browser-react`.

**Spec:** `docs/superpowers/specs/2026-05-29-block-editor-design.md`

**Scope of Plan 1 (this doc):** foundation (registry, API, unknown-block, editor, input, field), insert/config/reorder chrome, `callout` (content block), `reference-record` (admin-data block), core registry item, docs + demo. **Plan 2 (separate, later):** `toggle`, `image`, `embed`, `record-list`, `chart`, `block-editor-data` registry item — each mirrors a Plan-1 exemplar against shipped code.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/block-editor/constants.ts` | `EMPTY_DOC`, debounce delay |
| `src/components/block-editor/define-block.tsx` | `BlockDefinition`/`BlockRenderProps`/`BlockConfigProps` types, `defineBlock()`, `getDefaultAttrs()`, `schemaKeys()` |
| `src/components/block-editor/block-registry.ts` | `createBlockRegistry(blocks)` → `{ get, list, groups, names }` |
| `src/components/block-editor/extensions/base.ts` | `createBaseExtensions()` — StarterKit + Placeholder |
| `src/components/block-editor/extensions/unknown-block.ts` | `UnknownBlock` node + `wrapUnknownNodes`/`unwrapUnknownNodes` JSON transforms |
| `src/components/block-editor/extensions/block-node.tsx` | `createBlockNode(def)` — generic ProseMirror Node + React node-view |
| `src/components/block-editor/use-block-editor.ts` | assembles extensions from registry + wires wrap/unwrap, value sync, debounce |
| `src/components/block-editor/block-editor.tsx` | editor composition (chrome + `EditorContent`) |
| `src/components/block-editor/block-editor-input.tsx` | ra-core `useInput` wrapper (JSON value) |
| `src/components/block-editor/block-doc-field.tsx` | read-mode renderer for Show views |
| `src/components/block-editor/chrome/catalog-picker.tsx` | cmdk grouped/searchable insert picker |
| `src/components/block-editor/chrome/block-gutter.tsx` | drag handle + ⊕ add |
| `src/components/block-editor/chrome/block-toolbar.tsx` | selection toolbar (move/duplicate/configure/delete) |
| `src/components/block-editor/chrome/block-config-popover.tsx` | anchored config form (`"auto"` + custom) |
| `src/components/block-editor/blocks/callout.tsx` | content block exemplar |
| `src/components/block-editor/blocks/reference-record.tsx` | admin-data block exemplar |
| `src/components/block-editor/blocks/index.ts` | `defaultBlocks` (content set) |
| `src/components/block-editor/index.ts` | public exports |
| `src/stories/block-editor/*.stories.tsx` | stories (rendered by specs) |
| `src/components/block-editor/*.spec.{ts,tsx}` | co-located tests |

**Test command (single file):** `pnpm vitest run --browser.headless <path/to/file.spec.tsx>`

---

## Task 1: Scaffold — deps, folder, base extensions, constants

**Files:**
- Modify: `package.json` (deps)
- Create: `src/components/block-editor/constants.ts`
- Create: `src/components/block-editor/extensions/base.ts`
- Create: `src/components/block-editor/index.ts`

- [ ] **Step 1: Install dependencies**

```bash
pnpm add @tiptap/extension-drag-handle-react@^3 @tiptap/suggestion@^3
```

- [ ] **Step 2: Create constants**

`src/components/block-editor/constants.ts`:
```ts
import type { JSONContent } from "@tiptap/react";

/** Default empty document — a single empty paragraph. */
export const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

/** Debounce for editor → form onChange (ms). */
export const ONCHANGE_DEBOUNCE_MS = 300;
```

- [ ] **Step 3: Create base extensions**

`src/components/block-editor/extensions/base.ts`:
```ts
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import type { Extensions } from "@tiptap/react";

export interface BaseExtensionsOptions {
  placeholder?: string;
}

/** Baseline rich-text floor: headings, lists, marks, links, code, HR. */
export function createBaseExtensions({
  placeholder = "Type '/' for blocks…",
}: BaseExtensionsOptions = {}): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Placeholder.configure({ placeholder: () => placeholder }),
  ];
}
```

- [ ] **Step 4: Create index stub**

`src/components/block-editor/index.ts`:
```ts
export * from "./constants";
```

- [ ] **Step 5: Verify it typechecks**

Run: `pnpm typecheck`
Expected: PASS (no errors in `src/components/block-editor/`).

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/components/block-editor/
git commit -m "feat(block-editor): scaffold folder, deps, base extensions"
```

---

## Task 2: `define-block` — types + helpers

**Files:**
- Create: `src/components/block-editor/define-block.tsx`
- Test: `src/components/block-editor/define-block.spec.ts`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/define-block.spec.ts`:
```ts
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Lightbulb } from "lucide-react";
import { defineBlock, getDefaultAttrs, schemaKeys } from "./define-block";

const block = defineBlock({
  name: "demo",
  label: "Demo",
  group: "content",
  icon: Lightbulb,
  schema: z.object({
    variant: z.enum(["info", "warning"]).default("info"),
    id: z.union([z.string(), z.number()]).nullable().default(null),
    required: z.string(),
  }),
  render: () => null,
});

describe("defineBlock", () => {
  it("returns the definition unchanged (identity helper)", () => {
    expect(block.name).toBe("demo");
    expect(block.group).toBe("content");
  });

  it("schemaKeys lists the top-level schema keys", () => {
    expect(schemaKeys(block.schema).sort()).toEqual(["id", "required", "variant"]);
  });

  it("getDefaultAttrs derives defaults; missing required → null", () => {
    expect(getDefaultAttrs(block.schema)).toEqual({
      variant: "info",
      id: null,
      required: null,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/define-block.spec.ts`
Expected: FAIL ("Failed to resolve import ./define-block" or "defineBlock is not a function").

- [ ] **Step 3: Write the implementation**

`src/components/block-editor/define-block.tsx`:
```tsx
import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { z } from "zod";

export interface BlockRenderProps<A extends Record<string, unknown> = Record<string, unknown>> {
  attrs: A;
  mode: "edit" | "read";
  selected?: boolean;
  updateAttrs?: (patch: Partial<A>) => void;
}

export interface BlockConfigProps<A extends Record<string, unknown> = Record<string, unknown>> {
  attrs: A;
  onChange: (patch: Partial<A>) => void;
}

export interface BlockDefinition<A extends Record<string, unknown> = Record<string, unknown>> {
  /** Unique id — also the ProseMirror node name. */
  name: string;
  label: string;
  group: "content" | "media" | "layout" | "data" | (string & {});
  icon: LucideIcon;
  keywords?: string[];
  description?: string;
  /** Zod schema for attrs — drives defaults, node attributes, validation, config:"auto". */
  schema: z.ZodType<A>;
  /** Single render fn for edit + read mode. Data-blocks call ra-core hooks here. */
  render: ComponentType<BlockRenderProps<A>>;
  /** Editing-only override. Omit → default node-view chrome wraps `render`. */
  edit?: ComponentType<BlockRenderProps<A>>;
  /** Popover config form. "auto" derives fields from schema; or a custom form. */
  config?: "auto" | ComponentType<BlockConfigProps<A>>;
  /** ProseMirror inner content (e.g. "block+"); omit = atom. */
  content?: string;
  /** Force atom; defaults to true when `content` is absent. */
  atom?: boolean;
}

/** Identity helper that pins generic inference from the schema. */
export function defineBlock<A extends Record<string, unknown>>(
  def: BlockDefinition<A>,
): BlockDefinition<A> {
  return def;
}

type ZodObjectLike = { shape: Record<string, z.ZodType> };

function getShape(schema: z.ZodType): Record<string, z.ZodType> {
  const shape = (schema as unknown as ZodObjectLike).shape;
  if (!shape) {
    throw new Error("block schema must be a z.object({...})");
  }
  return shape;
}

/** Top-level attribute keys of a block's schema. */
export function schemaKeys(schema: z.ZodType): string[] {
  return Object.keys(getShape(schema));
}

/**
 * Default attrs from a Zod object schema. Parses each field against `undefined`:
 * a `.default()` yields its default, an optional yields undefined, anything
 * required yields `null` (so the node still has the attribute key present).
 */
export function getDefaultAttrs<A extends Record<string, unknown>>(
  schema: z.ZodType<A>,
): A {
  const shape = getShape(schema);
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(shape)) {
    const parsed = shape[key].safeParse(undefined);
    out[key] = parsed.success ? (parsed.data ?? null) : null;
  }
  return out as A;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/define-block.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/block-editor/define-block.tsx src/components/block-editor/define-block.spec.ts
git commit -m "feat(block-editor): block definition types + schema attr helpers"
```

---

## Task 3: `block-registry` — register / list / group blocks

**Files:**
- Create: `src/components/block-editor/block-registry.ts`
- Test: `src/components/block-editor/block-registry.spec.ts`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/block-registry.spec.ts`:
```ts
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Lightbulb, Boxes } from "lucide-react";
import { defineBlock } from "./define-block";
import { createBlockRegistry } from "./block-registry";

const callout = defineBlock({
  name: "callout", label: "Callout", group: "content", icon: Lightbulb,
  schema: z.object({ variant: z.string().default("info") }), render: () => null,
});
const ref = defineBlock({
  name: "referenceRecord", label: "Reference record", group: "data", icon: Boxes,
  schema: z.object({ id: z.number().nullable().default(null) }), render: () => null,
});

describe("createBlockRegistry", () => {
  const registry = createBlockRegistry([callout, ref]);

  it("gets a block by name", () => {
    expect(registry.get("callout")).toBe(callout);
    expect(registry.get("nope")).toBeUndefined();
  });

  it("lists all blocks and their names", () => {
    expect(registry.list()).toHaveLength(2);
    expect(registry.names()).toEqual(["callout", "referenceRecord"]);
  });

  it("groups blocks by group, preserving insertion order", () => {
    const groups = registry.groups();
    expect(groups.map((g) => g.group)).toEqual(["content", "data"]);
    expect(groups[0].blocks).toEqual([callout]);
  });

  it("throws on duplicate block names", () => {
    expect(() => createBlockRegistry([callout, callout])).toThrow(/duplicate/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/block-registry.spec.ts`
Expected: FAIL ("Failed to resolve import ./block-registry").

- [ ] **Step 3: Write the implementation**

`src/components/block-editor/block-registry.ts`:
```ts
import type { BlockDefinition } from "./define-block";

export interface BlockGroup {
  group: string;
  blocks: BlockDefinition[];
}

export interface BlockRegistry {
  get(name: string): BlockDefinition | undefined;
  list(): BlockDefinition[];
  names(): string[];
  groups(): BlockGroup[];
}

export function createBlockRegistry(blocks: BlockDefinition[]): BlockRegistry {
  const byName = new Map<string, BlockDefinition>();
  for (const block of blocks) {
    if (byName.has(block.name)) {
      throw new Error(`block-editor: duplicate block name "${block.name}"`);
    }
    byName.set(block.name, block);
  }

  return {
    get: (name) => byName.get(name),
    list: () => [...byName.values()],
    names: () => [...byName.keys()],
    groups: () => {
      const order: string[] = [];
      const map = new Map<string, BlockDefinition[]>();
      for (const block of byName.values()) {
        if (!map.has(block.group)) {
          map.set(block.group, []);
          order.push(block.group);
        }
        map.get(block.group)!.push(block);
      }
      return order.map((group) => ({ group, blocks: map.get(group)! }));
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/block-registry.spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/block-editor/block-registry.ts src/components/block-editor/block-registry.spec.ts
git commit -m "feat(block-editor): block registry (get/list/groups, dup guard)"
```

---

## Task 4: `unknown-block` — preserve foreign nodes (DATA SAFETY)

**Files:**
- Create: `src/components/block-editor/extensions/unknown-block.tsx`
- Test: `src/components/block-editor/extensions/unknown-block.spec.ts`

This is the critical data-safety piece: a stored doc may contain a node type not in the current registry. ProseMirror drops unknown node types on load. We pre-wrap them into an `unknownBlock` carrying the original JSON, and unwrap on save — lossless round-trip.

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/extensions/unknown-block.spec.ts`:
```ts
import { describe, expect, it } from "vitest";
import { wrapUnknownNodes, unwrapUnknownNodes, UNKNOWN_BLOCK_NAME } from "./unknown-block";

const known = new Set(["doc", "paragraph", "text", "callout"]);

const doc = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "hi" }] },
    { type: "fancyWidget", attrs: { foo: 1 }, content: [{ type: "text", text: "x" }] },
    { type: "callout", attrs: { variant: "info" } },
  ],
};

describe("unknown-block transforms", () => {
  it("wraps only foreign nodes, preserving their full JSON in payload", () => {
    const wrapped = wrapUnknownNodes(doc, known);
    const types = wrapped.content!.map((n) => n.type);
    expect(types).toEqual(["paragraph", UNKNOWN_BLOCK_NAME, "callout"]);
    expect(wrapped.content![1].attrs!.payload).toEqual(doc.content[1]);
  });

  it("unwrap is the inverse of wrap for foreign nodes", () => {
    const round = unwrapUnknownNodes(wrapUnknownNodes(doc, known));
    expect(round).toEqual(doc);
  });

  it("leaves docs without foreign nodes untouched", () => {
    const clean = { type: "doc", content: [{ type: "callout", attrs: { variant: "info" } }] };
    expect(wrapUnknownNodes(clean, known)).toEqual(clean);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/extensions/unknown-block.spec.ts`
Expected: FAIL ("Failed to resolve import ./unknown-block").

- [ ] **Step 3: Write the implementation**

`src/components/block-editor/extensions/unknown-block.tsx`:
```tsx
import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { AlertTriangle } from "lucide-react";

export const UNKNOWN_BLOCK_NAME = "unknownBlock";

/** Node types that are always part of the doc and never "foreign". */
const STRUCTURAL = new Set(["doc", "text"]);

/** Wrap any node whose `type` is not in `known` into an unknownBlock carrying its JSON. */
export function wrapUnknownNodes(node: JSONContent, known: Set<string>): JSONContent {
  if (!node || typeof node !== "object") return node;
  const type = node.type;
  if (type && !STRUCTURAL.has(type) && !known.has(type)) {
    return { type: UNKNOWN_BLOCK_NAME, attrs: { payload: node } };
  }
  if (Array.isArray(node.content)) {
    return { ...node, content: node.content.map((child) => wrapUnknownNodes(child, known)) };
  }
  return node;
}

/** Inverse of wrapUnknownNodes: restore the original JSON from each unknownBlock. */
export function unwrapUnknownNodes(node: JSONContent): JSONContent {
  if (!node || typeof node !== "object") return node;
  if (node.type === UNKNOWN_BLOCK_NAME && node.attrs?.payload) {
    return node.attrs.payload as JSONContent;
  }
  if (Array.isArray(node.content)) {
    return { ...node, content: node.content.map(unwrapUnknownNodes) };
  }
  return node;
}

function UnknownBlockView({ node }: NodeViewProps) {
  const payload = node.attrs.payload as JSONContent | undefined;
  return (
    <NodeViewWrapper
      data-block={UNKNOWN_BLOCK_NAME}
      className="my-2 flex items-center gap-2 rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 p-3 text-sm text-muted-foreground"
    >
      <AlertTriangle className="size-4 shrink-0" />
      <span>Unknown block: <code>{payload?.type ?? "?"}</code> (preserved on save)</span>
    </NodeViewWrapper>
  );
}

/** Atom node that stores a foreign node's JSON in `payload` and renders a placeholder. */
export const UnknownBlock = Node.create({
  name: UNKNOWN_BLOCK_NAME,
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return { payload: { default: null } };
  },
  parseHTML() {
    return [{ tag: `div[data-block="${UNKNOWN_BLOCK_NAME}"]` }];
  },
  renderHTML() {
    return ["div", { "data-block": UNKNOWN_BLOCK_NAME }];
  },
  addNodeView() {
    return ReactNodeViewRenderer(UnknownBlockView);
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/extensions/unknown-block.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/block-editor/extensions/unknown-block.tsx src/components/block-editor/extensions/unknown-block.spec.ts
git commit -m "feat(block-editor): unknown-block node + lossless wrap/unwrap transforms"
```

---

## Task 5: `block-node` — generic ProseMirror node from a BlockDefinition

**Files:**
- Create: `src/components/block-editor/extensions/block-node.tsx`
- Test: `src/components/block-editor/extensions/block-node.spec.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/extensions/block-node.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import { z } from "zod";
import { Lightbulb } from "lucide-react";
import { defineBlock } from "../define-block";
import { createBaseExtensions } from "./base";
import { createBlockNode } from "./block-node";

const callout = defineBlock({
  name: "callout", label: "Callout", group: "content", icon: Lightbulb,
  schema: z.object({ variant: z.enum(["info", "warning"]).default("info") }),
  content: "block+",
  render: () => null,
});

describe("createBlockNode", () => {
  it("registers a node named after the block with its schema attrs", () => {
    const element = document.createElement("div");
    const editor = new Editor({
      element,
      extensions: [...createBaseExtensions(), createBlockNode(callout)],
      content: { type: "doc", content: [{ type: "callout", attrs: { variant: "warning" }, content: [{ type: "paragraph" }] }] },
    });
    expect(editor.schema.nodes.callout).toBeDefined();
    const json = editor.getJSON();
    expect(json.content![0].type).toBe("callout");
    expect(json.content![0].attrs!.variant).toBe("warning");
    editor.destroy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/extensions/block-node.spec.tsx`
Expected: FAIL ("Failed to resolve import ./block-node").

- [ ] **Step 3: Write the implementation**

`src/components/block-editor/extensions/block-node.tsx`:
```tsx
import { Node, mergeAttributes } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
  type NodeViewProps,
} from "@tiptap/react";
import { createElement } from "react";
import type { BlockDefinition } from "../define-block";
import { getDefaultAttrs, schemaKeys } from "../define-block";

/** Build the React node-view component for a block definition. */
function makeBlockView(def: BlockDefinition) {
  return function BlockView({ node, editor, selected, updateAttributes }: NodeViewProps) {
    const Component = (!editor.isEditable && def.read) || def.edit || def.render;
    const mode = editor.isEditable ? "edit" : "read";
    const body = createElement(Component as BlockDefinition["render"], {
      attrs: node.attrs as Record<string, unknown>,
      mode,
      selected,
      updateAttrs: (patch: Record<string, unknown>) => updateAttributes(patch),
    });
    return (
      <NodeViewWrapper
        data-block={def.name}
        data-selected={selected || undefined}
        className="relative my-1 rounded-sm data-[selected]:outline data-[selected]:outline-2 data-[selected]:outline-primary/60"
      >
        {def.content ? <BlockWithContent>{body}</BlockWithContent> : body}
      </NodeViewWrapper>
    );
  };
}

/**
 * For content blocks, the block author renders `<NodeViewContent />` themselves
 * inside `render`. This wrapper is a no-op passthrough kept for symmetry.
 */
function BlockWithContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export { NodeViewContent };

/** Turn a BlockDefinition into a TipTap Node with a React node-view. */
export function createBlockNode(def: BlockDefinition): Node {
  const defaults = getDefaultAttrs(def.schema);
  const keys = schemaKeys(def.schema);
  const isAtom = def.atom ?? def.content == null;

  return Node.create({
    name: def.name,
    group: "block",
    selectable: true,
    draggable: true,
    atom: isAtom,
    ...(def.content ? { content: def.content } : {}),
    addAttributes() {
      return Object.fromEntries(
        keys.map((key) => [key, { default: defaults[key as keyof typeof defaults] ?? null }]),
      );
    },
    parseHTML() {
      return [{ tag: `div[data-block="${def.name}"]` }];
    },
    renderHTML({ HTMLAttributes }) {
      const attrs = mergeAttributes(HTMLAttributes, { "data-block": def.name });
      return def.content ? ["div", attrs, 0] : ["div", attrs];
    },
    addNodeView() {
      return ReactNodeViewRenderer(makeBlockView(def));
    },
  });
}
```

Note: add an optional `read?` field to `BlockDefinition` in `define-block.tsx` (used above). Update the interface:
```tsx
  /** Optional read-only renderer; falls back to `render`. */
  read?: ComponentType<BlockRenderProps<A>>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/extensions/block-node.spec.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/block-editor/extensions/block-node.tsx src/components/block-editor/extensions/block-node.spec.tsx src/components/block-editor/define-block.tsx
git commit -m "feat(block-editor): generic block node factory (React node-view)"
```

---

## Task 6: `use-block-editor` — assemble extensions + wrap/unwrap + value sync

**Files:**
- Create: `src/components/block-editor/use-block-editor.ts`
- Test: covered via Task 7 (`block-editor.spec.tsx`).

- [ ] **Step 1: Write the implementation**

`src/components/block-editor/use-block-editor.ts`:
```ts
import { useCallback, useMemo } from "react";
import { useEditor, type Editor, type JSONContent } from "@tiptap/react";
import { createBaseExtensions } from "./extensions/base";
import { createBlockNode } from "./extensions/block-node";
import { UnknownBlock, wrapUnknownNodes, unwrapUnknownNodes } from "./extensions/unknown-block";
import { createBlockRegistry } from "./block-registry";
import type { BlockDefinition } from "./define-block";
import { EMPTY_DOC } from "./constants";

export interface UseBlockEditorProps {
  value?: JSONContent;
  blocks: BlockDefinition[];
  editable?: boolean;
  placeholder?: string;
  onChange?: (value: JSONContent) => void;
  onBlur?: () => void;
}

export function useBlockEditor({
  value,
  blocks,
  editable = true,
  placeholder,
  onChange,
  onBlur,
}: UseBlockEditorProps): Editor | null {
  const registry = useMemo(() => createBlockRegistry(blocks), [blocks]);

  const extensions = useMemo(
    () => [
      ...createBaseExtensions({ placeholder }),
      UnknownBlock,
      ...registry.list().map(createBlockNode),
    ],
    [registry, placeholder],
  );

  const handleUpdate = useCallback(
    (editor: Editor) => onChange?.(unwrapUnknownNodes(editor.getJSON())),
    [onChange],
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      editable,
      extensions,
      content: value ?? EMPTY_DOC,
      onCreate: ({ editor }) => {
        const known = new Set(Object.keys(editor.schema.nodes));
        editor.commands.setContent(wrapUnknownNodes(value ?? EMPTY_DOC, known), {
          emitUpdate: false,
        });
      },
      onUpdate: ({ editor }) => handleUpdate(editor),
      onBlur: () => onBlur?.(),
    },
    [extensions, editable],
  );

  return editor;
}
```

- [ ] **Step 2: Verify it typechecks** (behavioral test lands in Task 7)

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/block-editor/use-block-editor.ts
git commit -m "feat(block-editor): editor hook (extensions + wrap/unwrap value sync)"
```

---

## Task 7: `block-editor.tsx` — editor composition (content only)

Chrome (gutter/picker/toolbar/config) is layered in Tasks 10–13. This task ships the editor surface + value/onChange/editable, with a debounced onChange.

**Files:**
- Create: `src/components/block-editor/block-editor.tsx`
- Create: `src/stories/block-editor/block-editor.stories.tsx`
- Test: `src/components/block-editor/block-editor.spec.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/block-editor.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic, ReadOnly } from "@/stories/block-editor/block-editor.stories";

const pm = (c: HTMLElement) => c.querySelector(".ProseMirror") as HTMLElement;

describe("<BlockEditor />", () => {
  it("renders the initial document text", async () => {
    const screen = render(<Basic />);
    await expect.element(pm(screen.container)).toHaveTextContent("Hello blocks");
  });

  it("is not editable in read mode", async () => {
    const screen = render(<ReadOnly />);
    await expect.element(pm(screen.container)).toHaveAttribute("contenteditable", "false");
  });
});
```

- [ ] **Step 2: Write the stories**

`src/stories/block-editor/block-editor.stories.tsx`:
```tsx
import { useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { BlockEditor } from "@/components/block-editor/block-editor";
import { ThemeProvider } from "@/components/admin";

export default { title: "Block Editor/BlockEditor" };

const doc: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Hello blocks" }] }],
};

export const Basic = () => {
  const [value, setValue] = useState<JSONContent>(doc);
  return (
    <ThemeProvider>
      <BlockEditor value={value} blocks={[]} onChange={setValue} />
    </ThemeProvider>
  );
};

export const ReadOnly = () => (
  <ThemeProvider>
    <BlockEditor value={doc} blocks={[]} editable={false} />
  </ThemeProvider>
);
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/block-editor.spec.tsx`
Expected: FAIL ("Failed to resolve import .../block-editor").

- [ ] **Step 4: Write the implementation**

`src/components/block-editor/block-editor.tsx`:
```tsx
import { useCallback, useMemo, useRef } from "react";
import { EditorContent, EditorContext, type Editor, type JSONContent } from "@tiptap/react";
import { debounce } from "lodash";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useBlockEditor } from "./use-block-editor";
import type { BlockDefinition } from "./define-block";
import { ONCHANGE_DEBOUNCE_MS } from "./constants";

export interface BlockEditorProps {
  value?: JSONContent;
  blocks: BlockDefinition[];
  editable?: boolean;
  placeholder?: string;
  className?: string;
  onChange?: (value: JSONContent) => void;
  onBlur?: () => void;
}

export function BlockEditor({
  value,
  blocks,
  editable = true,
  placeholder,
  className,
  onChange,
  onBlur,
}: BlockEditorProps) {
  const debouncedChange = useMemo(
    () => (onChange ? debounce(onChange, ONCHANGE_DEBOUNCE_MS) : undefined),
    [onChange],
  );

  const editor = useBlockEditor({
    value,
    blocks,
    editable,
    placeholder,
    onChange: debouncedChange,
    onBlur,
  });

  if (!editor) return null;

  return (
    <TooltipProvider>
      <EditorContext.Provider value={{ editor }}>
        <BlockEditorChrome editor={editor} editable={editable} className={className} />
      </EditorContext.Provider>
    </TooltipProvider>
  );
}

/** Chrome wrapper — extended with gutter / picker / toolbar in later tasks. */
function BlockEditorChrome({
  editor,
  editable,
  className,
}: {
  editor: Editor;
  editable: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      data-block-editor
      className={cn(
        editable &&
          "rounded-md border border-input shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className,
      )}
    >
      <EditorContent editor={editor} className="block-editor-content px-3 py-2" />
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/block-editor.spec.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/block-editor/block-editor.tsx src/stories/block-editor/block-editor.stories.tsx src/components/block-editor/block-editor.spec.tsx
git commit -m "feat(block-editor): editor composition (content surface, debounced onChange)"
```

---

## Task 8: `block-editor-input.tsx` — ra-core form input

**Files:**
- Create: `src/components/block-editor/block-editor-input.tsx`
- Create: `src/stories/block-editor/block-editor-input.stories.tsx`
- Test: `src/components/block-editor/block-editor-input.spec.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/block-editor-input.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic, Validation } from "@/stories/block-editor/block-editor-input.stories";

const pm = (c: HTMLElement) => c.querySelector(".ProseMirror") as HTMLElement;

describe("<BlockEditorInput />", () => {
  it("renders the field label and initial value", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Body")).toBeInTheDocument();
    await expect.element(pm(screen.container)).toHaveTextContent("Initial content");
  });

  it("shows a validation error when required and empty", async () => {
    const screen = render(<Validation />);
    await screen.getByRole("button", { name: /save/i }).click();
    await expect.element(screen.getByText("Required")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Write the stories**

`src/stories/block-editor/block-editor-input.stories.tsx`:
```tsx
import { useWatch } from "react-hook-form";
import { CoreAdminContext, RecordContextProvider, required } from "ra-core";
import { ThemeProvider, SimpleForm } from "@/components/admin";
import { BlockEditorInput } from "@/components/block-editor/block-editor-input";
import { i18nProvider } from "@/lib/i18n-provider";

export default { title: "Block Editor/BlockEditorInput" };

const record = {
  id: 1,
  body: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Initial content" }] }] },
};

const FormValues = () => (
  <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(useWatch(), null, 2)}</pre>
);

const Wrapper = ({ children, defaultValues = record }: { children: React.ReactNode; defaultValues?: Record<string, unknown> }) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <RecordContextProvider value={defaultValues}>
        <SimpleForm>{children}</SimpleForm>
      </RecordContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <BlockEditorInput source="body" />
    <FormValues />
  </Wrapper>
);

export const Validation = () => (
  <Wrapper defaultValues={{ id: 1, body: null }}>
    <BlockEditorInput source="body" validate={required()} />
  </Wrapper>
);
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/block-editor-input.spec.tsx`
Expected: FAIL ("Failed to resolve import .../block-editor-input").

- [ ] **Step 4: Write the implementation**

`src/components/block-editor/block-editor-input.tsx`:
```tsx
import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import { FormControl, FormError, FormField, FormLabel } from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { BlockEditor } from "./block-editor";
import { defaultBlocks } from "./blocks";
import type { BlockDefinition } from "./define-block";
import { EMPTY_DOC } from "./constants";

export interface BlockEditorInputProps extends InputProps {
  className?: string;
  blocks?: BlockDefinition[];
  placeholder?: string;
}

export function BlockEditorInput(props: BlockEditorInputProps) {
  const {
    className,
    blocks = defaultBlocks,
    placeholder,
    defaultValue = EMPTY_DOC,
    disabled,
    helperText,
    label,
    readOnly,
    source,
  } = props;
  const resource = useResourceContext(props);
  const { id, field, isRequired } = useInput({ ...props, source, defaultValue });

  return (
    <FormField id={id} className={className} name={field.name}>
      {label !== false && (
        <FormLabel>
          <FieldTitle label={label} source={source} resource={resource} isRequired={isRequired} />
        </FormLabel>
      )}
      <FormControl>
        <div>
          <BlockEditor
            value={field.value ?? EMPTY_DOC}
            blocks={blocks}
            placeholder={placeholder}
            editable={!disabled && !readOnly}
            onChange={field.onChange}
            onBlur={() => field.onBlur?.()}
          />
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
}
```

Note: this imports `./blocks` (`defaultBlocks`) — created in Task 14. Until then, temporarily import an empty array. After Task 14 lands, restore `import { defaultBlocks } from "./blocks"`. To keep this task green standalone, create a stub `src/components/block-editor/blocks/index.ts` now:
```ts
import type { BlockDefinition } from "../define-block";
export const defaultBlocks: BlockDefinition[] = [];
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/block-editor-input.spec.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/block-editor/block-editor-input.tsx src/components/block-editor/blocks/index.ts src/stories/block-editor/block-editor-input.stories.tsx src/components/block-editor/block-editor-input.spec.tsx
git commit -m "feat(block-editor): BlockEditorInput (ra-core form input, JSON value)"
```

---

## Task 9: `block-doc-field.tsx` — read-mode renderer

**Files:**
- Create: `src/components/block-editor/block-doc-field.tsx`
- Create: `src/stories/block-editor/block-doc-field.stories.tsx`
- Test: `src/components/block-editor/block-doc-field.spec.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/block-doc-field.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic, Empty } from "@/stories/block-editor/block-doc-field.stories";

const pm = (c: HTMLElement) => c.querySelector(".ProseMirror") as HTMLElement;

describe("<BlockDocField />", () => {
  it("renders the stored doc read-only", async () => {
    const screen = render(<Basic />);
    const el = pm(screen.container);
    await expect.element(el).toHaveTextContent("Stored content");
    await expect.element(el).toHaveAttribute("contenteditable", "false");
  });

  it("renders nothing when the field is empty", async () => {
    const screen = render(<Empty />);
    expect(pm(screen.container)).toBeNull();
  });
});
```

- [ ] **Step 2: Write the stories**

`src/stories/block-editor/block-doc-field.stories.tsx`:
```tsx
import { StoryAdmin } from "@/stories/_test-helpers";
import { BlockDocField } from "@/components/block-editor/block-doc-field";

export default { title: "Block Editor/BlockDocField" };

const record = {
  id: 1,
  body: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Stored content" }] }] },
};

export const Basic = () => (
  <StoryAdmin record={record}>
    <BlockDocField source="body" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ id: 1, body: null }}>
    <BlockDocField source="body" />
  </StoryAdmin>
);
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/block-doc-field.spec.tsx`
Expected: FAIL ("Failed to resolve import .../block-doc-field").

- [ ] **Step 4: Write the implementation**

`src/components/block-editor/block-doc-field.tsx`:
```tsx
import { useRecordContext } from "ra-core";
import get from "lodash/get";
import type { JSONContent } from "@tiptap/react";
import type { UnknownRecord } from "@/lib/unknown-types";
import { BlockEditor } from "./block-editor";
import { defaultBlocks } from "./blocks";
import type { BlockDefinition } from "./define-block";

export interface BlockDocFieldProps<RecordType extends UnknownRecord = UnknownRecord> {
  source: string;
  record?: RecordType;
  blocks?: BlockDefinition[];
  className?: string;
}

export function BlockDocField<RecordType extends UnknownRecord = UnknownRecord>({
  source,
  record: recordProp,
  blocks = defaultBlocks,
  className,
}: BlockDocFieldProps<RecordType>) {
  const recordFromContext = useRecordContext<RecordType>();
  const record = recordProp ?? recordFromContext;
  const value = record ? (get(record, source) as JSONContent | null | undefined) : undefined;

  if (value == null) return null;

  return <BlockEditor value={value} blocks={blocks} editable={false} className={className} />;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/block-doc-field.spec.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/block-editor/block-doc-field.tsx src/stories/block-editor/block-doc-field.stories.tsx src/components/block-editor/block-doc-field.spec.tsx
git commit -m "feat(block-editor): BlockDocField read-mode renderer"
```

---

## Task 10: `catalog-picker` + insert command + slash/⊕ wiring

**Files:**
- Create: `src/components/block-editor/chrome/catalog-picker.tsx`
- Create: `src/components/block-editor/extensions/slash-command.ts`
- Modify: `src/components/block-editor/block-editor.tsx` (mount picker, wire slash)
- Test: `src/components/block-editor/chrome/catalog-picker.spec.tsx`

- [ ] **Step 1: Write the failing test (presentational picker)**

`src/components/block-editor/chrome/catalog-picker.spec.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { z } from "zod";
import { Lightbulb, Boxes } from "lucide-react";
import { defineBlock } from "../define-block";
import { createBlockRegistry } from "../block-registry";
import { CatalogPicker } from "./catalog-picker";

const registry = createBlockRegistry([
  defineBlock({ name: "callout", label: "Callout", group: "content", icon: Lightbulb, schema: z.object({}), render: () => null }),
  defineBlock({ name: "referenceRecord", label: "Reference record", group: "data", icon: Boxes, schema: z.object({}), render: () => null }),
]);

describe("<CatalogPicker />", () => {
  it("lists grouped blocks and fires onSelect with the chosen block", async () => {
    const onSelect = vi.fn();
    const screen = render(<CatalogPicker registry={registry} onSelect={onSelect} onClose={() => {}} />);
    await expect.element(screen.getByText("Reference record")).toBeInTheDocument();
    await screen.getByText("Reference record").click();
    expect(onSelect).toHaveBeenCalledWith("referenceRecord");
  });

  it("filters by search query", async () => {
    const screen = render(<CatalogPicker registry={registry} onSelect={() => {}} onClose={() => {}} />);
    await screen.getByPlaceholder(/search blocks/i).fill("call");
    await expect.element(screen.getByText("Callout")).toBeInTheDocument();
    expect(screen.container.textContent).not.toContain("Reference record");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/chrome/catalog-picker.spec.tsx`
Expected: FAIL ("Failed to resolve import ./catalog-picker").

- [ ] **Step 3: Write the picker**

`src/components/block-editor/chrome/catalog-picker.tsx`:
```tsx
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { BlockRegistry } from "../block-registry";

export interface CatalogPickerProps {
  registry: BlockRegistry;
  onSelect: (blockName: string) => void;
  onClose: () => void;
}

const GROUP_LABELS: Record<string, string> = {
  content: "Content",
  media: "Media",
  layout: "Layout",
  data: "Data",
};

export function CatalogPicker({ registry, onSelect, onClose }: CatalogPickerProps) {
  return (
    <Command className="w-72 rounded-md border shadow-md" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <CommandInput placeholder="Search blocks…" autoFocus />
      <CommandList>
        <CommandEmpty>No blocks found.</CommandEmpty>
        {registry.groups().map(({ group, blocks }) => (
          <CommandGroup key={group} heading={GROUP_LABELS[group] ?? group}>
            {blocks.map((block) => {
              const Icon = block.icon;
              return (
                <CommandItem
                  key={block.name}
                  value={`${block.label} ${block.keywords?.join(" ") ?? ""}`}
                  onSelect={() => onSelect(block.name)}
                >
                  <Icon className="mr-2 size-4" />
                  <span>{block.label}</span>
                  {block.description && (
                    <span className="ml-2 truncate text-xs text-muted-foreground">{block.description}</span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/chrome/catalog-picker.spec.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Add the insert command + slash extension**

`src/components/block-editor/extensions/slash-command.ts`:
```ts
import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";

export interface SlashCommandOptions {
  onTrigger: (props: { range: { from: number; to: number }; clientRect: () => DOMRect | null }) => void;
  onClose: () => void;
}

/** Opens the catalog picker when the user types "/" at the start of a node. */
export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",
  addOptions() {
    return { onTrigger: () => {}, onClose: () => {} };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        startOfLine: false,
        command: ({ editor, range }) => {
          // The picker performs the actual insert; here we just expose the range.
          this.options.onTrigger({ range, clientRect: () => null });
        },
        render: () => ({
          onStart: (props) => this.options.onTrigger({ range: props.range, clientRect: props.clientRect }),
          onExit: () => this.options.onClose(),
        }),
      }),
    ];
  },
});

/** Replace the slash query range with a new block of the given name + default attrs. */
export function insertBlock(
  editor: import("@tiptap/core").Editor,
  blockName: string,
  range?: { from: number; to: number },
) {
  const chain = editor.chain().focus();
  if (range) chain.deleteRange(range);
  chain.insertContent({ type: blockName }).run();
}
```

- [ ] **Step 6: Wire the picker + slash into the editor**

Modify `src/components/block-editor/block-editor.tsx` — add a popover-hosted `CatalogPicker` driven by slash trigger and (later) the ⊕ button. Replace `BlockEditorChrome` with:
```tsx
import { useState, useCallback } from "react";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { CatalogPicker } from "./chrome/catalog-picker";
import { createBlockRegistry } from "./block-registry";
import { insertBlock } from "./extensions/slash-command";

function BlockEditorChrome({ editor, editable, blocks, className }: {
  editor: Editor; editable: boolean; blocks: BlockDefinition[]; className?: string;
}) {
  const registry = useMemo(() => createBlockRegistry(blocks), [blocks]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [range, setRange] = useState<{ from: number; to: number } | undefined>();

  const handleSelect = useCallback((name: string) => {
    insertBlock(editor, name, range);
    setPickerOpen(false);
  }, [editor, range]);

  return (
    <div data-block-editor className={cn(editable && "rounded-md border …", className)}>
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverAnchor asChild>
          <EditorContent editor={editor} className="block-editor-content px-3 py-2" />
        </PopoverAnchor>
        <PopoverContent align="start" className="p-0 w-auto">
          <CatalogPicker registry={registry} onSelect={handleSelect} onClose={() => setPickerOpen(false)} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```
Add the `SlashCommand` extension to `use-block-editor.ts` extensions, configured to `setRange(range); setPickerOpen(true)` on trigger. Pass `setRange`/`setPickerOpen` via the editor's `storage` or a ref bridge: simplest is to register `SlashCommand` with callbacks that dispatch a custom DOM event the chrome listens for. Implementation detail — use a small event bridge:

`use-block-editor.ts` add:
```ts
import { SlashCommand } from "./extensions/slash-command";
// inside extensions array:
SlashCommand.configure({
  onTrigger: ({ range }) => editorEvents.emit("slash", range),
  onClose: () => editorEvents.emit("slash-close"),
}),
```
Create `src/components/block-editor/editor-events.ts`:
```ts
type Range = { from: number; to: number };
type Listener = (range?: Range) => void;
const listeners = new Map<string, Set<Listener>>();
export const editorEvents = {
  on(event: string, fn: Listener) { (listeners.get(event) ?? listeners.set(event, new Set()).get(event)!).add(fn); return () => listeners.get(event)?.delete(fn); },
  emit(event: string, range?: Range) { listeners.get(event)?.forEach((fn) => fn(range)); },
};
```
Chrome subscribes in an effect: `editorEvents.on("slash", (r) => { setRange(r); setPickerOpen(true); })`.

- [ ] **Step 7: Add an interaction test for slash insert**

Append to `src/components/block-editor/block-editor.spec.tsx`:
```tsx
import { Basic as BasicWithBlocks } from "@/stories/block-editor/block-editor.stories";
// In the story file, export a story `WithCallout` that passes blocks={[calloutBlock]}.
// Test: type "/", pick Callout, assert a [data-block="callout"] node exists.
it("inserts a block via the slash menu", async () => {
  const screen = render(<WithCallout />);
  const el = pm(screen.container);
  await el.click();
  // type a slash to open the picker
  document.execCommand?.("insertText", false, "/");
  await expect.element(screen.getByPlaceholder(/search blocks/i)).toBeInTheDocument();
  await screen.getByText("Callout").click();
  await expect.element(screen.container.querySelector('[data-block="callout"]') as HTMLElement).toBeInTheDocument();
});
```
(If `execCommand` is unreliable in the browser provider, drive insertion by calling `insertBlock(editor, "callout")` via an exposed `onCreate` editor ref in the story, and keep the picker render/filter assertions in `catalog-picker.spec.tsx`.)

- [ ] **Step 8: Run tests**

Run: `pnpm vitest run --browser.headless src/components/block-editor/`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/block-editor/chrome/catalog-picker.tsx src/components/block-editor/extensions/slash-command.ts src/components/block-editor/editor-events.ts src/components/block-editor/block-editor.tsx src/components/block-editor/chrome/catalog-picker.spec.tsx src/components/block-editor/block-editor.spec.tsx src/stories/block-editor/block-editor.stories.tsx
git commit -m "feat(block-editor): catalog picker + slash-command insertion"
```

---

## Task 11: `block-gutter` — drag handle + ⊕ add

**Files:**
- Create: `src/components/block-editor/chrome/block-gutter.tsx`
- Modify: `src/components/block-editor/block-editor.tsx` (mount gutter)
- Test: `src/components/block-editor/chrome/block-gutter.spec.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/chrome/block-gutter.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { WithCallout } from "@/stories/block-editor/block-editor.stories";

describe("BlockGutter", () => {
  it("renders an add button that opens the catalog picker", async () => {
    const screen = render(<WithCallout />);
    await screen.container.querySelector(".ProseMirror")!.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
    const addButton = screen.getByRole("button", { name: /add block/i });
    await addButton.click();
    await expect.element(screen.getByPlaceholder(/search blocks/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/chrome/block-gutter.spec.tsx`
Expected: FAIL (no add-block button / import error).

- [ ] **Step 3: Write the gutter**

`src/components/block-editor/chrome/block-gutter.tsx`:
```tsx
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { type Editor } from "@tiptap/react";
import { GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BlockGutterProps {
  editor: Editor;
  onAdd: () => void;
}

/** Left-margin gutter following the hovered/selected node: ⊕ add + ⠿ drag. */
export function BlockGutter({ editor, onAdd }: BlockGutterProps) {
  return (
    <DragHandle editor={editor} className="flex items-center gap-0.5">
      <Button type="button" size="icon" variant="ghost" className="size-6" aria-label="Add block" onClick={onAdd}>
        <Plus className="size-4" />
      </Button>
      <span className="cursor-grab text-muted-foreground" aria-label="Drag to reorder">
        <GripVertical className="size-4" />
      </span>
    </DragHandle>
  );
}
```

- [ ] **Step 4: Mount the gutter in the editor chrome**

In `block-editor.tsx`, inside `BlockEditorChrome` (editable only), render `<BlockGutter editor={editor} onAdd={() => { setRange(undefined); setPickerOpen(true); }} />` next to `EditorContent`. The `DragHandle` extension positions itself; the picker opens anchored to the editor.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/chrome/block-gutter.spec.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/block-editor/chrome/block-gutter.tsx src/components/block-editor/block-editor.tsx src/components/block-editor/chrome/block-gutter.spec.tsx
git commit -m "feat(block-editor): gutter drag handle + add button"
```

---

## Task 12: `block-toolbar` — selection toolbar

**Files:**
- Create: `src/components/block-editor/chrome/block-toolbar.tsx`
- Modify: `src/components/block-editor/block-editor.tsx`
- Test: `src/components/block-editor/chrome/block-toolbar.spec.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/chrome/block-toolbar.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { SelectedCallout } from "@/stories/block-editor/block-editor.stories";

describe("BlockToolbar", () => {
  it("deletes the selected block", async () => {
    const screen = render(<SelectedCallout />);
    await expect.element(screen.container.querySelector('[data-block="callout"]') as HTMLElement).toBeInTheDocument();
    await screen.getByRole("button", { name: /delete block/i }).click();
    expect(screen.container.querySelector('[data-block="callout"]')).toBeNull();
  });
});
```
(`SelectedCallout` story: a doc containing one callout, with `onCreate` selecting the node via `editor.commands.setNodeSelection(pos)`.)

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/chrome/block-toolbar.spec.tsx`
Expected: FAIL.

- [ ] **Step 3: Write the toolbar**

`src/components/block-editor/chrome/block-toolbar.tsx`:
```tsx
import { type Editor } from "@tiptap/react";
import { Copy, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BlockToolbarProps {
  editor: Editor;
  onConfigure: () => void;
}

/** Floating actions for the currently selected block node. */
export function BlockToolbar({ editor, onConfigure }: BlockToolbarProps) {
  const duplicate = () => {
    const { selection } = editor.state;
    const node = selection.$from.nodeAfter ?? selection.$from.parent;
    if (node) editor.chain().focus().insertContentAt(selection.to, node.toJSON()).run();
  };
  const remove = () => editor.chain().focus().deleteSelection().run();

  return (
    <div className="flex items-center gap-0.5 rounded-md border bg-popover p-0.5 shadow-md">
      <Button type="button" size="icon" variant="ghost" className="size-7" aria-label="Configure block" onClick={onConfigure}>
        <Settings2 className="size-4" />
      </Button>
      <Button type="button" size="icon" variant="ghost" className="size-7" aria-label="Duplicate block" onClick={duplicate}>
        <Copy className="size-4" />
      </Button>
      <Button type="button" size="icon" variant="ghost" className="size-7" aria-label="Delete block" onClick={remove}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Mount the toolbar**

In `block-editor.tsx`, render `<BlockToolbar>` in a popover anchored to the selection when `editor.state.selection` is a `NodeSelection` on a block node (subscribe to `editor.on("selectionUpdate")`, track `isBlockSelected`). Wire `onConfigure` to open the config popover (Task 13).

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/chrome/block-toolbar.spec.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/block-editor/chrome/block-toolbar.tsx src/components/block-editor/block-editor.tsx src/components/block-editor/chrome/block-toolbar.spec.tsx src/stories/block-editor/block-editor.stories.tsx
git commit -m "feat(block-editor): block selection toolbar (configure/duplicate/delete)"
```

---

## Task 13: `block-config-popover` — schema-driven config form

**Files:**
- Create: `src/components/block-editor/chrome/block-config-popover.tsx`
- Create: `src/components/block-editor/chrome/auto-config-form.tsx`
- Modify: `src/components/block-editor/block-editor.tsx`
- Test: `src/components/block-editor/chrome/auto-config-form.spec.tsx`

- [ ] **Step 1: Write the failing test (auto form from schema)**

`src/components/block-editor/chrome/auto-config-form.spec.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { z } from "zod";
import { ThemeProvider } from "@/components/admin";
import { AutoConfigForm } from "./auto-config-form";

const schema = z.object({
  variant: z.enum(["info", "warning", "success"]).default("info"),
  dense: z.boolean().default(false),
});

describe("<AutoConfigForm />", () => {
  it("renders a select for enums and a switch for booleans, emitting changes", async () => {
    const onChange = vi.fn();
    const screen = render(
      <ThemeProvider>
        <AutoConfigForm schema={schema} attrs={{ variant: "info", dense: false }} onChange={onChange} />
      </ThemeProvider>,
    );
    await expect.element(screen.getByText(/variant/i)).toBeInTheDocument();
    await screen.getByRole("switch", { name: /dense/i }).click();
    expect(onChange).toHaveBeenCalledWith({ dense: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/chrome/auto-config-form.spec.tsx`
Expected: FAIL.

- [ ] **Step 3: Write the auto form**

`src/components/block-editor/chrome/auto-config-form.tsx`:
```tsx
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface AutoConfigFormProps {
  schema: z.ZodType;
  attrs: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}

function unwrap(field: z.ZodType): z.ZodType {
  let f = field as z.ZodType & { _def?: { innerType?: z.ZodType } };
  while (f?._def?.innerType) f = f._def.innerType as typeof f;
  return f;
}

/** Renders a minimal config form derived from a Zod object schema. */
export function AutoConfigForm({ schema, attrs, onChange }: AutoConfigFormProps) {
  const shape = (schema as unknown as { shape: Record<string, z.ZodType> }).shape;
  return (
    <div className="flex flex-col gap-3 p-1">
      {Object.entries(shape).map(([key, raw]) => {
        const field = unwrap(raw);
        const value = attrs[key];
        if (field instanceof z.ZodEnum) {
          const options = field.options as string[];
          return (
            <div key={key} className="flex flex-col gap-1">
              <Label className="text-xs capitalize">{key}</Label>
              <Select value={String(value ?? "")} onValueChange={(v) => onChange({ [key]: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {options.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          );
        }
        if (field instanceof z.ZodBoolean) {
          return (
            <div key={key} className="flex items-center justify-between gap-2">
              <Label className="text-xs capitalize" htmlFor={`cfg-${key}`}>{key}</Label>
              <Switch id={`cfg-${key}`} aria-label={key} checked={Boolean(value)} onCheckedChange={(c) => onChange({ [key]: c })} />
            </div>
          );
        }
        // string / number / fallback → text input
        return (
          <div key={key} className="flex flex-col gap-1">
            <Label className="text-xs capitalize">{key}</Label>
            <Input
              value={value == null ? "" : String(value)}
              onChange={(e) => onChange({ [key]: field instanceof z.ZodNumber ? Number(e.target.value) : e.target.value })}
            />
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Write the config popover wrapper**

`src/components/block-editor/chrome/block-config-popover.tsx`:
```tsx
import { createElement } from "react";
import type { BlockDefinition } from "../define-block";
import { AutoConfigForm } from "./auto-config-form";

export interface BlockConfigPopoverProps {
  block: BlockDefinition;
  attrs: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}

/** Body of the config popover — auto form or the block's custom config component. */
export function BlockConfigBody({ block, attrs, onChange }: BlockConfigPopoverProps) {
  if (!block.config || block.config === "auto") {
    return <AutoConfigForm schema={block.schema} attrs={attrs} onChange={onChange} />;
  }
  return createElement(block.config, { attrs, onChange });
}
```

- [ ] **Step 5: Mount in the editor**

In `block-editor.tsx`, when the block toolbar's "Configure" is clicked, open a popover whose body is `<BlockConfigBody block={registry.get(selectedNodeName)} attrs={selectedNode.attrs} onChange={(patch) => editor.commands.updateAttributes(selectedNodeName, patch)} />`.

- [ ] **Step 6: Run tests**

Run: `pnpm vitest run --browser.headless src/components/block-editor/chrome/`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/block-editor/chrome/block-config-popover.tsx src/components/block-editor/chrome/auto-config-form.tsx src/components/block-editor/block-editor.tsx src/components/block-editor/chrome/auto-config-form.spec.tsx
git commit -m "feat(block-editor): schema-driven config popover (auto form + custom)"
```

---

## Task 14: `callout` block (content exemplar) + defaultBlocks

**Files:**
- Create: `src/components/block-editor/blocks/callout.tsx`
- Modify: `src/components/block-editor/blocks/index.ts`
- Test: `src/components/block-editor/blocks/callout.spec.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/blocks/callout.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { CalloutStory } from "@/stories/block-editor/blocks.stories";

describe("callout block", () => {
  it("renders the callout with its inner prose and variant class", async () => {
    const screen = render(<CalloutStory />);
    const callout = screen.container.querySelector('[data-block="callout"]') as HTMLElement;
    await expect.element(callout).toBeInTheDocument();
    await expect.element(callout).toHaveTextContent("Note text");
    expect(callout.getAttribute("data-variant")).toBe("warning");
  });
});
```

- [ ] **Step 2: Write the story**

`src/stories/block-editor/blocks.stories.tsx`:
```tsx
import { BlockEditor } from "@/components/block-editor/block-editor";
import { calloutBlock } from "@/components/block-editor/blocks/callout";
import { ThemeProvider } from "@/components/admin";

export default { title: "Block Editor/Blocks" };

export const CalloutStory = () => (
  <ThemeProvider>
    <BlockEditor
      editable={false}
      blocks={[calloutBlock]}
      value={{
        type: "doc",
        content: [
          { type: "callout", attrs: { variant: "warning" }, content: [{ type: "paragraph", content: [{ type: "text", text: "Note text" }] }] },
        ],
      }}
    />
  </ThemeProvider>
);
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/callout.spec.tsx`
Expected: FAIL ("Failed to resolve import .../callout").

- [ ] **Step 4: Write the callout block**

`src/components/block-editor/blocks/callout.tsx`:
```tsx
import { z } from "zod";
import { Lightbulb } from "lucide-react";
import { NodeViewContent } from "../extensions/block-node";
import { defineBlock, type BlockRenderProps } from "../define-block";
import { cn } from "@/lib/utils";

const schema = z.object({
  variant: z.enum(["info", "warning", "success"]).default("info"),
});
type CalloutAttrs = z.infer<typeof schema>;

const VARIANT_CLASS: Record<CalloutAttrs["variant"], string> = {
  info: "border-blue-300 bg-blue-50 dark:bg-blue-950/30",
  warning: "border-amber-300 bg-amber-50 dark:bg-amber-950/30",
  success: "border-green-300 bg-green-50 dark:bg-green-950/30",
};

function CalloutRender({ attrs }: BlockRenderProps<CalloutAttrs>) {
  return (
    <div
      data-variant={attrs.variant}
      className={cn("flex gap-2 rounded-md border p-3", VARIANT_CLASS[attrs.variant])}
    >
      <Lightbulb className="mt-0.5 size-4 shrink-0" />
      <NodeViewContent className="flex-1" />
    </div>
  );
}

export const calloutBlock = defineBlock<CalloutAttrs>({
  name: "callout",
  label: "Callout",
  group: "content",
  icon: Lightbulb,
  keywords: ["note", "info", "warning", "tip"],
  description: "Highlighted note",
  schema,
  content: "block+",
  config: "auto",
  render: CalloutRender,
});
```

Note: `data-block="callout"` and `data-variant` come from the node-view wrapper + this render. Confirm `makeBlockView` forwards `data-block`; `data-variant` is set here. If the wrapper swallows `data-variant`, set it on the wrapper via a block-provided attribute — for v1 the inner `div[data-variant]` is queried in the test, which is fine.

- [ ] **Step 5: Register in defaultBlocks**

Replace `src/components/block-editor/blocks/index.ts`:
```ts
import type { BlockDefinition } from "../define-block";
import { calloutBlock } from "./callout";

/** Batteries-included content blocks (no ra-core data dependency). */
export const defaultBlocks: BlockDefinition[] = [calloutBlock];

export { calloutBlock };
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/callout.spec.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/block-editor/blocks/callout.tsx src/components/block-editor/blocks/index.ts src/stories/block-editor/blocks.stories.tsx src/components/block-editor/blocks/callout.spec.tsx
git commit -m "feat(block-editor): callout content block + defaultBlocks"
```

---

## Task 15: `reference-record` block (admin-data exemplar)

Proves the live-data path end-to-end: stores `{resource, id}`, resolves via `useGetOne`, renders states (empty/loading/error/loaded), and a custom config form using ra-core `ReferenceInput`.

**Files:**
- Create: `src/components/block-editor/blocks/block-states.tsx` (shared empty/skeleton/error)
- Create: `src/components/block-editor/blocks/reference-record.tsx`
- Test: `src/components/block-editor/blocks/reference-record.spec.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/blocks/reference-record.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { ResolvedRecord, EmptyRecord, MissingRecord } from "@/stories/block-editor/reference-record.stories";

const block = (c: HTMLElement) => c.querySelector('[data-block="referenceRecord"]') as HTMLElement;

describe("reference-record block", () => {
  it("resolves and renders the referenced record", async () => {
    const screen = render(<ResolvedRecord />);
    await expect.element(block(screen.container)).toHaveTextContent("Widget");
  });

  it("shows an empty state when no record is selected", async () => {
    const screen = render(<EmptyRecord />);
    await expect.element(block(screen.container)).toHaveTextContent(/pick a record/i);
  });

  it("shows an error state when the record is missing", async () => {
    const screen = render(<MissingRecord />);
    await expect.element(block(screen.container)).toHaveTextContent(/unavailable/i);
  });
});
```

- [ ] **Step 2: Write the stories**

`src/stories/block-editor/reference-record.stories.tsx`:
```tsx
import { CoreAdminContext, RecordContextProvider, TestMemoryRouter, memoryStore } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { ThemeProvider } from "@/components/admin";
import { BlockEditor } from "@/components/block-editor/block-editor";
import { referenceRecordBlock } from "@/components/block-editor/blocks/reference-record";

export default { title: "Block Editor/Blocks/ReferenceRecord" };

const i18nProvider = polyglotI18nProvider(() => englishMessages);
const dataProvider = fakeRestProvider({ products: [{ id: 1, name: "Widget" }] }, false);

const Frame = ({ id }: { id: number | null }) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext dataProvider={dataProvider} i18nProvider={i18nProvider} store={memoryStore()}>
        <RecordContextProvider value={{ id: 99 }}>
          <BlockEditor
            editable={false}
            blocks={[referenceRecordBlock]}
            value={{ type: "doc", content: [{ type: "referenceRecord", attrs: { resource: "products", id, fields: ["name"], layout: "card" } }] }}
          />
        </RecordContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export const ResolvedRecord = () => <Frame id={1} />;
export const EmptyRecord = () => <Frame id={null} />;
export const MissingRecord = () => <Frame id={999} />;
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/reference-record.spec.tsx`
Expected: FAIL ("Failed to resolve import .../reference-record").

- [ ] **Step 4: Write shared block states**

`src/components/block-editor/blocks/block-states.tsx`:
```tsx
import { AlertTriangle, MousePointerClick } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function BlockEmpty({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
      <MousePointerClick className="size-4" /> {label}
    </div>
  );
}

export function BlockSkeleton() {
  return <Skeleton className="h-16 w-full rounded-md" />;
}

export function BlockError({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      <AlertTriangle className="size-4" /> {label}
    </div>
  );
}
```

- [ ] **Step 5: Write the reference-record block**

`src/components/block-editor/blocks/reference-record.tsx`:
```tsx
import { z } from "zod";
import { Boxes } from "lucide-react";
import { useGetOne } from "ra-core";
import { defineBlock, type BlockRenderProps, type BlockConfigProps } from "../define-block";
import { BlockEmpty, BlockSkeleton, BlockError } from "./block-states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  resource: z.string().default(""),
  id: z.union([z.string(), z.number()]).nullable().default(null),
  fields: z.array(z.string()).optional(),
  layout: z.enum(["card", "inline"]).default("card"),
});
type RefAttrs = z.infer<typeof schema>;

function ReferenceRecordRender({ attrs }: BlockRenderProps<RefAttrs>) {
  const enabled = Boolean(attrs.resource && attrs.id != null);
  const { data, isPending, error } = useGetOne(
    attrs.resource,
    { id: attrs.id as string | number },
    { enabled },
  );

  if (!enabled) return <BlockEmpty label="Pick a record to reference" />;
  if (isPending) return <BlockSkeleton />;
  if (error || !data) return <BlockError label="Record unavailable" />;

  const fields = attrs.fields?.length ? attrs.fields : Object.keys(data).filter((k) => k !== "id");
  const title = String(data.name ?? data.title ?? data.id);

  if (attrs.layout === "inline") {
    return <span className="rounded bg-muted px-1.5 py-0.5 text-sm">{title}</span>;
  }
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {fields.map((f) => (
          <div key={f}><span className="font-medium">{f}:</span> {String(data[f] ?? "—")}</div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Custom config: a resource text field + a record id field. (Plan 2 upgrades to ReferenceInput.) */
function ReferenceRecordConfig({ attrs, onChange }: BlockConfigProps<RefAttrs>) {
  return (
    <div className="flex flex-col gap-2 p-1">
      <label className="text-xs">Resource</label>
      <input
        className="rounded border px-2 py-1 text-sm"
        value={attrs.resource ?? ""}
        onChange={(e) => onChange({ resource: e.target.value })}
      />
      <label className="text-xs">Record id</label>
      <input
        className="rounded border px-2 py-1 text-sm"
        value={attrs.id == null ? "" : String(attrs.id)}
        onChange={(e) => onChange({ id: e.target.value === "" ? null : e.target.value })}
      />
    </div>
  );
}

export const referenceRecordBlock = defineBlock<RefAttrs>({
  name: "referenceRecord",
  label: "Reference record",
  group: "data",
  icon: Boxes,
  keywords: ["record", "relation", "embed", "reference"],
  description: "Embed a live record",
  schema,
  config: ReferenceRecordConfig,
  render: ReferenceRecordRender,
});
```

Note: `useGetOne`'s `enabled` option lives in the third (query options) argument in ra-core v5; verify the signature against `node_modules/ra-core` and adjust if it differs. The `MissingRecord` story (id 999) drives the fakerest provider to reject → `error` path.

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/reference-record.spec.tsx`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add src/components/block-editor/blocks/block-states.tsx src/components/block-editor/blocks/reference-record.tsx src/stories/block-editor/reference-record.stories.tsx src/components/block-editor/blocks/reference-record.spec.tsx
git commit -m "feat(block-editor): reference-record admin-data block (live resolve + states)"
```

---

## Task 16: Public exports + full-editor integration story

**Files:**
- Modify: `src/components/block-editor/index.ts`
- Create: `src/stories/block-editor/playground.stories.tsx`
- Test: `src/components/block-editor/block-editor.integration.spec.tsx`

- [ ] **Step 1: Write the public index**

`src/components/block-editor/index.ts`:
```ts
export * from "./constants";
export * from "./define-block";
export * from "./block-registry";
export * from "./block-editor";
export * from "./block-editor-input";
export * from "./block-doc-field";
export { defaultBlocks, calloutBlock } from "./blocks";
export { referenceRecordBlock } from "./blocks/reference-record";
```

- [ ] **Step 2: Write an integration story + round-trip test (data-safety)**

`src/stories/block-editor/playground.stories.tsx`:
```tsx
import { useRef } from "react";
import type { Editor, JSONContent } from "@tiptap/react";
import { ThemeProvider } from "@/components/admin";
import { BlockEditor } from "@/components/block-editor/block-editor";
import { calloutBlock } from "@/components/block-editor/blocks/callout";

export default { title: "Block Editor/Playground" };

/** Doc containing a FOREIGN block type not registered here — must survive a round-trip. */
const docWithForeign: JSONContent = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "keep me" }] },
    { type: "futureWidget", attrs: { x: 1 }, content: [{ type: "text", text: "alien" }] },
  ],
};

export const ForeignBlockRoundTrip = () => {
  const out = useRef<JSONContent | null>(null);
  return (
    <ThemeProvider>
      <BlockEditor blocks={[calloutBlock]} value={docWithForeign} onChange={(v) => (out.current = v)} />
      <button onClick={() => { /* read out.current in test via getJSON */ }}>noop</button>
    </ThemeProvider>
  );
};
```

`src/components/block-editor/block-editor.integration.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import { calloutBlock } from "./blocks/callout";
import { createBaseExtensions } from "./extensions/base";
import { createBlockNode } from "./extensions/block-node";
import { UnknownBlock, wrapUnknownNodes, unwrapUnknownNodes } from "./extensions/unknown-block";

describe("block-editor data-safety round-trip", () => {
  it("preserves a foreign block type through load → serialize", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "keep me" }] },
        { type: "futureWidget", attrs: { x: 1 }, content: [{ type: "text", text: "alien" }] },
      ],
    };
    const editor = new Editor({
      element: document.createElement("div"),
      extensions: [...createBaseExtensions(), UnknownBlock, createBlockNode(calloutBlock)],
    });
    const known = new Set(Object.keys(editor.schema.nodes));
    editor.commands.setContent(wrapUnknownNodes(doc, known), { emitUpdate: false });
    const out = unwrapUnknownNodes(editor.getJSON());
    expect(out.content).toContainEqual(doc.content[1]); // foreign node intact
    editor.destroy();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `pnpm vitest run --browser.headless src/components/block-editor/block-editor.integration.spec.tsx`
Expected: PASS.

- [ ] **Step 4: Run the full block-editor suite + lint + typecheck (parallel)**

Run (single batch):
```bash
pnpm vitest run --browser.headless src/components/block-editor/
pnpm lint
pnpm typecheck
```
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/block-editor/index.ts src/stories/block-editor/playground.stories.tsx src/components/block-editor/block-editor.integration.spec.tsx
git commit -m "feat(block-editor): public exports + foreign-block round-trip test"
```

---

## Task 17: Registry item + demo wiring

**Files:**
- Modify: `scripts/generate-registry.mjs` (if block-editor needs explicit inclusion) — inspect first
- Create: demo usage in an existing resource (e.g. `src/demo/products/` Edit/Show)
- Modify: `registry.json` is generated — do not hand-edit; run the generator

- [ ] **Step 1: Inspect how registry items are produced**

Run: `node ./scripts/generate-registry.mjs --help 2>/dev/null; sed -n '1,80p' scripts/generate-registry.mjs`
Read how component folders map to registry items. Determine whether `src/components/block-editor/` is auto-discovered or needs an entry.

- [ ] **Step 2: Generate the registry**

Run: `pnpm registry:generate && pnpm registry:build`
Expected: a `block-editor` item appears in `registry.json` with the new files + deps (`@tiptap/*`, etc.).

- [ ] **Step 3: Wire a demo**

Add `<BlockEditorInput source="description" />` to a demo resource's Edit form and `<BlockDocField source="description" />` to its Show view (pick a resource whose fake data can hold a JSON doc, e.g. `products`). Follow the existing demo file patterns in `src/demo/products/`.

- [ ] **Step 4: Verify in the running app**

Run the dev server and confirm the editor mounts, a callout can be inserted via "/", a reference-record resolves, and the Show view renders read-only. (Use the preview workflow.)

- [ ] **Step 5: Commit**

```bash
git add registry.json src/demo/ scripts/
git commit -m "feat(block-editor): registry item + products demo wiring"
```

---

## Task 18: Documentation

**Files:**
- Create: `docs/src/content/docs/BlockEditorInput.md`
- Create: `docs/src/content/docs/BlockDocField.md`
- Create: `docs/src/content/docs/CustomBlocks.md`

- [ ] **Step 1: Write the docs pages**

Follow the kit's Usage → Props → per-prop section contract (see existing `docs/src/content/docs/*.md`). Cover:
- `BlockEditorInput.md` — usage in a form, props (`source`, `blocks`, `placeholder`, standard input props), value shape (TipTap JSON).
- `BlockDocField.md` — usage in Show, props (`source`, `blocks`), read-only rendering.
- `CustomBlocks.md` — the `defineBlock` API, the worked `callout` (content block) and `referenceRecord` (data block) examples, the catalog/config model, the `config:"auto"` vs custom form, and the unknown-block data-safety guarantee.

- [ ] **Step 2: Build docs**

Run: `pnpm doc:build`
Expected: builds without errors; new pages present.

- [ ] **Step 3: Commit**

```bash
git add docs/src/content/docs/BlockEditorInput.md docs/src/content/docs/BlockDocField.md docs/src/content/docs/CustomBlocks.md
git commit -m "docs(block-editor): BlockEditorInput, BlockDocField, custom blocks guide"
```

---

## Self-Review (against the spec)

**1. Spec coverage:**

| Spec requirement | Task |
|---|---|
| Hybrid component-block doc, doc-flow | 6–7 |
| Open `defineBlock` API (schema/render/config/catalog) | 2, 5, 14, 15 |
| Admin-data blocks (live ra-core) | 15 |
| TipTap JSON storage; references resolved live | 8, 15 |
| `BlockDocField` read mode (`editable:false`) | 9 |
| Insert: gutter ⊕ + searchable catalog + slash | 10, 11 |
| Reorder via PM-native drag handle | 11 |
| Selection toolbar + schema-driven config popover | 12, 13 |
| Unknown-block data-safety (round-trip) | 4, 16 |
| Error/empty/loading states for data-blocks | 15 |
| Registry packaging | 17 |
| Docs | 18 |
| Testing (pure + browser, story-driven, programmatic drag) | every task |
| Layering (`block-editor` sibling, no `admin→block-editor`) | enforced by import direction; verified by `pnpm lint` Task 16 |

**Deferred to Plan 2 (per spec scope):** toggle/image/embed/record-list/chart, `block-editor-data` split, ReferenceInput-based config upgrade, security hardening of the Embed block (sanitization lands with the Embed block in Plan 2).

**2. Placeholder scan:** No "TBD/TODO/handle later". Two explicit "verify the signature against node_modules" notes (Task 15 `useGetOne` options, Task 17 generator) are real verification steps, not hand-waving — each names the exact file to check.

**3. Type consistency:** `BlockDefinition` (incl. `read?` added in Task 5), `BlockRenderProps`, `BlockConfigProps`, `createBlockRegistry`/`BlockRegistry`, `createBlockNode`, `wrapUnknownNodes`/`unwrapUnknownNodes`/`UNKNOWN_BLOCK_NAME`, `useBlockEditor`, `BlockEditor`/`BlockEditorInput`/`BlockDocField`, `defaultBlocks`, `calloutBlock`/`referenceRecordBlock` — names used consistently across tasks.

**Known follow-ups discovered while planning (verify during execution):**
- `useGetOne` query-options arg shape in ra-core v5 (Task 15).
- Whether `scripts/generate-registry.mjs` auto-discovers new folders (Task 17).
- The `DragHandle` React component's exact props/import in `@tiptap/extension-drag-handle-react@3` (Task 11) — adjust the import if the package exports a named vs default `DragHandle`.
- Slash `Suggestion` plugin: confirm `@tiptap/suggestion` default export shape (Task 10).
