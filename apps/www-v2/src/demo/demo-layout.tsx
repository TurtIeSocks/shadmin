import { CoreAdminContext } from "shadmin-core";
import { Outlet } from "react-router";
import { dataProvider } from "./data/data-provider";
import { authProvider } from "./data/auth-provider";
import { i18nProvider } from "./data/i18n-provider";
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
      basename="/demo"
    >
      <div className="theme-demo">
        <Outlet />
      </div>
    </CoreAdminContext>
  );
}
