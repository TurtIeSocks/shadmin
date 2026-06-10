---
title: "BlockDocField"
---

Use `<BlockDocField>` to render a stored block document in read-only mode in a Show view. It reads TipTap JSON from the record at `source` and renders it using the same block renderers as the editor, but without any editing chrome.

## Usage

```tsx
import { Show, SimpleShowLayout } from "@/components/admin";
import { BlockDocField } from "@/components/block-editor";

const OrderShow = () => (
  <Show>
    <SimpleShowLayout>
      <BlockDocField source="notes" />
    </SimpleShowLayout>
  </Show>
);
```

## Empty values

`<BlockDocField>` returns `null` when the field value is `null`, `undefined`, or absent from the record — no wrapper element is rendered. This makes it safe to include unconditionally in a layout.

## Props

| Prop        | Required | Type                | Default         | Description                                            |
| ----------- | -------- | ------------------- | --------------- | ------------------------------------------------------ |
| `source`    | Required | `string`            | -               | Field name in the record                               |
| `blocks`    | Optional | `BlockDefinition[]` | `defaultBlocks` | Block types used to render the stored document         |
| `record`    | Optional | `object`            | Record context  | Explicit record (falls back to `useRecordContext`)     |
| `className` | Optional | `string`            | -               | CSS classes applied to the rendered output             |

## `blocks`

The `blocks` array must match (or be a superset of) the blocks used when the document was created. Block types present in the JSON but absent from `blocks` are rendered as a dimmed placeholder — the unknown node data is preserved in the document and round-trips losslessly.

```tsx
import { BlockDocField } from "@/components/block-editor";
import { calloutBlock, referenceRecordBlock } from "@/components/block-editor";

<BlockDocField
  source="notes"
  blocks={[calloutBlock, referenceRecordBlock]}
/>
```

## Data blocks in read mode

Data blocks such as `referenceRecordBlock` call ra-core hooks (e.g. `useGetOne`) during rendering, so they still fetch live data in a Show view. The record context from `<Show>` is not used by the block itself — it fetches the referenced record independently.

## Pairing with `BlockEditorInput`

Use `<BlockDocField>` in Show views and `<BlockEditorInput>` in Create/Edit forms. Pass the same `blocks` array to both so block types are consistent.

```tsx
import { BlockEditorInput } from "@/components/block-editor";
import { BlockDocField } from "@/components/block-editor";
import { calloutBlock, referenceRecordBlock } from "@/components/block-editor";

const myBlocks = [calloutBlock, referenceRecordBlock];

// In Edit:
<BlockEditorInput source="notes" blocks={myBlocks} />

// In Show:
<BlockDocField source="notes" blocks={myBlocks} />
```
