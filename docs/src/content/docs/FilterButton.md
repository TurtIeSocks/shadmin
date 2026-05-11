---
title: "FilterButton"
---

Dropdown that lets users add, remove, and manage the filters displayed in the top [`<FilterForm>`](./List.md#filter-button--form-combo) of a [`<List>`](./List.md) view.

## Usage

`<FilterButton>` is rendered by default by `<List>` whenever you pass it a `filters` prop, but you can render it manually inside a custom `actions` toolbar:

```tsx
import {
  Admin,
  DataTable,
  FilterButton,
  List,
  Resource,
  SearchInput,
  SelectInput,
  TextInput,
} from "@/components/admin";

const postFilters = [
  <SearchInput key="q" source="q" alwaysOn />,
  <TextInput key="title" source="title" />,
  <SelectInput
    key="status"
    source="status"
    choices={[
      { id: "published", name: "Published" },
      { id: "draft", name: "Draft" },
    ]}
  />,
];

const PostList = () => (
  <List filters={postFilters} actions={<FilterButton />}>
    <DataTable>
      <DataTable.Col source="title" />
    </DataTable>
  </List>
);
```

The dropdown lists every filter input that is not marked `alwaysOn`. Selecting one of them shows the corresponding input in the `<FilterForm>` and focuses it; unselecting hides it.

`<FilterButton>` also exposes commands to manage [saved queries](https://marmelab.com/react-admin/SavedQueriesList.html):

- "Save current query…" when the user has applied some filters but never saved this exact query
- "Remove query \"…\"" when the current filters match an existing saved query
- "Remove all filters" when at least one filter is active

## Props

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `filters` | Optional | `ReactNode[]` | from context | List of filter input elements |
| `disableSaveQuery` | Optional | `boolean` | `false` | Hide the "Save current query" and "Remove query" menu items |
| `resource` | Optional | `string` | from context | Override the resource used for saved queries |
| `variant` | Optional | `string` | `outline` | Button variant: `default`, `outline`, `ghost`, etc. |
| `size` | Optional | `string` | `default` | Button size: `default`, `sm`, `lg`, `icon` |
| `className` | Optional | `string` | - | Extra Tailwind classes appended to the wrapper element |

## `filters`

Most of the time, `<FilterButton>` reads the filter list from the surrounding [`<FilterContext>`](https://marmelab.com/react-admin/useFilterContext.html), which is populated by [`<List filters>`](./List.md#filter-button--form-combo). You can pass an explicit `filters` array when rendering `<FilterButton>` outside that context.

## `disableSaveQuery`

Set this prop to `true` to hide the saved-query options from the dropdown:

```tsx
<FilterButton disableSaveQuery />
```
