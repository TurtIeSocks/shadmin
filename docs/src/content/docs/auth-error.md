---
title: "AuthError"
---

Error screen displayed when authentication fails — typically used as the fallback shown by [`<AuthCallback>`](./auth-callback) when an OAuth flow returns an error, or as a manual "you are not signed in" page. Renders a heading, the error message and a button linking back to `/login`.

For full-page session-expired screens (used by the `<Admin>`'s `authenticationError` slot) see [`<AuthenticationError>`](./authentication-error).

## Usage

```tsx
import { AuthError } from "@/components/admin/auth-error";

const Unauthorized = () => (
  <AuthError message="Your session has expired. Please sign in again." />
);
```

`<AuthError>` is also rendered automatically by the default [`<AuthCallback>`](./auth-callback) when `authProvider.handleCallback()` rejects.

You can pass it as the `authenticationError` slot of [`<Admin>`](./admin) so it is displayed whenever an authenticated route throws an authentication error:

```tsx
import { Admin } from "@/components/admin";
import { AuthError } from "@/components/admin/auth-error";

const App = () => (
  <Admin authProvider={authProvider} authenticationError={AuthError}>
    ...
  </Admin>
);
```

## Props

| Prop        | Required | Type     | Default                 | Description                                      |
| ----------- | -------- | -------- | ----------------------- | ------------------------------------------------ |
| `className` | Optional | `string` | -                       | Extra CSS class applied to the wrapping element. |
| `title`     | Optional | `string` | `ra.page.error`         | i18n key or text used for the heading.           |
| `message`   | Optional | `string` | `ra.message.auth_error` | i18n key or text used for the message body.      |

### `title`

Override the heading shown above the error message. Accepts either an i18n key (resolved through `useTranslate()`) or a raw string.

```tsx
<AuthError title="Authentication failed" />
```

### `message`

Override the body text. Accepts either an i18n key or a raw string — `useTranslate()` is called with a fallback so the value is displayed as-is when no matching translation exists.

```tsx
<AuthError message="The login link is no longer valid." />
```

### `className`

Add extra Tailwind class names to the root wrapper.

```tsx
<AuthError className="bg-muted/50" />
```
