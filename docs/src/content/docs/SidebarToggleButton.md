---
title: "SidebarToggleButton"
---

A standalone button that opens or closes the main sidebar.

## Usage

The default [`<Layout>`](./Layout.md) already includes a sidebar toggle in its header. `<SidebarToggleButton>` is meant for custom layouts where you need to place the toggle outside of that header slot:

```tsx
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarToggleButton } from "@/components/admin";

const CustomLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <aside>
      <SidebarToggleButton />
    </aside>
    <main>{children}</main>
  </SidebarProvider>
);
```

It is a thin wrapper around the shadcn/ui `<SidebarTrigger>` and therefore requires being rendered inside a `<SidebarProvider>`.

## Props

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `className` | Optional | `string` | `scale-125 sm:scale-100` | Extra Tailwind classes appended to the trigger |
