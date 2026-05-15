---
title: "LoadingIndicator"
---

Small inline spinner that appears whenever the data provider has a query or a mutation in flight.

## Usage

`<LoadingIndicator>` is meant to be dropped into headers, toolbars or any place where a discreet activity indicator helps. It renders `null` while the data provider is idle, so it can stay mounted permanently:

```tsx
import { LoadingIndicator } from "@/components/admin";

const AppBar = () => (
  <header className="flex items-center gap-2">
    <span>My App</span>
    <LoadingIndicator />
  </header>
);
```

Under the hood, it uses ra-core's `useLoading` hook which subscribes to the TanStack Query cache and re-renders only when the global loading state changes.

## Props

| Prop        | Required | Type     | Default | Description                                            |
| ----------- | -------- | -------- | ------- | ------------------------------------------------------ |
| `className` | Optional | `string` | —       | Extra Tailwind classes appended to the spinner element |

## `className`

Override the size and colour by passing Tailwind utilities:

```tsx
<LoadingIndicator className="size-6 text-primary" />
```
