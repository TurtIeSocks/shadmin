---
title: "Offline"
---

`<Offline>` renders its children only while the user is offline. With no children, it renders a default banner at the top of the viewport informing the user that the connection has been lost.

It tracks `navigator.onLine` and listens for the `online` / `offline` events on `window`, so it reacts immediately when connectivity changes.

## Usage

Mount the component anywhere in your layout — it renders nothing while the user is online:

```tsx
import { Offline } from "@/components/admin/offline";

const App = () => (
  <>
    <Offline />
    <Routes />
  </>
);
```

To render custom content (for example, an inline note instead of the default top-of-page banner), pass children:

```tsx
<Offline>
  <p className="rounded-md bg-destructive/10 p-2 text-destructive">
    Working from cache — changes will sync once you reconnect.
  </p>
</Offline>
```

## Props

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `children` | Optional | `ReactNode` | default banner | Content rendered while offline. Falls back to a built-in banner when omitted. |
| `className` | Optional | `string` | - | Extra CSS class applied to the wrapping element. |

## `children`

If provided, this is what `<Offline>` renders when the user is offline. The wrapping `<div>` receives `className`. When omitted, a default red banner pinned to the top of the viewport is rendered instead with the translated message `ra.notification.offline`.

## `className`

Extra CSS classes merged with the default styles via `cn()`. Useful for tweaking the banner's appearance or to style the wrapper element when passing custom children.

```tsx
<Offline className="bg-amber-500 text-white" />
```
