---
title: "FilterLiveSearch"
---

Debounced full-text search input designed to be rendered in the sidebar of a [`<List>`](./List.md) view.

## Usage

`<FilterLiveSearch>` bundles a [`<FilterLiveForm>`](./FilterLiveForm.md) and a [`<SearchInput>`](./SearchInput.md). It binds the value of a text field to the surrounding list filters (defaulting to the `q` source) and triggers a search on change.

```tsx
import { Card } from "@/components/ui/card";
import { FilterLiveSearch, List, DataTable } from "@/components/admin";

const FilterSidebar = () => (
  <Card className="p-4">
    <FilterLiveSearch />
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

You can override the filter source and placeholder for use cases other than full-text search:

```tsx
<FilterLiveSearch source="title" placeholder="Search by title" />
```

## Props

`<FilterLiveSearch>` accepts the same props as [`<SearchInput>`](./SearchInput.md), and additionally:

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `source` | Optional | `string` | `q` | Name of the filter field bound to the input |
| `placeholder` | Optional | `string` | "Search" | Placeholder text |
| `className` | Optional | `string` | - | Extra Tailwind classes appended to the wrapping input |
