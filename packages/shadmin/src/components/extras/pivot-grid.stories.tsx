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
import { PivotGrid } from "@/components/extras";
import { List } from "@/components/admin/list/list";

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  {
    allowMissing: true,
  },
);

const orders = [
  { id: 1, region: "North", status: "pending", amount: 120 },
  { id: 2, region: "North", status: "pending", amount: 80 },
  { id: 3, region: "North", status: "shipped", amount: 200 },
  { id: 4, region: "South", status: "pending", amount: 50 },
  { id: 5, region: "South", status: "shipped", amount: 300 },
  { id: 6, region: "South", status: "shipped", amount: 150 },
  { id: 7, region: "East", status: "pending", amount: 90 },
  { id: 8, region: "East", status: "delivered", amount: 400 },
  { id: 9, region: "West", status: "shipped", amount: 220 },
  { id: 10, region: "West", status: "delivered", amount: 180 },
];

const dataProvider = fakeRestDataProvider({ orders }) as DataProvider;

export default {
  title: "Extras/PivotGrid",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/orders"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="orders"
        list={() => (
          <List perPage={5000}>
            <PivotGrid
              rowField="region"
              columnField="status"
              valueField="amount"
              aggregator="sum"
            />
          </List>
        )}
        recordRepresentation="id"
      />
    </Admin>
  </TestMemoryRouter>
);

export const Count = () => (
  <TestMemoryRouter initialEntries={["/orders"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="orders"
        list={() => (
          <List perPage={5000}>
            <PivotGrid
              rowField="region"
              columnField="status"
              aggregator="count"
            />
          </List>
        )}
        recordRepresentation="id"
      />
    </Admin>
  </TestMemoryRouter>
);

export const ExplicitData = () => (
  <TestMemoryRouter initialEntries={["/explicit"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="explicit"
        list={() => (
          <div className="p-4">
            <PivotGrid
              data={orders}
              rowField="region"
              columnField="status"
              valueField="amount"
              aggregator="avg"
              formatter={(v) => `$${v.toFixed(2)}`}
            />
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);
