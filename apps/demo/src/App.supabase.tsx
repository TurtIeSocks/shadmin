/**
 * Reference implementation: building an admin against a Supabase backend.
 *
 * This file is a documentation-grade stub — it imports and composes the four
 * Supabase-specific public components (`AdminGuesser`, `ForgotPasswordPage`,
 * `SetPasswordPage`, `SocialAuthButton`) so they show up in `src/demo/`
 * coverage audits and so contributors have a copy-pasteable starting point.
 *
 * Running this file against a real backend requires a Supabase project
 * (see `make supabase-start`) plus a `.env` with the project's URL + anon key.
 * It is intentionally NOT wired into `main.tsx` — the main demo runs against
 * the fake REST data provider and would crash if Supabase auth tried to
 * resolve a session against `<missing-instance-url>`.
 *
 * To try it locally:
 *   1. `make supabase-start` (boots a local Supabase via the Docker CLI)
 *   2. Copy the project URL + anon key into env vars / inline below
 *   3. Swap the `<App />` import in `src/demo/main.tsx` for `<SupabaseApp />`
 */
import { CustomRoutes } from "ra-core";
import { Route } from "react-router";
import {
  AdminGuesser,
  ForgotPasswordPage,
  SetPasswordPage,
  SocialAuthButton,
} from "shadmin/components/supabase";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://<your-project>.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? "<your-anon-key>";

/**
 * Custom aside slot for the auth pages — illustrates how to embed
 * `<SocialAuthButton>` into the auth layout so contributors can opt
 * into one-click OAuth alongside the email/password flow.
 */
const AuthAside = () => (
  <div className="flex flex-col gap-2 p-4">
    <SocialAuthButton provider="github">Continue with GitHub</SocialAuthButton>
    <SocialAuthButton provider="google">Continue with Google</SocialAuthButton>
  </div>
);

export const SupabaseApp = () => (
  <AdminGuesser instanceUrl={SUPABASE_URL} apiKey={SUPABASE_ANON_KEY}>
    <CustomRoutes noLayout>
      <Route
        path={ForgotPasswordPage.path}
        element={<ForgotPasswordPage aside={<AuthAside />} />}
      />
      <Route
        path={SetPasswordPage.path}
        element={<SetPasswordPage aside={<AuthAside />} />}
      />
    </CustomRoutes>
  </AdminGuesser>
);

export default SupabaseApp;
