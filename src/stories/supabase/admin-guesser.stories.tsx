import { AdminGuesser } from "@/components/supabase/admin-guesser";

export default { title: "Supabase/AdminGuesser" };

/**
 * NOTE: AdminGuesser introspects a Supabase project's schema at runtime and
 * generates Resource declarations for each table. Stories below render against
 * a local Supabase Dev instance — start one with `make supabase-start` before
 * opening these stories.
 *
 * On a fresh project the guesser only finds the `auth` schema tables, so the
 * `Basic` story will render with no Resources visible until you create your
 * own tables.
 */
export const Basic = () => (
  <AdminGuesser
    instanceUrl="http://localhost:54321"
    apiKey="sb_publishable_local"
  />
);

/**
 * Same as Basic but points at a deployed Supabase project. Replace the URL
 * and key with values from your project's "Connection details" page.
 */
export const RemoteProject = () => (
  <AdminGuesser
    instanceUrl="https://your-project-ref.supabase.co"
    apiKey="your-publishable-key"
  />
);

/**
 * AdminGuesser accepts the same `loginPage` prop as `Admin` to override the
 * default Supabase login screen.
 */
export const CustomLoginPage = () => (
  <AdminGuesser
    instanceUrl="http://localhost:54321"
    apiKey="sb_publishable_local"
    loginPage={() => <div>Custom login screen</div>}
  />
);
