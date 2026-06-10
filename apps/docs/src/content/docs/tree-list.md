---
title: "TreeList"
---

`<TreeList>` renders a list of records as a hierarchical, expandable tree. Each record points to its parent via a configurable foreign-key field; root nodes have a null/undefined parent. Useful for nested categories, org charts, sitemaps, comment threads, and anything else with a parent–child relationship.

## Usage

```tsx
import { List, TreeList, Resource } from "@/components/admin";

const CategoryList = () => (
  <List perPage={1000}>
    <TreeList parentSource="parent_id" titleSource="name" defaultExpanded />
  </List>
);
```

Use `perPage={1000}` (or higher) on the parent `<List>` so the entire tree fits without paginating — partial trees produce orphaned nodes.

## Props

| Prop              | Type                            | Default                             |
| ----------------- | ------------------------------- | ----------------------------------- |
| `parentSource`    | `string`                        | required                            |
| `titleSource`     | `string`                        | recordRepresentation                |
| `iconSource`      | `string`                        | —                                   |
| `iconMap`         | `Record<string, ComponentType>` | `{}`                                |
| `defaultExpanded` | `boolean`                       | `false`                             |
| `onSelect`        | `(record) => void`              | navigate to `/{resource}/{id}/show` |
| `emptyLabel`      | `string`                        | translated `No items`               |

## `parentSource`

The name of the field on each record that contains the parent record's id. Records with a null or undefined value for this field (or whose parent id doesn't match any loaded record) are treated as roots.

## `titleSource`

Field used as the visible row label. When omitted, falls back to the resource's `recordRepresentation`.

## `iconSource` and `iconMap`

Optionally render a per-row icon. Set `iconSource` to the field name that holds a string key, and provide `iconMap` mapping those keys to React component types.

```tsx
import { FolderIcon, FileIcon } from "lucide-react";

<TreeList
  parentSource="parent_id"
  iconSource="type"
  iconMap={{ folder: FolderIcon, file: FileIcon }}
/>;
```

## `defaultExpanded`

When `true`, all nodes start in the expanded state. Defaults to `false` (collapsed).

## `onSelect`

Custom click handler for row selection. Receives the full record object. When omitted, clicking a row navigates to `/{resource}/{id}/show`.

## `emptyLabel`

Text shown when the list has no records. Defaults to the translated value of `ra.tree_list.empty` (`"No items"`).

## i18n

- `ra.tree_list.empty` — empty-state label

## Notes

- The tree is reconstructed in-memory each render from the flat list of records returned by `useListContext`. For very large hierarchies (thousands of nodes), consider lazy-loading children via a separate component.
- Orphaned records (whose `parent_id` doesn't point to any known record) are rendered as additional roots.
