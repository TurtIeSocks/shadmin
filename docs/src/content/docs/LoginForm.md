---
title: "LoginForm"
---

Email + password form used inside [`<LoginPage>`](./LoginPage.md). Calls `authProvider.login()` via the [`useLogin`](https://marmelab.com/ra-core/uselogin/) hook and surfaces errors through [`useNotify`](https://marmelab.com/ra-core/usenotify/). Returns just the form — no surrounding card or layout — so it can be embedded inside any auth shell.

## Usage

Compose it with [`<AuthLayout>`](./AuthLayout.md) to build a custom login page:

```tsx
import { AuthLayout } from "@/components/admin/auth-layout";
import { LoginForm } from "@/components/admin/login-form";

export const LoginPage = () => (
  <AuthLayout title="Sign in">
    <LoginForm />
  </AuthLayout>
);
```

`<LoginForm>` is also the form rendered by the default [`<LoginPage>`](./LoginPage.md) — so customizing the surrounding layout is often as simple as wrapping it differently.

## Props

| Prop         | Required | Type     | Default | Description                                                                                              |
| ------------ | -------- | -------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `redirectTo` | Optional | `string` | -       | Path the user is redirected to after a successful sign in. Defaults to ra-core's default redirect (`/`). |
| `className`  | Optional | `string` | -       | Extra CSS class names applied to the `<Form>` element.                                                   |

### `redirectTo`

Where the user lands after a successful sign in. Forwarded to [`useLogin`](https://marmelab.com/ra-core/uselogin/).

```tsx
<LoginForm redirectTo="/dashboard" />
```

### `className`

Add extra Tailwind class names to the form element.

```tsx
<LoginForm className="max-w-sm mx-auto" />
```
