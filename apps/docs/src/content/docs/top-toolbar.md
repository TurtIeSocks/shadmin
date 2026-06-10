---
title: "TopToolbar"
---

Container for action buttons positioned at the top right of a view. Convenience wrapper that lays out toolbar items horizontally with end alignment and a small gap.

## Usage

Use `<TopToolbar>` as the `actions` prop of a `<List>`, `<Show>`, `<Edit>`, or `<Create>` view to render custom action buttons in the top-right corner:

```tsx
import {
  CreateButton,
  ExportButton,
  List,
  TopToolbar,
} from "@/components/admin";

const PostListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export const PostList = () => (
  <List actions={<PostListActions />}>{/* ... */}</List>
);
```

For the conventional Filter + Create + Export combo, use [`<ListActions>`](./list-actions) instead — it composes the same buttons and reads the resource definition automatically.

## Props

| Prop        | Required | Type        | Default | Description                                             |
| ----------- | -------- | ----------- | ------- | ------------------------------------------------------- |
| `children`  | Required | `ReactNode` | —       | Action buttons rendered horizontally with end alignment |
| `className` | Optional | `string`    | —       | Extra Tailwind classes appended to the root element     |

Additional props are forwarded to the underlying `<div>` element.
