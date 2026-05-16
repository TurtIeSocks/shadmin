---
title: "ChipField"
---

Displays a value inside a styled shadcn [`<Badge>`](https://ui.shadcn.com/docs/components/badge), similar to a Material UI Chip. Useful for tags, statuses, or short categorical labels.

## Usage

```tsx
import { ChipField } from "@/components/admin";

<ChipField source="category" />;
```

You can change the badge style via the `variant` prop:

```tsx
<ChipField source="status" variant="secondary" />
```

## Props

| Prop           | Required | Type                                                     | Default             | Description                             |
| -------------- | -------- | -------------------------------------------------------- | ------------------- | --------------------------------------- |
| `source`       | Required | `string`                                                 | -                   | Field name                              |
| `record`       | Optional | `object`                                                 | Record from context | Explicit record                         |
| `defaultValue` | Optional | `any`                                                    | -                   | Fallback value                          |
| `empty`        | Optional | `ReactNode`                                              | -                   | Placeholder when value is null or empty |
| `variant`      | Optional | `"default" \| "outline" \| "secondary" \| "destructive"` | `"outline"`         | Badge style                             |
| `className`    | Optional | `string`                                                 | -                   | Additional CSS classes                  |

Remaining props are forwarded to the underlying `<Badge>` component.

## `source`

The name of the field on the record. The value is read with `useFieldValue`.

```tsx
<ChipField source="status" />
```

## `empty`

Rendered when the field value is `null`, `undefined`, or an empty string. Strings are passed through the translator.

```tsx
<ChipField source="status" empty="No status" />
```

## `variant`

Switches the visual style of the underlying shadcn `<Badge>`. Defaults to `"outline"`.

```tsx
<ChipField source="status" variant="secondary" />
```
