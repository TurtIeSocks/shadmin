---
title: "Menu"
---

Sidebar menu container. By default renders a dashboard link (if defined) followed by one link per registered resource with a list view.

## Usage

`<Menu>` is included in the default [`<AppSidebar>`](./AppSidebar.md). Pass children to replace the auto-generated entries:

```tsx
import { Settings, Book } from "lucide-react";
import { Menu } from "@/components/admin";

const Sidebar = () => (
  <Menu>
    <Menu.DashboardItem />
    <Menu.ResourceItem name="posts" />
    <Menu.Item to="/settings" primaryText="Settings" leftIcon={<Settings />} />
    <Menu.Item to="/books" primaryText="Books" leftIcon={<Book />} />
  </Menu>
);
```

The three sub-components mirror the upstream react-admin API:

- `<Menu.DashboardItem>` — alias for [`<DashboardMenuItem>`](./DashboardMenuItem.md)
- `<Menu.ResourceItem>` — alias for [`<ResourceMenuItem>`](./ResourceMenuItem.md)
- `<Menu.Item>` — alias for [`<MenuItemLink>`](./MenuItemLink.md)

## Props

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `children` | Optional | `ReactNode` | Auto from resources | Replace the default resource list |
| `className` | Optional | `string` | — | Extra Tailwind classes appended to the wrapping `<SidebarMenu>` |

## `children`

When children are provided, `<Menu>` renders them as-is and skips the dashboard / resource auto-detection. Use `<Menu.DashboardItem>` and `<Menu.ResourceItem>` to bring those entries back explicitly.
