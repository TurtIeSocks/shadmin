---
title: "MenuItemLink"
---

A clickable sidebar entry that navigates to a route. Building block for custom sidebar menus.

## Usage

```tsx
import { Settings } from "lucide-react";
import { MenuItemLink } from "@/components/admin";

const SettingsItem = () => (
  <MenuItemLink to="/settings" primaryText="Settings" leftIcon={<Settings />} />
);
```

`<MenuItemLink>` renders a [`<SidebarMenuItem>`](https://ui.shadcn.com/docs/components/sidebar) with an icon and a label. The active state is computed from the current route via `useMatch`, so the item is highlighted while the user is on the linked page.

On mobile, the component automatically closes the sidebar drawer after navigation.

## Props

| Prop          | Required | Type         | Default | Description                                                        |
| ------------- | -------- | ------------ | ------- | ------------------------------------------------------------------ |
| `to`          | Required | `string`     | —       | Target path passed to react-router                                 |
| `primaryText` | Required | `ReactNode`  | —       | Label rendered next to `leftIcon`. Strings are not auto-translated |
| `leftIcon`    | Optional | `ReactNode`  | —       | Icon rendered before the label                                     |
| `className`   | Optional | `string`     | —       | Extra Tailwind classes appended to the menu button                 |
| `onClick`     | Optional | `() => void` | —       | Invoked after the default navigation                               |

## `primaryText`

The label is rendered as-is. Pass a `<Translate>` element (or call `useTranslate()` yourself) to localize it:

```tsx
import { Translate } from "ra-core";
import { Settings } from "lucide-react";

<MenuItemLink
  to="/settings"
  primaryText={<Translate i18nKey="app.menu.settings">Settings</Translate>}
  leftIcon={<Settings />}
/>;
```
