---
title: "Supabase Integration"
---

Shadmin ships an opt-in set of components for projects backed by [Supabase](https://supabase.com/). With a Supabase URL and API key you get a fully wired admin — data provider, auth provider, social-auth login, and auto-generated CRUD views — in a single line of JSX.

## Installation

Install the required peer dependencies:

```bash
pnpm add @supabase/supabase-js ra-supabase-core openapi-types
```

## Quick start

```tsx
import { AdminGuesser } from "@/components/supabase";

export const App = () => (
  <AdminGuesser
    instanceUrl={import.meta.env.VITE_SUPABASE_URL}
    apiKey={import.meta.env.VITE_SUPABASE_KEY}
  />
);
```

The `apiKey` accepts both the legacy anonymous JWT and the new publishable key format (`sb_publishable_*`).

## What you get

- `<AdminGuesser>` — wraps `<Admin>` with Supabase defaults
- `<SupabaseLoginPage>` — email/password + optional social providers
- `<ForgotPasswordPage>` / `<SetPasswordPage>` — full password-reset flow
- Schema-aware `<SupabaseListGuesser>` / `<ShowGuesser>` / `<EditGuesser>` / `<CreateGuesser>` that infer references from foreign keys
- 16 social auth provider buttons (Apple, Azure, Bitbucket, Discord, Facebook, GitHub, GitLab, Google, Keycloak, LinkedIn, Notion, Slack, Spotify, Twitch, Twitter, WorkOS)
- English + French translations via `defaultSupabaseI18nProvider`
