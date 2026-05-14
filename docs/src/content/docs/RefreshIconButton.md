---
title: "RefreshIconButton"
---

A compact icon-only button that refreshes the current view's data. Wraps the icon in a tooltip with the localized label.

## Usage

```tsx {5}
import { RefreshIconButton } from "@/components/admin";

const MyAppBar = () => (
  <header>
    <RefreshIconButton />
  </header>
);
```

On click, calls `useRefresh()` from `ra-core`, which invalidates the cache for all visible queries and triggers a re-fetch.

For a full text button, use [`<RefreshButton>`](./RefreshButton.md) instead.

## Props

| Prop        | Required | Type                                         | Default             | Description              |
| ----------- | -------- | -------------------------------------------- | ------------------- | ------------------------ |
| `className` | Optional | `string`                                     | -                   | Additional classes       |
| `icon`      | Optional | `ReactNode`                                  | RefreshCw icon      | Custom icon element      |
| `label`     | Optional | `string`                                     | `ra.action.refresh` | Tooltip and aria-label   |
| `onClick`   | Optional | `(e: MouseEvent<HTMLButtonElement>) => void` | -                   | Additional click handler |

## `label`

By default, the label is the translation of the `ra.action.refresh` key, which reads "Refresh". Pass a custom string or translation key to override:

```tsx
<RefreshIconButton label="Reload data" />
```
