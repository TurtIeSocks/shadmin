---
title: "LayoutBuilder"
---

Drag-drop reorder UI for a resource's list columns. Persists the order to
`useStore` under a deterministic key so consumers can read it back into
`<DataTable storeKey>`.

## Usage

```tsx
import { LayoutBuilder } from '@/components/admin';

<LayoutBuilder
  availableFields={["id", "title", "author"]}
  mode="list-columns"
/>
```

## Props

| Prop              | Required | Type                                              | Default                              | Description |
| ----------------- | -------- | ------------------------------------------------- | ------------------------------------ | ----------- |
| `availableFields` | Required | `readonly string[]`                               | -                                    | All fields the resource exposes |
| `mode`            | Optional | `"list-columns" \| "show-layout" \| "edit-form"`  | `"list-columns"`                     | Layout target (v1 ships list-columns only) |
| `defaultOrder`    | Optional | `readonly string[]`                               | `availableFields`                    | Initial order |
| `storeKey`        | Optional | `string`                                          | `` `layout.<resource>.<mode>` ``     | Override persistence key |
| `resource`        | Optional | `string`                                          | Context                              | Override resource |

## Persistence

Pair with `<DataTable storeKey={`layout.${resource}.list-columns`}>` so the
data table picks up the reordered arrangement.

## Out of scope (v1)

- `show-layout` and `edit-form` modes.
- Visibility toggles per field (`<Configurable>` handles that today).
- Preview of how the layout will render.
