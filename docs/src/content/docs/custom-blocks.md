---
title: "Custom Blocks"
---

The block editor is open by design. Use `defineBlock` to author new block types and pass them to `<BlockEditorInput>` and `<BlockDocField>` via the `blocks` prop. There is no global registry — blocks are always explicit.

## `defineBlock`

```ts
import { defineBlock } from "@/components/block-editor";

const myBlock = defineBlock<MyAttrs>({
  name: "myBlock",       // Unique id — also the ProseMirror node name
  label: "My Block",     // Label shown in the catalog picker
  group: "content",      // Catalog group: "content" | "media" | "layout" | "data" | string
  icon: SomeIcon,        // Lucide icon
  keywords: ["my"],      // Search keywords for the catalog
  description: "…",     // Tooltip / catalog subtitle
  schema,                // Zod schema for attrs — drives defaults, config, and validation
  render: MyRender,      // Single render fn for both edit and read modes
  config: "auto",        // Config popover: "auto" | React component | undefined
  content: "block+",     // ProseMirror content expr; omit for atom blocks
});
```

`defineBlock` is a typed pass-through: the `A` generic is inferred from `schema`, so `render` and `config` receive correctly typed `attrs`. The returned value is the erased `BlockDefinition` type so heterogeneous blocks collect into `BlockDefinition[]` without variance errors.

## `BlockDefinition` shape

| Field         | Type                                             | Required | Description                                                                          |
| ------------- | ------------------------------------------------ | -------- | ------------------------------------------------------------------------------------ |
| `name`        | `string`                                         | Yes      | Unique block id, used as the ProseMirror node name                                   |
| `label`       | `string`                                         | Yes      | Human-readable name shown in the catalog picker                                      |
| `group`       | `"content" \| "media" \| "layout" \| "data" \| string` | Yes | Catalog group                                                                  |
| `icon`        | `LucideIcon`                                     | Yes      | Icon shown in the catalog and toolbar                                                |
| `keywords`    | `string[]`                                       | No       | Additional search terms                                                              |
| `description` | `string`                                         | No       | Short description shown in the catalog                                               |
| `schema`      | `z.ZodType<A>`                                   | Yes      | Zod schema — must be a `z.object`; drives attr defaults, `config:"auto"`, validation |
| `render`      | `ComponentType<BlockRenderProps<A>>`             | Yes      | Renders the block in both edit and read modes                                        |
| `edit`        | `ComponentType<BlockRenderProps<A>>`             | No       | Override render used only in edit mode                                               |
| `read`        | `ComponentType<BlockRenderProps<A>>`             | No       | Override render used only in read mode                                               |
| `config`      | `"auto" \| ComponentType<BlockConfigProps<A>>`   | No       | Config popover form; `"auto"` derives fields from `schema`                           |
| `content`     | `string`                                         | No       | ProseMirror content expression (e.g. `"block+"`); omit for atom blocks              |
| `atom`        | `boolean`                                        | No       | Force atom; defaults to `true` when `content` is absent                              |

### `BlockRenderProps`

```ts
interface BlockRenderProps<A> {
  attrs: A;                              // Typed block attributes
  mode: "edit" | "read";                 // Current rendering mode
  selected?: boolean;                    // Whether the block is selected in the editor
  updateAttrs?: (patch: Partial<A>) => void; // Patch attrs inline (edit mode only)
}
```

### `BlockConfigProps`

```ts
interface BlockConfigProps<A> {
  attrs: A;                              // Current typed attributes
  onChange: (patch: Partial<A>) => void; // Patch attrs from the config popover
}
```

## Content block example: `calloutBlock`

A content block contains inline or block-level prose using ProseMirror's content model (`content: "block+"`). Use `<NodeViewContent>` as the editable region.

```tsx
import { z } from "zod";
import { Lightbulb } from "lucide-react";
import { NodeViewContent } from "@/components/block-editor/extensions/block-node";
import { defineBlock, type BlockRenderProps } from "@/components/block-editor";
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
      className={cn(
        "flex gap-2 rounded-md border p-3",
        VARIANT_CLASS[attrs.variant],
      )}
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
  content: "block+",   // inner prose content is editable
  config: "auto",      // config popover is generated from schema
  render: CalloutRender,
});
```

Key points:
- `content: "block+"` makes the block a ProseMirror container; `<NodeViewContent>` marks the editable region inside the render function.
- `config: "auto"` auto-generates a config popover from the Zod schema fields (the `variant` enum becomes a select).

## Data block example: `referenceRecordBlock`

A data block is an **atom** (no inner content). It calls ra-core hooks directly inside `render` to fetch live data and must handle loading, error, and empty states.

```tsx
import { z } from "zod";
import { Boxes } from "lucide-react";
import { useGetOne } from "ra-core";
import {
  defineBlock,
  type BlockRenderProps,
  type BlockConfigProps,
} from "@/components/block-editor";
import { BlockEmpty, BlockSkeleton, BlockError } from "@/components/block-editor/blocks/block-states";
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

  const title = String(data.name ?? data.title ?? data.id);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
    </Card>
  );
}

/** Custom config form — used because "auto" would produce raw text inputs for resource/id. */
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
        onChange={(e) =>
          onChange({ id: e.target.value === "" ? null : e.target.value })
        }
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
  config: ReferenceRecordConfig, // custom form instead of "auto"
  render: ReferenceRecordRender,
  // no `content` → atom block
});
```

Key points:
- No `content` field → the block is an atom; `render` is fully responsible for the visual output.
- `useGetOne` (or any ra-core hook) is called directly inside the render component. The `enabled` flag prevents fetching until `resource` and `id` are set.
- The three shell components (`BlockEmpty`, `BlockSkeleton`, `BlockError`) provide consistent empty / loading / error UX.
- A custom `config` component is used instead of `"auto"` because the auto-form would produce plain text inputs for `resource` and `id` without validation context. A future plan upgrades this to a `ReferenceInput`-based picker.

## `config: "auto"` vs a custom config component

| Option | When to use |
| --- | --- |
| `"auto"` | Schema fields map cleanly to primitive inputs (strings, numbers, enums, booleans). Generates a form automatically — no code needed. |
| Custom component | Complex inputs (pickers, async search, multi-field combos), or when you want tight control over the popover UX. |

## Registering blocks

There is no global block registry. Pass your blocks explicitly to `<BlockEditorInput>` and `<BlockDocField>`:

```tsx
import { BlockEditorInput } from "@/components/block-editor";
import { calloutBlock, referenceRecordBlock } from "@/components/block-editor";
import { myCustomBlock } from "@/components/my-custom-block";

const myBlocks = [calloutBlock, referenceRecordBlock, myCustomBlock];

// In Edit:
<BlockEditorInput source="notes" blocks={myBlocks} />

// In Show:
<BlockDocField source="notes" blocks={myBlocks} />
```

The `defaultBlocks` export (used when `blocks` is omitted) contains only `calloutBlock` — it has no dependency on ra-core data hooks and is safe to use anywhere.

## Unknown-block data-safety guarantee

When a document is loaded into an editor that does not know about one or more of the block types stored in the JSON, those nodes are **not discarded**. They are wrapped in an internal `unknownBlock` placeholder that:

1. Renders a dimmed UI to signal that the block type is unrecognised.
2. Preserves the original node JSON verbatim in the `payload` attribute.
3. Restores the original node JSON on save, so the document round-trips losslessly.

This means you can safely deploy a subset of blocks on one screen without corrupting documents that contain blocks from a superset. It also allows you to remove a block type from your app without data loss — existing documents keep the node data until the block type is re-introduced or explicitly migrated.
