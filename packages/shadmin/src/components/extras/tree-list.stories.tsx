import {
  type DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { Admin } from "@/components/admin";
import { TreeList } from "@/components/extras";
import { List } from "@/components/admin/list";

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const data = {
  categories: [
    { id: 1, name: "Electronics", parent_id: null },
    { id: 2, name: "Phones", parent_id: 1 },
    { id: 3, name: "Laptops", parent_id: 1 },
    { id: 4, name: "Gaming Laptops", parent_id: 3 },
    { id: 5, name: "Office Laptops", parent_id: 3 },
    { id: 6, name: "Apparel", parent_id: null },
    { id: 7, name: "Shoes", parent_id: 6 },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;

export default {
  title: "Extras/TreeList",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/categories"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="categories"
        list={() => (
          <List perPage={1000}>
            <TreeList
              parentSource="parent_id"
              titleSource="name"
              defaultExpanded
            />
          </List>
        )}
        recordRepresentation="name"
      />
    </Admin>
  </TestMemoryRouter>
);
