---
title: "BlockEditorInput"
---

Use `<BlockEditorInput>` to edit structured content in a block editor (TipTap) and store it as TipTap JSON. The value is a plain JavaScript object (`JSONContent`) — not HTML or Markdown.

## Installation

This is an optional component and is not included in the `admin` registry block by default. Install it with:

```bash
npx shadcn@latest add https://shadmin.turtlesocks.dev/r/block-editor-input.json
```

## Usage

```tsx
import { Edit, SimpleForm } from "@/components/admin";
import { BlockEditorInput } from "@/components/block-editor";

const OrderEdit = () => (
  <Edit>
    <SimpleForm>
      <BlockEditorInput source="notes" />
    </SimpleForm>
  </Edit>
);
```

## Value shape

The stored value is a TipTap `JSONContent` object, for example:

```json
{
  "type": "doc",
  "content": [
    { "type": "paragraph", "content": [{ "type": "text", "text": "Hello" }] }
  ]
}
```

Store this column as `jsonb` in your database. The default value (an empty document) is `{ type: "doc", content: [{ type: "paragraph" }] }`.

## Props

| Prop          | Required | Type                       | Default                | Description                                               |
| ------------- | -------- | -------------------------- | ---------------------- | --------------------------------------------------------- |
| `source`      | Required | `string`                   | -                      | Field name in the record                                  |
| `blocks`      | Optional | `BlockDefinition[]`        | `defaultBlocks`        | Block types available in the editor                       |
| `placeholder` | Optional | `string`                   | -                      | Placeholder shown in an empty editor                      |
| `label`       | Optional | `string \| false`          | Inferred from `source` | Custom label, or `false` to hide it                       |
| `helperText`  | Optional | `ReactNode`                | -                      | Help text displayed below the editor                      |
| `validate`    | Optional | `Validator \| Validator[]` | -                      | Validation rules                                          |
| `disabled`    | Optional | `boolean`                  | -                      | Disable the editor                                        |
| `readOnly`    | Optional | `boolean`                  | -                      | Make the editor read-only (identical to `disabled`)       |
| `className`   | Optional | `string`                   | -                      | CSS classes applied to the field wrapper                  |

All standard ra-core `InputProps` (e.g. `defaultValue`, `format`, `parse`, `sx`) are also accepted.

## `blocks`

Pass a `blocks` array to control which block types are available in the editor. Omitting `blocks` uses `defaultBlocks`, which includes the built-in `calloutBlock`.

```tsx
import { BlockEditorInput } from "@/components/block-editor";
import { calloutBlock, referenceRecordBlock } from "@/components/block-editor";

<BlockEditorInput
  source="notes"
  blocks={[calloutBlock, referenceRecordBlock]}
/>
```

See [Custom Blocks](./custom-blocks.md) for how to author your own block types with `defineBlock`.

## `placeholder`

Text shown in the editor body when the document is empty.

```tsx
<BlockEditorInput source="notes" placeholder="Add notes…" />
```

## `validate`

Accepts the same validators as other ra-core inputs.

```tsx
import { required } from "ra-core";

<BlockEditorInput source="notes" validate={required()} />
```

## `disabled` / `readOnly`

Both props render the editor in a non-interactive state. Use `disabled` for form-level control (e.g. during submission), `readOnly` for a permanently locked field.

```tsx
<BlockEditorInput source="notes" readOnly />
```

To render stored content in a Show view without the editor chrome, use [`<BlockDocField>`](./block-doc-field.md) instead.
