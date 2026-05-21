import {
  CoreAdminUI,
  type CoreAdminUIProps,
  CoreAdminContext,
  type CoreAdminContextProps,
  type CoreAdminProps,
  localStorageStore,
} from "ra-core";
import { useEffect } from "react";
import { i18nProvider as defaultI18nProvider } from "@/lib/i18n-provider";
import { Layout } from "@/components/admin/layout";
import { LoginPage } from "@/components/admin/login-page";
import { NotFound } from "@/components/admin/not-found";
import { Ready } from "@/components/admin/ready";
import { ThemeProvider } from "@/components/admin/theme-provider";
import type { AdminTheme } from "@/lib/themes/theme-types";
import { AuthCallback } from "@/components/admin/auth-callback";

/**
 * Props accepted by the `<Admin>` component on top of ra-core's `CoreAdminProps`.
 *
 * The shadcn-admin-kit extension adds the `theme` / `lightTheme` / `darkTheme`
 * trio so a named {@link AdminTheme} palette can be selected at the root.
 */
interface AdminProps extends CoreAdminProps {
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

/**
 * Props accepted by the {@link AdminContext} component. Identical to ra-core's
 * `CoreAdminContextProps` — re-exported so callers composing `<AdminContext>`
 * and `<AdminUI>` manually don't need to import from ra-core directly.
 */
type AdminContextProps = CoreAdminContextProps;

/**
 * Props accepted by the {@link AdminUI} component.
 */
interface AdminUIProps extends CoreAdminUIProps {
  theme?: AdminTheme;
  lightTheme?: AdminTheme;
  darkTheme?: AdminTheme;
}

const defaultStore = localStorageStore();

/**
 * Provider half of `<Admin>`.
 *
 * Wraps `CoreAdminContext` and applies shadcn-admin-kit's default `store`
 * and `i18nProvider`. Use this directly when you need to interleave a
 * context-providing wrapper (for example the `<CommandMenu>` palette from
 * `@/components/extras/command-menu`) between the data providers and the
 * routed UI:
 *
 * @example
 * import {
 *   AdminContext,
 *   AdminUI,
 *   Resource,
 * } from "@/components/admin";
 * import { CommandMenu } from "@/components/extras/command-menu";
 *
 * const App = () => (
 *   <AdminContext dataProvider={dataProvider}>
 *     <CommandMenu>
 *       <AdminUI>
 *         <Resource name="posts" />
 *       </AdminUI>
 *     </CommandMenu>
 *   </AdminContext>
 * );
 */
function AdminContext({
  i18nProvider = defaultI18nProvider,
  store = defaultStore,
  ...rest
}: AdminContextProps) {
  return (
    <CoreAdminContext i18nProvider={i18nProvider} store={store} {...rest} />
  );
}

/**
 * UI half of `<Admin>`.
 *
 * Wraps `CoreAdminUI` with the {@link ThemeProvider} and the shadcn-admin-kit
 * default pages (login, not-found, ready, auth-callback). Telemetry pings are
 * emitted from here in production builds unless `disableTelemetry` is set.
 *
 * Must be rendered inside an {@link AdminContext}.
 */
function AdminUI(props: AdminUIProps) {
  const {
    authCallbackPage = AuthCallback,
    catchAll = NotFound,
    darkTheme,
    disableTelemetry = false,
    layout = Layout,
    lightTheme,
    loginPage = LoginPage,
    ready = Ready,
    theme,
    title = "Shadcn Admin",
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
        authCallbackPage={authCallbackPage}
        catchAll={catchAll}
        disableTelemetry // Disable telemetry in CoreAdminUI to avoid double logging
        layout={layout}
        loginPage={loginPage}
        ready={ready}
        title={title}
        {...rest}
      />
    </ThemeProvider>
  );
}

/**
 * Root component of a shadcn-admin-kit application.
 *
 * Creates context providers to allow its children to access the app configuration.
 * Renders the main routes and layout, and delegates content area rendering to Resource children.
 * Composes {@link AdminContext} and {@link AdminUI} to provide a complete admin interface.
 *
 * Reach for the lower-level {@link AdminContext} + {@link AdminUI} pair when
 * you need to inject a wrapping component (such as the cmd+K
 * `<CommandMenu>` palette from `@/components/extras/command-menu`) between
 * the providers and the routed UI.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/admin/ Admin documentation}
 *
 * @example
 * // Basic usage with dataProvider and Resources
 * import { Admin, Resource } from "@/components/admin";
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
 * import { Admin } from "@/components/admin";
 * import { radiantTheme } from "@/lib/themes";
 *
 * const App = () => (
 *   <Admin dataProvider={dataProvider} theme={radiantTheme}>
 *     <Resource name="posts" list={PostList} />
 *   </Admin>
 * );
 *
 * @example
 * // With distinct light and dark themes
 * import { Admin } from "@/components/admin";
 * import { nanoTheme, bwTheme } from "@/lib/themes";
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
function Admin(props: AdminProps) {
  const {
    accessDenied,
    authCallbackPage,
    authenticationError,
    authProvider,
    basename,
    catchAll,
    children,
    dashboard,
    dataProvider,
    disableTelemetry,
    error,
    i18nProvider,
    layout,
    loading,
    loginPage,
    queryClient,
    ready,
    requireAuth,
    store,
    theme,
    lightTheme,
    darkTheme,
    title,
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
}

export {
  Admin,
  AdminContext,
  AdminUI,
  type AdminProps,
  type AdminContextProps,
  type AdminUIProps,
};
