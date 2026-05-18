---
title: "RefreshButton"
---

Forces a data refresh by invalidating react-query's query cache. All the data displayed in the current page (lists, show views, etc.) will be refreshed.

It also displays a loading indicator while the data fetching is in progress.

![Refresh Button](./images/refresh-button.jpg)

## Usage

The default [`Layout`](./layout) contains a `<RefreshButton>` in the top right corner.

You can use it for your custom layouts:

```tsx
import { RefreshButton } from "@/components/admin";

<RefreshButton />;
```

## Props

| Prop      | Required | Type                     | Default             | Description                         |
| --------- | -------- | ------------------------ | ------------------- | ----------------------------------- |
| `icon`    | Optional | `ReactNode`              | RotateCw icon       | Custom icon element                 |
| `label`   | Optional | `ReactNode`              | `ra.action.refresh` | aria-label override                 |
| `onClick` | Optional | `() => void`             | -                   | Additional click handler            |
| `ref`     | Optional | `Ref<HTMLButtonElement>` | -                   | Forwarded to the underlying `<Button>` |

## `icon`

Replaces the default `<RotateCw />` shown in the button. Pass any lucide-react icon to convey a different action.

```tsx
import { RefreshCcw } from "lucide-react";
import { RefreshButton } from "@/components/admin";

<RefreshButton icon={<RefreshCcw />} />
```
