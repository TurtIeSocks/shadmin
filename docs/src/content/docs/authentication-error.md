---
title: "AuthenticationError"
---

Full-page error screen displayed when authentication fails — typically because the user's session has expired or their credentials are no longer valid. Mirrors [`<AccessDenied>`](./access-denied) but uses a warning triangle icon and different default texts.

## Usage

```tsx
import { AuthenticationError } from "@/components/admin/authentication-error";

const Unauthorized = () => <AuthenticationError />;
```

You can customize the texts and icon:

```tsx
import { LogOut } from "lucide-react";
import { AuthenticationError } from "@/components/admin/authentication-error";

const SessionExpired = () => (
  <AuthenticationError
    icon={<LogOut className="w-32 h-32" />}
    textPrimary="Session expired"
    textSecondary="Please sign in again to continue."
  />
);
```

The text props accept either i18n keys or raw strings — `useTranslate()` is called with a fallback that displays the value as-is when no matching translation exists.

## Props

| Prop            | Required | Type        | Default                           | Description                                      |
| --------------- | -------- | ----------- | --------------------------------- | ------------------------------------------------ |
| `className`     | Optional | `string`    | -                                 | Extra CSS class applied to the wrapping element. |
| `icon`          | Optional | `ReactNode` | `<TriangleAlert />`               | Icon shown above the message.                    |
| `textPrimary`   | Optional | `string`    | `ra.page.authentication_error`    | i18n key or text for the heading.                |
| `textSecondary` | Optional | `string`    | `ra.message.authentication_error` | i18n key or text for the body.                   |
