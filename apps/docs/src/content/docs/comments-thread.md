---
title: "CommentsThread"
---

Record-attached threaded discussion. Reads a `comments` sub-resource via
`useGetList`, filtered by the parent record's id. Renders one card per
comment plus a new-comment textarea.

## Usage

```tsx
import { CommentsThread, Show } from "@/components/admin";

const PostShow = () => (
  <Show>
    <CommentsThread reference="comments" target="parentId" resolvable />
  </Show>
);
```

## Comment record shape

```ts
interface Comment {
  id: string | number;
  parentId: string | number;
  authorId: string;
  authorName?: string;
  body: string;
  createdAt: string; // ISO timestamp
  resolvedAt?: string | null;
}
```

## Props

| Prop         | Required | Type      | Default | Description                             |
| ------------ | -------- | --------- | ------- | --------------------------------------- |
| `reference`  | Required | `string`  | -       | Comments sub-resource name              |
| `target`     | Required | `string`  | -       | Field on comment that holds parent id   |
| `resolvable` | Optional | `boolean` | `false` | Show "Mark resolved" button per comment |

## Required parent context

`<CommentsThread>` must be rendered inside a `<RecordContextProvider>` (e.g. inside `<Show>` or `<Edit>`).
