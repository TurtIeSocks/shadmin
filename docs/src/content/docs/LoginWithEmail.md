---
title: "LoginWithEmail"
---

Email-only login form, suitable for magic-link or passwordless flows. Mirrors [`<LoginForm>`](./LoginForm.md) but renders a single `email` field — no password — and uses a `Mail` icon on the submit button. By default it calls `authProvider.login()` via [`useLogin`](https://marmelab.com/ra-core/uselogin/); pass `onSubmit` to plug in your own passwordless flow.

## Usage

Combine `<LoginWithEmail>` with [`<AuthLayout>`](./AuthLayout.md) to build a passwordless login page:

```tsx
import { AuthLayout } from "@/components/admin/auth-layout";
import { LoginWithEmail } from "@/components/admin/login-with-email";

export const MagicLinkPage = () => (
  <AuthLayout
    title="Sign in"
    subtitle="Enter your email to receive a magic link"
  >
    <LoginWithEmail
      submitLabel="Send magic link"
      onSubmit={async ({ email }) => {
        await authProvider.sendMagicLink({ email });
      }}
    />
  </AuthLayout>
);
```

Without `onSubmit` the component falls back to the standard `useLogin()` flow — useful when your `authProvider.login()` accepts an `email`-only payload.

## Props

| Prop          | Required | Type                                                   | Default           | Description                                                                                                                      |
| ------------- | -------- | ------------------------------------------------------ | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `onSubmit`    | Optional | `(values: { email: string }) => Promise<void> \| void` | -                 | Custom submit handler. When provided, this overrides the default `useLogin()` call — useful for magic-link / passwordless flows. |
| `loading`     | Optional | `boolean`                                              | internal          | Force the submit button into the loading state. When omitted, the component manages its own loading state.                       |
| `redirectTo`  | Optional | `string`                                               | -                 | Path the user is redirected to after a successful sign in. Only used when `onSubmit` is omitted (default `useLogin()` flow).     |
| `submitLabel` | Optional | `string`                                               | `ra.auth.sign_in` | Label of the submit button.                                                                                                      |
| `className`   | Optional | `string`                                               | -                 | Extra CSS class names applied to the `<Form>` element.                                                                           |

### `onSubmit`

Override the default `useLogin()` flow. Receives the form values (`{ email }`) and is responsible for signing the user in or sending the magic link. Errors thrown inside `onSubmit` are surfaced through `useNotify()`.

```tsx
<LoginWithEmail
  onSubmit={async ({ email }) => {
    await authProvider.sendMagicLink({ email });
  }}
/>
```

### `loading`

Forces the submit button into the loading state. Useful when controlling the loading state from a parent component:

```tsx
const [loading, setLoading] = useState(false);

<LoginWithEmail
  loading={loading}
  onSubmit={async ({ email }) => {
    setLoading(true);
    try {
      await authProvider.sendMagicLink({ email });
    } finally {
      setLoading(false);
    }
  }}
/>;
```

### `redirectTo`

Path to redirect to after a successful sign in. Only relevant when `onSubmit` is omitted (default `useLogin()` flow).

### `submitLabel`

Label of the submit button. Defaults to the translated `ra.auth.sign_in` message.

```tsx
<LoginWithEmail submitLabel="Send magic link" />
```

### `className`

Add extra Tailwind class names to the form element.
