---
title: "TitlePortal"
---

Render target for [`<Title>`](./Title.md). Reserves the DOM slot in the app bar where page titles are teleported.

The default [`<Layout>`](./Layout.md) includes a `<TitlePortal>` inside [`<AppBar>`](./AppBar.md). Re-use it when composing a custom header.

## Usage

```tsx
import { TitlePortal } from "@/components/admin";

const CustomHeader = () => (
  <header className="flex h-12 items-center px-4">
    <TitlePortal />
  </header>
);
```

Pair it with [`<Title>`](./Title.md) (rendered anywhere in the page tree) to populate the slot:

```tsx
import { Title } from "@/components/admin";

const Dashboard = () => (
  <>
    <Title title="Dashboard" />
    <div>Welcome!</div>
  </>
);
```

## Props

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `className` | Optional | `string` | `flex items-center min-w-0` | Extra Tailwind classes appended to the portal target |

Additional props are forwarded to the underlying `<div>` element.

The portal target uses a stable DOM id (`ra-title-portal`) that `<Title>` reads via `createPortal`. Do not render more than one `<TitlePortal>` on the page.
