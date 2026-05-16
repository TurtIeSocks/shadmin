import { Admin, defaultTheme, Resource } from "@/components/admin";

import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { i18nProvider } from "./i18nProvider";
import { products } from "./products";
import { categories } from "./categories";
import { orders } from "./orders";
import { customers } from "./customers";
import { reviews } from "./reviews";
import { places } from "./map";
import { planning } from "./planning";
import { reports } from "./analytics";
import { documents } from "./workspace";
import { onboarding } from "./onboarding";
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
      <Resource {...componentGallery} />
    </Admin>
  );
}

export default App;
