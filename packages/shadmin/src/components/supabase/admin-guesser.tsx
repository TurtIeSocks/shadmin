import { useMemo } from "react";
import {
  CustomRoutes,
  Resource,
  type AdminChildren,
  type CoreAdminProps,
} from "shadmin-core";
import { Route } from "react-router";
import { createClient } from "@supabase/supabase-js";
import { supabaseAuthProvider, supabaseDataProvider } from "ra-supabase-core";
import { Admin } from "@/components/admin/admin";
import { defaultSupabaseI18nProvider } from "./i18n";
import { useCrudGuesser } from "./use-crud-guesser";
import { SupabaseLoginPage } from "./login-page";
import { ForgotPasswordPage } from "./forgot-password-page";
import { SetPasswordPage } from "./set-password-page";

type AdminGuesserProps = CoreAdminProps & {
  instanceUrl: string;
  /**
   * Supabase API key. Accepts both the legacy anonymous JWT key
   * and the newer publishable key (`sb_publishable_*`).
   */
  apiKey: string;
};

/**
 * One-line entry point for building an admin against a Supabase
 * project: drop in your `instanceUrl` and `apiKey` and the
 * component wires the data provider, auth provider, default login
 * page, password-reset routes, and auto-generated Resource list
 * via the OpenAPI schema.
 *
 * Override any individual piece by passing the matching prop
 * (`dataProvider`, `authProvider`, `i18nProvider`, `loginPage`,
 * `children` for explicit `<Resource>` entries, …).
 */
function AdminGuesser(props: AdminGuesserProps) {
  const {
    instanceUrl,
    apiKey,
    dataProvider,
    authProvider,
    i18nProvider,
    loginPage,
    children,
    ...rest
  } = props;

  const supabaseClient = useMemo(
    () => createClient(instanceUrl, apiKey),
    [instanceUrl, apiKey],
  );

  const defaultDataProvider = useMemo(
    () =>
      supabaseDataProvider({
        instanceUrl,
        apiKey,
        supabaseClient,
      }),
    [instanceUrl, apiKey, supabaseClient],
  );

  const defaultAuthProvider = useMemo(
    () => supabaseAuthProvider(supabaseClient, {}),
    [supabaseClient],
  );

  return (
    <Admin
      dataProvider={dataProvider ?? defaultDataProvider}
      authProvider={authProvider ?? defaultAuthProvider}
      i18nProvider={i18nProvider ?? defaultSupabaseI18nProvider}
      loginPage={loginPage ?? SupabaseLoginPage}
      {...rest}
    >
      <AdminGuesserResources>{children}</AdminGuesserResources>
      <CustomRoutes noLayout>
        <Route
          path={ForgotPasswordPage.path}
          element={<ForgotPasswordPage />}
        />
        <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
      </CustomRoutes>
    </Admin>
  );
}

const AdminGuesserResources = ({ children }: { children?: AdminChildren }) => {
  const inferred = useCrudGuesser();
  if (children) return <>{children}</>;
  return (
    <>
      {inferred.map((def) => (
        <Resource key={def.name} {...def} />
      ))}
    </>
  );
};

export { type AdminGuesserProps, AdminGuesser };
