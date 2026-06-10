import { Admin, Resource } from "shadcn-admin-kit/components/admin";
import { defaultTheme } from "shadcn-admin-kit/lib/themes";
import { CustomRoutes } from "ra-core";
import { Route } from "react-router";

import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { i18nProvider } from "./i18nProvider";
import { products } from "./products";
import { ProductSchemaList } from "./products/ProductSchemaList";
import { categories } from "./categories";
import { orders } from "./orders";
import { customers } from "./customers";
import { reviews } from "./reviews";
import { places } from "./map";
import { planning } from "./planning";
import { reports } from "./analytics";
import { documents } from "./workspace";
import { onboarding } from "./onboarding";
import { subscriptions } from "./subscriptions";
import { apiKeys } from "./api-keys";
import { webhooks } from "./webhooks";
import { scheduledJobs } from "./scheduled-jobs";
import { approvals } from "./approvals";
import { Dashboard } from "./dashboard/Dashboard";
import { InspectorLayout } from "./InspectorLayout";
import { componentGallery } from "./component-gallery";

function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      dashboard={Dashboard}
      theme={defaultTheme}
      layout={InspectorLayout}
    >
      <Resource {...orders} group="Sales" />
      <Resource {...products} group="Catalog" />
      <Resource {...categories} group="Catalog" />
      <Resource {...customers} group="Sales" />
      <Resource {...reviews} group="Content" />
      <Resource {...places} group="Map" />
      <Resource {...planning} group="Planning" />
      <Resource {...reports} group="Analytics" />
      <Resource {...documents} group="Workspace" />
      <Resource {...onboarding} group="System" />
      <Resource {...subscriptions} group="SaaS" />
      <Resource {...apiKeys} group="SaaS" />
      <Resource {...webhooks} group="SaaS" />
      <Resource {...scheduledJobs} group="Workflow" />
      <Resource {...approvals} group="Workflow" />
      <Resource {...componentGallery} />
      <CustomRoutes>
        <Route path="/products/schema-view" element={<ProductSchemaList />} />
      </CustomRoutes>
    </Admin>
  );
}

export default App;
