---
title: "SimpleListLoading"
---

Skeleton placeholder displayed by [`<SimpleList>`](./SimpleList.md) while data is loading.

## Usage

`<SimpleList>` already renders `<SimpleListLoading>` for you while data is loading. You can render it directly when composing your own list-like UI:

```tsx
import { SimpleListLoading } from "@/components/admin";

const Loading = () => (
  <SimpleListLoading hasLeftAvatarOrIcon hasSecondaryText nbFakeLines={8} />
);
```

The skeleton mirrors the layout of `<SimpleList>` so the page does not jump when the data arrives. Pass the same `has…` flags you'd pass to `<SimpleList>` (i.e. `hasLeftAvatarOrIcon` if you set `leftAvatar`/`leftIcon`, etc.) so the placeholder matches the final layout.

## Props

| Prop                   | Required | Type      | Default | Description                                        |
| ---------------------- | -------- | --------- | ------- | -------------------------------------------------- |
| `nbFakeLines`          | Optional | `number`  | `5`     | Number of skeleton rows to render                  |
| `hasLeftAvatarOrIcon`  | Optional | `boolean` | `false` | Reserve a slot for a left avatar or icon           |
| `hasRightAvatarOrIcon` | Optional | `boolean` | `false` | Reserve a slot for a right avatar or icon          |
| `hasSecondaryText`     | Optional | `boolean` | `false` | Render a secondary text placeholder                |
| `hasTertiaryText`      | Optional | `boolean` | `false` | Render a tertiary text placeholder                 |
| `className`            | Optional | `string`  | -       | Extra Tailwind classes appended to the root `<ul>` |
