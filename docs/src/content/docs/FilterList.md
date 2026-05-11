---
title: "FilterList"
---

Header and container for a list of filter list items, used in the sidebar of a [`<List>`](./List.md) view.

## Usage

`<FilterList>` is designed to be rendered inside the `aside` of a `<List>` view, alongside `<FilterListItem>` and `<FilterLiveSearch>`:

```tsx
import { Card } from "@/components/ui/card";
import { Mail, Newspaper } from "lucide-react";
import {
  FilterList,
  FilterListItem,
  FilterLiveSearch,
  List,
  DataTable,
} from "@/components/admin";

const FilterSidebar = () => (
  <Card className="p-4">
    <FilterLiveSearch />
    <FilterList label="Status" icon={<Newspaper className="size-4" />}>
      <FilterListItem label="Published" value={{ status: "published" }} />
      <FilterListItem label="Draft" value={{ status: "draft" }} />
    </FilterList>
    <FilterList
      label="Subscribed to newsletter"
      icon={<Mail className="size-4" />}
    >
      <FilterListItem label="Yes" value={{ has_newsletter: true }} />
      <FilterListItem label="No" value={{ has_newsletter: false }} />
    </FilterList>
  </Card>
);

export const PostList = () => (
  <List aside={<FilterSidebar />}>
    <DataTable>
      <DataTable.Col source="title" />
    </DataTable>
  </List>
);
```

`<FilterList>` reads its filter state from the parent [`<ListContext>`](https://marmelab.com/react-admin/useListContext.html), so it must be rendered inside a `<List>` (or any other component that exposes a list context).

## Props

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `label` | Required | `string` | - | Section header label, translated through the i18n provider |
| `icon` | Optional | `ReactNode` | - | Icon displayed before the label |
| `children` | Required | `ReactNode` | - | `<FilterListItem>` elements or similar |
| `className` | Optional | `string` | - | Extra Tailwind classes appended to the root element |

## `label`

The `label` prop is required. It is passed through the i18n provider so you can use translation keys:

```tsx
<FilterList label="resources.posts.filters.status">
  ...
</FilterList>
```

## `icon`

A React element displayed next to the section label. Typically a `lucide-react` icon:

```tsx
import { Mail } from "lucide-react";

<FilterList label="Newsletter" icon={<Mail className="size-4" />}>
  ...
</FilterList>
```
