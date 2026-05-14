---
title: "ListActions"
---

Default action toolbar rendered on top of [`<List>`](./List.md) views.

## Usage

Pass `<ListActions>` to a `<List>` to render the conventional `<FilterButton>` + `<CreateButton>` + `<ExportButton>` combo on the right side of the header:

```tsx
import { List, ListActions, DataTable } from "@/components/admin";

export const PostList = () => (
  <List actions={<ListActions />}>
    <DataTable>
      <DataTable.Col source="title" />
    </DataTable>
  </List>
);
```

You can override the actions by passing custom children:

```tsx {6-9}
import {
  CreateButton,
  ExportButton,
  List,
  ListActions,
} from "@/components/admin";

export const PostList = () => (
  <List
    actions={
      <ListActions>
        <CreateButton />
        <ExportButton />
      </ListActions>
    }
  >
    {/* ... */}
  </List>
);
```

## Props

| Prop        | Required | Type                          | Default                  | Description                                         |
| ----------- | -------- | ----------------------------- | ------------------------ | --------------------------------------------------- |
| `children`  | Optional | `ReactNode`                   | Filter + Create + Export | Replace the toolbar content                         |
| `resource`  | Optional | `string`                      | From context             | Override the resource name                          |
| `filters`   | Optional | `ReactElement \| ReactNode[]` | From `FilterContext`     | Filter inputs used to render the `<FilterButton>`   |
| `exporter`  | Optional | `Exporter \| boolean`         | From `ListContext`       | Disable the export button by passing `false`        |
| `hasCreate` | Optional | `boolean`                     | From resource definition | Force showing/hiding the create button              |
| `className` | Optional | `string`                      | —                        | Extra Tailwind classes appended to the root element |

## `children`

Pass children to fully replace the toolbar content. This is the recommended escape hatch to add custom action buttons:

```tsx
import { CreateButton, ExportButton, ListActions } from "@/components/admin";

const PostListActions = () => (
  <ListActions>
    <MyCustomButton />
    <CreateButton />
    <ExportButton />
  </ListActions>
);
```

## `exporter`

Set `exporter={false}` to hide the export button entirely:

```tsx
<ListActions exporter={false} />
```
