---
title: "AccessDenied"
---

Full-page error screen displayed when the current user does not have permission to access a resource. Renders a centered lock icon, a primary heading, and a secondary message.

## Usage

```tsx
import { AccessDenied } from "@/components/admin/access-denied";

const Forbidden = () => <AccessDenied />;
```

You can customize all texts and the icon:

```tsx
import { ShieldOff } from "lucide-react";
import { AccessDenied } from "@/components/admin/access-denied";

const CustomForbidden = () => (
  <AccessDenied
    icon={<ShieldOff className="w-32 h-32" />}
    textPrimary="Not allowed"
    textSecondary="You do not have access to this resource."
  />
);
```

The text props accept either i18n keys or raw strings — `useTranslate()` is called with a fallback that displays the value as-is when no matching translation exists.

## Props

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `className` | Optional | `string` | - | Extra CSS class applied to the wrapping element. |
| `icon` | Optional | `ReactNode` | `<Lock />` | Icon shown above the message. |
| `textPrimary` | Optional | `string` | `ra.page.access_denied` | i18n key or text for the heading. |
| `textSecondary` | Optional | `string` | `ra.message.access_denied` | i18n key or text for the body. |
