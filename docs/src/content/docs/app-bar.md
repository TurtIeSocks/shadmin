---
title: "AppBar"
---

Header bar rendered at the top of the admin layout. Hosts the sidebar trigger, the title/breadcrumb slot, the locales menu, the theme toggle, the refresh button, and the user menu.

## Usage

`<AppBar>` is included in the default [`<Layout>`](./layout). It can be re-used when building a custom layout, or replaced entirely by passing children.

```tsx
import { AppBar } from "@/components/admin";

const MyLayout = ({ children }) => (
  <div className="flex flex-col h-svh">
    <AppBar />
    <main className="flex-1 px-4">{children}</main>
  </div>
);
```

Pass children to override the default content. The children replace all of: sidebar trigger, breadcrumb portal, title portal, locales menu, theme toggle, refresh button, and user menu.

```tsx
import {
  AppBar,
  SidebarToggleButton,
  ThemeModeToggle,
  TitlePortal,
  UserMenu,
} from "@/components/admin";

const MinimalAppBar = () => (
  <AppBar>
    <SidebarToggleButton />
    <TitlePortal />
    <ThemeModeToggle />
    <UserMenu />
  </AppBar>
);
```

## Props

| Prop        | Required | Type        | Default         | Description                                               |
| ----------- | -------- | ----------- | --------------- | --------------------------------------------------------- |
| `children`  | Optional | `ReactNode` | Default toolbar | Replace the entire AppBar content                         |
| `className` | Optional | `string`    | —               | Extra Tailwind classes appended to the `<header>` element |

Additional props are forwarded to the underlying `<header>` element.

## `children`

When `children` are provided, they replace the entire toolbar — `<AppBar>` only contributes the `<header>` wrapper with its default flex layout. Compose with [`<TitlePortal>`](./title-portal), [`<SidebarToggleButton>`](./sidebar-toggle-button), [`<UserMenu>`](./user-menu), and other building blocks to keep parity with the default behavior.
