---
title: "AdminGuesser"
---

`<AdminGuesser>` is the one-line entry point for Supabase admins. It wraps the kit's `<Admin>` component with a Supabase data provider, auth provider, default login page, password-reset routes, and an auto-generated list of `<Resource>` elements derived from the Supabase OpenAPI schema.

## Usage

```tsx
import { AdminGuesser } from "@/components/supabase";

export const App = () => (
  <AdminGuesser
    instanceUrl="https://your-project.supabase.co"
    apiKey="sb_publishable_..."
  />
);
```

For an explicit Resource list, pass `<Resource>` children:

```tsx
import { Resource } from "ra-core";
import { AdminGuesser, SupabaseListGuesser } from "@/components/supabase";
import { CompanyEdit } from "./CompanyEdit";

export const App = () => (
  <AdminGuesser instanceUrl={...} apiKey={...}>
    <Resource name="companies" list={SupabaseListGuesser} edit={CompanyEdit} />
    <Resource name="contacts" list={SupabaseListGuesser} />
  </AdminGuesser>
);
```

## Props

| Prop | Type | Description |
|---|---|---|
| `instanceUrl` | `string` | **Required.** Your Supabase project URL |
| `apiKey` | `string` | **Required.** Anon JWT or publishable key |
| `dataProvider` | `DataProvider` | Override the default `supabaseDataProvider` |
| `authProvider` | `AuthProvider` | Override the default `supabaseAuthProvider` |
| `i18nProvider` | `I18nProvider` | Override the default English+Supabase polyglot provider |
| `loginPage` | `ComponentType` | Override the default `<SupabaseLoginPage>` |
| `children` | `ReactNode` | Explicit `<Resource>` elements (suppresses auto-detection) |

All other props from `<Admin>` are also accepted.
