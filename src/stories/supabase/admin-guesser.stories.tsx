import { AdminGuesser } from "@/components/supabase/admin-guesser";

export default { title: "Supabase/AdminGuesser" };

/**
 * NOTE: This story will only render fully against a real Supabase
 * project. For local development you can point it at a Supabase
 * Local Dev instance with `make supabase-start`.
 */
export const Default = () => (
  <AdminGuesser
    instanceUrl="http://localhost:54321"
    apiKey="sb_publishable_local"
  />
);
