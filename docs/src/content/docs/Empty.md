---
title: "Empty"
---

Default empty state rendered by [`<List>`](./List.md) when the data provider returns zero records and there are no active filters.

## Usage

`<List>` automatically renders `<Empty>` when the underlying query returns no records. You can also use it as a custom `empty` prop:

```tsx
import { List, Empty } from "@/components/admin";

export const PostList = () => <List empty={<Empty />}>{/* ... */}</List>;
```

`<Empty>` introspects the current resource via `useResourceContext()` and `useResourceDefinition()`. When the resource defines a `create` route, an invitation message and a [`<CreateButton>`](./CreateButton.md) are displayed.

## Props

| Prop        | Required | Type      | Default                  | Description                                         |
| ----------- | -------- | --------- | ------------------------ | --------------------------------------------------- |
| `resource`  | Optional | `string`  | From context             | Override the resource name                          |
| `hasCreate` | Optional | `boolean` | From resource definition | Force showing/hiding the create call-to-action      |
| `className` | Optional | `string`  | —                        | Extra Tailwind classes appended to the root element |

## `resource`

`<Empty>` uses the current resource from `useResourceContext()`. Pass `resource` explicitly to override the value, for example when rendering outside a `<List>`:

```tsx
<Empty resource="posts" />
```

## `hasCreate`

By default, the call-to-action is shown when the resource has a `create` route. Pass `hasCreate={false}` to hide it, or `hasCreate` to force-show it even when the resource definition omits a create route.

## Translation Messages

`<Empty>` uses the following translation keys:

- `ra.page.empty` (interpolated with `name`)
- `ra.page.invite`
- `resources.{resource}.empty` (per-resource override)
- `resources.{resource}.invite` (per-resource override)

```js
const messages = {
  resources: {
    posts: {
      empty: "Your post list is empty.",
      invite: "Why not write your first post?",
    },
  },
};
```
