import {
  CoreAdminUI,
  type CoreAdminUIProps,
  CoreAdminContext,
  type CoreAdminContextProps,
  type CoreAdminProps,
  localStorageStore,
} from "ra-core";
import { i18nProvider as defaultI18nProvider } from "@/lib/i18n-provider";
import { Layout } from "@/components/admin/layout";
import { LoginPage } from "@/components/admin/login-page";
import { NotFound } from "@/components/admin/not-found";
import { Ready } from "@/components/admin/ready";
import { ThemeProvider } from "@/components/admin/theme-provider";
import type { AdminTheme } from "@/components/admin/theme-types";
import { AuthCallback } from "@/components/admin/auth-callback";
import { useEffect } from "react";

/**
 * Props accepted by the `<Admin>` component on top of ra-core's `CoreAdminProps`.
 *
 * The shadcn-admin-kit extension adds the `theme` / `lightTheme` / `darkTheme`
 * trio so a named {@link AdminTheme} palette can be selected at the root.
 */
export interface AdminProps extends CoreAdminProps {
  /**
   * Convenience alias for `lightTheme`. Use this when you only want to pass
   * one named theme — its `light` and `dark` variable maps cover both modes.
   */
  theme?: AdminTheme;
  /**
   * The theme applied in light mode.
   */
  lightTheme?: AdminTheme;
  /**
   * The theme applied in dark mode.
   *
   * Falls back to `lightTheme` (or `theme`) if omitted.
   */
  darkTheme?: AdminTheme;
}

const defaultStore = localStorageStore();

/**
 * Context provider for the Admin component.
 *
 * Wraps CoreAdminContext to provide core admin functionality including data provider,
 * auth provider, i18n provider, and store access to child components.
 *
 * @internal
 */
const AdminContext = (props: CoreAdminContextProps) => (
  <CoreAdminContext {...props} />
);

/**
 * UI component for the Admin application.
 *
 * Wraps CoreAdminUI with theme provider and handles telemetry reporting.
 * Provides the main layout, login page, ready page, and authentication callback.
 *
 * @internal
 */
const AdminUI = (
  props: CoreAdminUIProps & {
    theme?: AdminTheme;
    lightTheme?: AdminTheme;
    darkTheme?: AdminTheme;
  },
) => {
  const {
    disableTelemetry = false,
    theme,
    lightTheme,
    darkTheme,
    ...rest
  } = props;

  useEffect(() => {
    if (
      disableTelemetry ||
      process.env.NODE_ENV !== "production" ||
      typeof window === "undefined" ||
      typeof window.location === "undefined" ||
      typeof Image === "undefined"
    ) {
      return;
    }
    const img = new Image();
    img.src = `https://shadcn-admin-kit-telemetry.marmelab.com/shadcn-admin-kit-telemetry?domain=${window.location.hostname}`;
  }, [disableTelemetry]);

  return (
    <ThemeProvider theme={theme} lightTheme={lightTheme} darkTheme={darkTheme}>
      <CoreAdminUI
        layout={Layout}
        loginPage={LoginPage}
        ready={Ready}
        authCallbackPage={AuthCallback}
        disableTelemetry // Disable telemetry in CoreAdminUI to avoid double logging
        {...rest}
      />
    </ThemeProvider>
  );
};

/**
 * Root component of a shadcn-admin-kit application.
 *
 * Creates context providers to allow its children to access the app configuration.
 * Renders the main routes and layout, and delegates content area rendering to Resource children.
 * Combines AdminContext and AdminUI to provide a complete admin interface.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/admin/ Admin documentation}
 *
 * @example
 * // Basic usage with dataProvider and Resources
 * import { Admin } from "@/components/admin";
 * import { Resource } from 'ra-core';
 * import simpleRestProvider from 'ra-data-simple-rest';
 *
 * const App = () => (
 *   <Admin dataProvider={simpleRestProvider('http://path.to.my.api')}>
 *     <Resource name="posts" list={PostList} />
 *   </Admin>
 * );
 *
 * @example
 * // With authentication and i18n
 * <Admin
 *   dataProvider={dataProvider}
 *   authProvider={authProvider}
 *   i18nProvider={i18nProvider}
 * >
 *   <Resource name="posts" list={PostList} edit={PostEdit} />
 * </Admin>
 *
 * @example
 * // With a named theme palette
 * import { Admin, radiantTheme } from "@/components/admin";
 *
 * const App = () => (
 *   <Admin dataProvider={dataProvider} theme={radiantTheme}>
 *     <Resource name="posts" list={PostList} />
 *   </Admin>
 * );
 *
 * @example
 * // With distinct light and dark themes
 * import { Admin, nanoTheme, bwTheme } from "@/components/admin";
 *
 * const App = () => (
 *   <Admin
 *     dataProvider={dataProvider}
 *     lightTheme={nanoTheme}
 *     darkTheme={bwTheme}
 *   >
 *     <Resource name="posts" list={PostList} />
 *   </Admin>
 * );
 */
export const Admin = (props: AdminProps) => {
  const {
    accessDenied,
    authCallbackPage = AuthCallback,
    authenticationError,
    authProvider,
    basename,
    catchAll = NotFound,
    children,
    dashboard,
    dataProvider,
    disableTelemetry,
    error,
    i18nProvider = defaultI18nProvider,
    layout = Layout,
    loading,
    loginPage = LoginPage,
    queryClient,
    ready = Ready,
    requireAuth,
    store = defaultStore,
    theme,
    lightTheme,
    darkTheme,
    title = "Shadcn Admin",
  } = props;
  return (
    <AdminContext
      authProvider={authProvider}
      basename={basename}
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      queryClient={queryClient}
      store={store}
    >
      <AdminUI
        accessDenied={accessDenied}
        authCallbackPage={authCallbackPage}
        authenticationError={authenticationError}
        catchAll={catchAll}
        dashboard={dashboard}
        disableTelemetry={disableTelemetry}
        error={error}
        layout={layout}
        loading={loading}
        loginPage={loginPage}
        ready={ready}
        requireAuth={requireAuth}
        theme={theme}
        lightTheme={lightTheme}
        darkTheme={darkTheme}
        title={title}
      >
        {children}
      </AdminUI>
    </AdminContext>
  );
};
