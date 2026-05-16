---
title: "DashboardMenuItem"
---

Sidebar entry linking to the dashboard (`/`). Uses the default house icon and the translated label `ra.page.dashboard`.

## Usage

The default [`<Menu>`](./menu) renders `<DashboardMenuItem>` automatically when an `<Admin dashboard>` is configured.

```tsx
import { Admin, Resource } from "react-admin";

const App = () => (
  <Admin dashboard={MyDashboard} dataProvider={dataProvider}>
    <Resource name="posts" list={PostList} />
  </Admin>
);
```

To render the dashboard entry in a custom menu, drop it in directly:

```tsx
import { DashboardMenuItem, Menu } from "@/components/admin";

const CustomMenu = () => (
  <Menu>
    <DashboardMenuItem />
    {/* other items */}
  </Menu>
);
```

## Props

| Prop        | Required | Type         | Default | Description                                                                      |
| ----------- | -------- | ------------ | ------- | -------------------------------------------------------------------------------- |
| `className` | Optional | `string`     | —       | Extra Tailwind classes appended to the underlying menu button                    |
| `onClick`   | Optional | `() => void` | —       | Invoked after navigation; the default sidebar uses it to close the mobile drawer |
