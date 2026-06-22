import {
  CoreAdminContext,
  ResourceDefinitionContextProvider,
} from "shadmin-core";
import { Outlet } from "react-router";
import { dataProvider } from "./data/data-provider";
import { authProvider } from "./data/auth-provider";
import { i18nProvider } from "./data/i18n-provider";
import { resourceDefinitions } from "./app/resources";
import "./demo-theme.css";

// CoreAdminContext is safe inside React Router framework mode:
// AdminRouter (used internally by CoreAdminContext) calls useInRouterContext()
// and skips creating a new router when one is already present. Only the
// providers (QueryClient, Store, Auth, DataProvider, I18n, Notifications,
// ResourceDefinitions) are mounted — no router nesting occurs.
export default function DemoLayout() {
  return (
    <CoreAdminContext
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      // The ra-core resource app is mounted at /demo/app (see routes.ts), so
      // basename must match — otherwise createPath() links (Edit/Show buttons,
      // DataTable row links) resolve to /demo/<resource>/<id> and 404. Login is
      // reached by explicit navigate(), not basename, so it's unaffected.
      basename="/demo/app"
    >
      {/* Register resource definitions (recordRepresentation, hasList, …) so
          References resolve to a name instead of `#<id>`. Nested inside
          CoreAdminContext's own (empty) provider, so these win. */}
      <ResourceDefinitionContextProvider definitions={resourceDefinitions}>
        <div className="theme-demo">
          <Outlet />
        </div>
      </ResourceDefinitionContextProvider>
    </CoreAdminContext>
  );
}
