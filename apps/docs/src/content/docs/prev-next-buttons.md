---
title: "PrevNextButtons"
---

Renders navigation buttons that link to the previous and next records of the current resource, plus the index/total.

## Usage

Place it inside a `<Show>` or `<Edit>` view (where a `RecordContext` is provided):

```tsx {4}
import { Edit, PrevNextButtons } from "@/components/admin";

const PostEdit = () => <Edit actions={<PrevNextButtons />}>...</Edit>;
```

By default the buttons link to the same kind of view as the current one (edit if inside an `<Edit>`, show if inside a `<Show>`). Use the `linkType` prop to override.

The component uses `usePrevNextController` from `ra-core`, which re-fetches a paginated list of records using the same filters/sort the user last used in the list view. Use the `filter`, `sort`, `limit`, and `storeKey` props to customize this query.

## Props

| Prop                  | Required | Type               | Default      | Description                                             |
| --------------------- | -------- | ------------------ | ------------ | ------------------------------------------------------- |
| `className`           | Optional | `string`           | -            | Additional classes on the wrapping `<nav>`              |
| `filter`              | Optional | `FilterPayload`    | -            | Filters for the query that finds neighbouring records   |
| `filterDefaultValues` | Optional | `FilterPayload`    | -            | Default filters merged with stored ones                 |
| `limit`               | Optional | `number`           | 1000         | Max number of records fetched                           |
| `linkType`            | Optional | `"edit" \| "show"` | inferred     | Whether the links target the edit or show view          |
| `queryOptions`        | Optional | `UseQueryOptions`  | -            | Options forwarded to the underlying TanStack Query call |
| `ref`                 | Optional | `Ref<HTMLElement>` | -            | Forwarded to the underlying `<Button>`                  |
| `resource`            | Optional | `string`           | From context | Resource name                                           |
| `sort`                | Optional | `SortPayload`      | -            | Sort order                                              |
| `storeKey`            | Optional | `string \| false`  | -            | Key used to find the saved list params (false disables) |

## `ref`

Forwards a ref to the underlying `<Button>` element.

```tsx
import { useRef } from "react";
import { PrevNextButtons } from "@/components/admin";

const PostEdit = () => {
  const ref = useRef<HTMLElement>(null);
  return <Edit actions={<PrevNextButtons ref={ref} />}>...</Edit>;
};
```

## `linkType`

Use `linkType="show"` from an `<Edit>` view to make the buttons link to the show view instead:

```tsx
<PrevNextButtons linkType="show" />
```

## `filter` and `sort`

When you want the prev/next navigation to follow a specific filter and sort independent from the list view, pass them explicitly:

```tsx
<PrevNextButtons
  filter={{ status: "published" }}
  sort={{ field: "published_at", order: "DESC" }}
/>
```
