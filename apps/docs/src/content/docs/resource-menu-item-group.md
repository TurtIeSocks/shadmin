---
title: "ResourceMenuItemGroup"
---

Sidebar section that renders related [`<ResourceMenuItem>`](./resource-menu-item) entries in a shadcn/ui sidebar group. Labeled groups are collapsible.

## Usage

`<ResourceMenuItemGroup>` is used by [`<Menu>`](./menu) when resources define a [`group`](./resource.md#group). You can also use it directly in a custom sidebar:

```tsx
import { ResourceMenuItemGroup } from "@/components/admin";

const CustomMenu = () => (
  <ResourceMenuItemGroup label="Content" resources={["posts", "comments"]} />
);
```

Omit `label` for an unlabeled group:

```tsx
<ResourceMenuItemGroup resources={["customers"]} />
```

## Props

| Prop            | Required | Type       | Default | Description                                                    |
| --------------- | -------- | ---------- | ------- | -------------------------------------------------------------- |
| `resources`     | Required | `string[]` | —       | Resource names registered via `<Resource name="…">`            |
| `label`         | Optional | `string`   | —       | Sidebar group label                                            |
| `className`     | Optional | `string`   | —       | Extra Tailwind classes appended to the wrapping sidebar group  |
| `menuClassName` | Optional | `string`   | —       | Extra Tailwind classes appended to the underlying sidebar menu |
| `defaultOpen`   | Optional | `boolean`  | `true`  | Initial open state for labeled groups                          |
