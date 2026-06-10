---
title: "Menu"
---

Sidebar menu container. By default renders a dashboard link (if defined) followed by grouped resource sections and then ungrouped resources.

## Usage

`<Menu>` is included in the default [`<AppSidebar>`](./app-sidebar). Pass children to replace the auto-generated entries:

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

- `<Menu.DashboardItem>` — alias for [`<DashboardMenuItem>`](./dashboard-menu-item)
- `<Menu.ResourceItem>` — alias for [`<ResourceMenuItem>`](./resource-menu-item)
- `<Menu.ResourceGroup>` — alias for [`<ResourceMenuItemGroup>`](./resource-menu-item-group)
- `<Menu.Item>` — alias for [`<MenuItemLink>`](./menu-item-link)

## Props

| Prop        | Required | Type        | Default             | Description                                                               |
| ----------- | -------- | ----------- | ------------------- | ------------------------------------------------------------------------- |
| `children`  | Optional | `ReactNode` | Auto from resources | Replace the default resource list                                         |
| `className` | Optional | `string`    | —                   | Extra Tailwind classes appended to the generated `<SidebarMenu>` elements |

## `children`

When children are provided, `<Menu>` renders them as-is and skips the dashboard / resource auto-detection. Use `<Menu.DashboardItem>` and `<Menu.ResourceItem>` to bring those entries back explicitly.

## Resource Groups

Resources are grouped by the optional [`group` prop on `<Resource>`](./resource.md#group). Generated labeled groups are collapsible and open by default:

```tsx
import { Admin, Menu, Resource } from "@/components/admin";

<Admin dataProvider={dataProvider}>
  <Resource name="posts" group="Content" list={PostList} />
  <Resource name="comments" group="Content" list={CommentList} />
  <Resource name="orders" group="Store" list={OrderList} />
  <Resource name="customers" list={CustomerList} />
</Admin>;
```

Before `group`, the default menu rendered `Posts`, `Comments`, `Orders`, and `Customers` as one flat list. After adding `group`, it renders `Posts` and `Comments` under a collapsible `Content` group, `Orders` under a collapsible `Store` group, and `Customers` last without a group label.
