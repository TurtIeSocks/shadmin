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

| Prop                             | Required | Type                             | Default                | Description                                                        |
| -------------------------------- | -------- | -------------------------------- | ---------------------- | ------------------------------------------------------------------ |
| `to`                             | Required | `string`                         | —                      | Target path passed to react-router                                 |
| `primaryText`                    | Required | `ReactNode`                      | —                      | Label rendered next to `leftIcon`. Strings are not auto-translated |
| `className`                      | Optional | `string`                         | —                      | Extra Tailwind classes appended to the menu button                 |
| `keyboardShortcut`               | Optional | `string`                         | —                      | Global keyboard shortcut that triggers navigation to `to`          |
| `keyboardShortcutRepresentation` | Optional | `ReactNode`                      | `<KeyboardShortcut />` | Display node rendered after the label for the shortcut             |
| `leftIcon`                       | Optional | `ReactNode`                      | —                      | Icon rendered before the label                                     |
| `onClick`                        | Optional | `() => void`                     | —                      | Invoked after the default navigation                               |
| `tooltipProps`                   | Optional | `Omit<TooltipProps, "children">` | —                      | Extra props forwarded to the wrapping `<Tooltip>`                  |

## `keyboardShortcut`

Pass a shortcut string such as `"mod+k"` or `"shift+/"`. When the user presses the combination anywhere on the page, the component navigates to `to`. `mod` normalizes to `metaKey` (⌘) on macOS and `ctrlKey` on Windows/Linux.

```tsx
import { Settings } from "lucide-react";
import { MenuItemLink } from "@/components/admin";

<MenuItemLink
  to="/settings"
  primaryText="Settings"
  leftIcon={<Settings />}
  keyboardShortcut="mod+,"
/>;
```

## `keyboardShortcutRepresentation`

Overrides the visual badge rendered after the label for a `keyboardShortcut`. By default `<KeyboardShortcut keyboardShortcut={keyboardShortcut} />` is used (which renders platform-aware modifier symbols). Pass a custom `ReactNode` to use a different visual — for instance a plain string like `"⌘,"`:

```tsx
import { Settings } from "lucide-react";
import { MenuItemLink } from "@/components/admin";

<MenuItemLink
  to="/settings"
  primaryText="Settings"
  leftIcon={<Settings />}
  keyboardShortcut="mod+,"
  keyboardShortcutRepresentation="⌘,"
/>;
```

## `tooltipProps`

Extra props forwarded to the `<Tooltip>` that wraps the menu item. In collapsed-sidebar mode the tooltip always shows; in expanded mode it only shows when `tooltipProps` is explicitly provided. Use this to customize tooltip side, delay, or content.

```tsx
import { Settings } from "lucide-react";
import { MenuItemLink } from "@/components/admin";

<MenuItemLink
  to="/settings"
  primaryText="Settings"
  leftIcon={<Settings />}
  tooltipProps={{ delayDuration: 0, side: "bottom" }}
/>;
```

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
