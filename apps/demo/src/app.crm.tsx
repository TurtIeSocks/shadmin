import { Admin, Resource } from "shadmin/components/admin";
import { CustomRoutes } from "ra-core";
import { Route } from "react-router";

import { dataProvider } from "./data-provider";
import { authProvider } from "./auth-provider";
import { i18nProvider } from "./i18n-provider";
import { products } from "./products";
import { ProductSchemaList } from "./products/product-schema-list";
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
import { Dashboard } from "./dashboard/dashboard";
import { InspectorLayout } from "./inspector-layout";
import { componentGallery } from "./component-gallery";

function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      dashboard={Dashboard}
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
