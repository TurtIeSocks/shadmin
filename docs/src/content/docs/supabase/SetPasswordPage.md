---
title: "SetPasswordPage"
---

Standalone page for finishing the Supabase password-set / first-login flow. Reads `access_token` and `refresh_token` from the URL hash (populated by the link in the Supabase invite/reset email).

## Usage

```tsx
import { CustomRoutes } from "ra-core";
import { Route } from "react-router";
import { Admin } from "@/components/admin";
import { SetPasswordPage } from "@/components/supabase";

const App = () => (
  <Admin authProvider={authProvider}>
    <CustomRoutes noLayout>
      <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
    </CustomRoutes>
  </Admin>
);
```

## Props

| Prop        | Type        | Description                      |
| ----------- | ----------- | -------------------------------- |
| `children`  | `ReactNode` | Replace the inner form           |
| `marketing` | `ReactNode` | Replace the left marketing panel |
